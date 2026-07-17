/* ─── Utilities ─────────────────────────────────────────────────── */

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const [, m, d] = dateStr.split('-');
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]}`;
}

/* ─── Token auth ────────────────────────────────────────────────── */

function getUrlParams() {
  const p = new URLSearchParams(window.location.search);
  return { name: p.get('p'), token: p.get('t'), round: p.get('r') };
}

function findParticipant(name, token) {
  return CONFIG.participants.find(p => p.name === name && p.token === token) || null;
}

function renderInvalidLink() {
  return `
    <section class="bet-hero bet-hero--center">
      <div class="container">
        <a href="index.html" class="bet-back">← Voltar ao site</a>
        <div style="font-size:3rem;margin:16px 0">🔒</div>
        <h1 class="bet-title">Link inválido</h1>
        <p style="color:var(--grey);max-width:360px;margin:0 auto 28px">
          Use o link personalizado que o admin enviou para você no WhatsApp.
          Cada participante tem um link único — não é possível usar o link de outra pessoa.
        </p>
        <a href="index.html" class="btn btn-outline">Voltar ao site</a>
      </div>
    </section>
  `;
}

/* ─── Init ──────────────────────────────────────────────────────── */

// Guarda o contexto atual (rodadas exibidas + participante) para os botões de editar/compartilhar
let ctx = null;

// Rodadas com chaveamento definido, dentro do prazo e sem resultado ainda — podem ser apostadas
function getBettableRounds() {
  return CONFIG.roundOrder.filter(r => {
    const matches = CONFIG.matches[r] || [];
    if (!matches.length) return false;
    const hasRealTeams = matches.every(m =>
      !/^(Venc\.|Perd\.)/.test(m.teamA) && m.teamA !== 'A definir' &&
      !/^(Venc\.|Perd\.)/.test(m.teamB) && m.teamB !== 'A definir'
    );
    const concluded = matches.every(m => m.scoreA !== null && m.scoreB !== null);
    const form = CONFIG.forms[r];
    const open = form && new Date(form.deadline) > new Date();
    return hasRealTeams && !concluded && open;
  });
}

function isRoundOpen(round) {
  const form = CONFIG.forms[round];
  return !!form && new Date(form.deadline) > new Date();
}

async function findBetEntry(participant, round) {
  const savedKey = `bolao_${round}_${participant.name}`;
  const saved    = localStorage.getItem(savedKey);
  if (saved) {
    try { return JSON.parse(saved); } catch(e) { localStorage.removeItem(savedKey); }
  }
  const remote = await fetchPalpiteGitHub(participant.name, round);
  if (remote) { localStorage.setItem(savedKey, JSON.stringify(remote)); return remote; }
  return null;
}

function keyByMatchId(jogos) {
  const map = {};
  jogos.forEach(j => { map[j.id] = j; });
  return map;
}

async function initPalpite() {
  const { name, token, round: roundParam } = getUrlParams();
  const participant = name && token ? findParticipant(name, token) : null;
  const app = document.getElementById('palpite-app');

  if (!participant) { app.innerHTML = renderInvalidLink(); return; }

  // Link direto para uma rodada específica (?r=) ou, no padrão, todas as rodadas
  // com chaveamento definido e dentro do prazo aparecem juntas na mesma página
  let rounds;
  if (roundParam && CONFIG.forms[roundParam]) {
    rounds = [roundParam];
  } else {
    const bettable = getBettableRounds();
    rounds = bettable.length ? bettable : [CONFIG.currentRound];
  }

  document.title = rounds.length === 1
    ? `Palpite — ${CONFIG.scoring[rounds[0]].label} · Bolão Bizinhos`
    : `Palpite — Bolão Bizinhos`;

  const entryByRound = {};
  for (const r of rounds) {
    entryByRound[r] = await findBetEntry(participant, r);
  }

  ctx = { rounds, participant };

  const allAnswered = rounds.every(r => entryByRound[r]);
  const anyOpen     = rounds.some(r => isRoundOpen(r));

  if (allAnswered) {
    const jogosByRound = {};
    rounds.forEach(r => { jogosByRound[r] = entryByRound[r].jogos; });
    app.innerHTML = renderMultiSuccess(participant.name, rounds, jogosByRound, { justSubmitted: false, anyOpen });
    return;
  }

  if (!anyOpen) { app.innerHTML = renderClosed(CONFIG.scoring[rounds[0]]); return; }

  const prefillByRound = {};
  rounds.forEach(r => { if (entryByRound[r]) prefillByRound[r] = keyByMatchId(entryByRound[r].jogos); });

  app.innerHTML = renderMultiForm(rounds, participant, prefillByRound);
  setupListenersMulti(rounds, participant);
}

/* ─── Editar palpite já enviado ─────────────────────────────────── */

function editarMulti(dataEncoded) {
  if (!ctx) return;
  const data = JSON.parse(decodeURIComponent(dataEncoded)); // [{ round, jogos }, ...]
  const prefillByRound = {};
  data.forEach(d => { prefillByRound[d.round] = keyByMatchId(d.jogos); });
  const app = document.getElementById('palpite-app');
  app.innerHTML = renderMultiForm(ctx.rounds, ctx.participant, prefillByRound);
  setupListenersMulti(ctx.rounds, ctx.participant);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function fetchPalpiteGitHub(nome, round) {
  const { repo } = CONFIG.github;
  if (!repo) return null;
  const path = `data/palpite-${round}-${nome.toLowerCase().replace(/\s/g,'-')}.json`;
  const url  = `https://raw.githubusercontent.com/${repo}/main/${path}?t=${Date.now()}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch(e) { return null; }
}

/* ─── Render: cards de jogo (compartilhado entre rodadas) ───────── */

function renderMatchesHtml(matches, prefill) {
  return matches.map((m, i) => {
    const pre = prefill && prefill[m.id];
    const preA = pre ? pre.scoreA : '';
    const preB = pre ? pre.scoreB : '';
    const preAdv = pre ? (pre.avanca === m.teamA ? 'A' : (pre.avanca === m.teamB ? 'B' : null)) : null;
    return `
    <div class="bet-card" id="bet-card-${m.id}">
      <div class="bet-card__head">
        <span class="bet-num">Jogo ${i + 1}</span>
        <span class="bet-date">${fmtDate(m.date)} · ${m.time}</span>
      </div>
      <div class="bet-venue">${m.venue}</div>

      <div class="bet-score-row">
        <span class="bet-team-name">${m.teamA}</span>
        <input class="bet-input" type="text" inputmode="numeric" pattern="[0-9]*"
               id="sc-${m.id}-a" name="${m.id}-a"
               maxlength="2" placeholder="0" value="${preA}"
               required autocomplete="off"
               data-match="${m.id}">
        <span class="bet-sep">×</span>
        <input class="bet-input" type="text" inputmode="numeric" pattern="[0-9]*"
               id="sc-${m.id}-b" name="${m.id}-b"
               maxlength="2" placeholder="0" value="${preB}"
               required autocomplete="off"
               data-match="${m.id}">
        <span class="bet-team-name bet-team-name--right">${m.teamB}</span>
      </div>

      <div class="bet-advance">
        <span class="bet-advance-lbl">Quem avança?</span>
        <div class="bet-radios">
          <label class="radio-pill" id="rp-${m.id}-a">
            <input type="radio" name="${m.id}-adv" value="A" required ${preAdv === 'A' ? 'checked' : ''}>
            <span>${m.teamA}</span>
          </label>
          <label class="radio-pill" id="rp-${m.id}-b">
            <input type="radio" name="${m.id}-adv" value="B" ${preAdv === 'B' ? 'checked' : ''}>
            <span>${m.teamB}</span>
          </label>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

/* ─── Render: formulário (uma ou mais rodadas juntas) ───────────── */

function renderMultiForm(rounds, participant, prefillByRound) {
  const heroTitle = rounds.length === 1 ? CONFIG.scoring[rounds[0]].label : 'Seus Palpites';

  const deadlinesHtml = rounds.map(r => {
    const dl = new Date(CONFIG.forms[r].deadline);
    const dlStr = dl.toLocaleDateString('pt-BR', { day:'2-digit', month:'long' })
                + ' às ' + dl.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
    return `⏰ <strong>${CONFIG.scoring[r].label}</strong>: até ${dlStr}`;
  }).join('<br>');

  const namesHtml = `
    <div class="name-locked">
      <span class="name-locked-avatar">${participant.emoji}</span>
      <span class="name-locked-name">${participant.name}</span>
      <span class="name-locked-badge">🔒 Identificado</span>
    </div>
    <input type="hidden" name="participante" value="${participant.name}">
  `;

  const blocksHtml = rounds.map(round => {
    const scoring = CONFIG.scoring[round];
    const matches = CONFIG.matches[round] || [];
    const prefill = prefillByRound[round];
    return `
      <div class="bet-block">
        <h2 class="bet-block-title">⚽ ${scoring.label} — ${matches.length} jogo${matches.length > 1 ? 's' : ''}</h2>
        <div class="bet-grid">${renderMatchesHtml(matches, prefill)}</div>
      </div>
    `;
  }).join('');

  return `
    <section class="bet-hero">
      <div class="container">
        <a href="index.html" class="bet-back">← Voltar ao site</a>
        <div class="bet-eyebrow">Copa do Mundo 2026</div>
        <h1 class="bet-title">${heroTitle}</h1>
        <p class="bet-deadline">${deadlinesHtml}</p>
      </div>
    </section>

    <section class="bet-section">
      <div class="container">
        <form id="bet-form" novalidate>

          <div class="bet-block">
            <h2 class="bet-block-title">👤 Apostando como</h2>
            ${namesHtml}
          </div>

          <div class="bet-info-box">
            <strong>📋 Como palpitar:</strong> informe o placar dos <strong>90 minutos</strong> e quem avança em cada jogo.
            Se você acha que vai para prorrogação ou pênaltis, coloque o placar empatado e escolha quem passa.
          </div>

          ${blocksHtml}

          <div class="bet-submit-wrap">
            <button type="submit" class="btn btn-gold bet-submit-btn">
              ⚽ Enviar Meus Palpites
            </button>
            <p class="bet-submit-note">Você pode reenviar o formulário até o prazo</p>
          </div>

        </form>
      </div>
    </section>
  `;
}

/* ─── Render: closed ────────────────────────────────────────────── */

function renderClosed(scoring) {
  return `
    <section class="bet-hero bet-hero--center">
      <div class="container">
        <a href="index.html" class="bet-back">← Voltar ao site</a>
        <div style="font-size:3.5rem;margin:16px 0">🔒</div>
        <h1 class="bet-title">${scoring.label}</h1>
        <p style="color:var(--grey);margin-bottom:28px">O prazo de palpites desta rodada foi encerrado.</p>
        <a href="index.html#ranking" class="btn btn-gold">Ver Ranking</a>
      </div>
    </section>
  `;
}

/* ─── Render: success (uma ou mais rodadas juntas) ──────────────── */

function renderMultiSuccess(nome, rounds, jogosByRound, opts) {
  const { justSubmitted, anyOpen } = opts;

  const titulo = justSubmitted ? '🏆 Palpite enviado!' : '📋 Seus palpites';
  const subtitulo = justSubmitted
    ? `Boa sorte, <strong>${nome}</strong>! Que seus palpites sejam certeiros 🎯`
    : `Palpites registrados de <strong>${nome}</strong>`;

  const blocksHtml = rounds.map(round => {
    const scoring = CONFIG.scoring[round];
    const jogos   = jogosByRound[round];
    const summaryRows = jogos.map((j, i) => `
      <div class="summary-row">
        <span class="summary-idx">Jogo ${i + 1}</span>
        <span class="summary-match">${j.teamA} <strong>${j.scoreA}</strong> × <strong>${j.scoreB}</strong> ${j.teamB}</span>
        <span class="summary-adv">→ <strong>${j.avanca}</strong> avança</span>
      </div>
    `).join('');
    return `
      <div class="success-card">
        <h2 class="success-card-title">✅ ${scoring.label} — ${nome}</h2>
        <div class="summary-list">${summaryRows}</div>
      </div>
    `;
  }).join('');

  const editData = encodeURIComponent(JSON.stringify(rounds.map(r => ({ round: r, jogos: jogosByRound[r] }))));

  return `
    <section class="bet-hero bet-hero--center">
      <div class="container">
        <a href="index.html" class="bet-back">← Voltar ao site</a>
        <div class="success-trophy">${justSubmitted ? '🏆' : '📋'}</div>
        <h1 class="bet-title">${titulo}</h1>
        <p class="bet-deadline">${subtitulo}</p>
      </div>
    </section>

    <section class="bet-section">
      <div class="container">
        ${blocksHtml}

        ${anyOpen ? `
        <div style="text-align:center;margin-bottom:20px">
          <button class="btn btn-outline" id="btn-editar" onclick="editarMulti('${editData}')">
            ✏️ Editar palpites
          </button>
        </div>
        ` : ''}

        <div class="share-wrap">
          <p class="share-label">Compartilhe seus palpites no grupo:</p>
          <div class="share-btns">
            <button class="btn btn-gold" id="btn-whatsapp" onclick="shareMulti('${nome}')">
              📱 Enviar no WhatsApp
            </button>
            <button class="btn btn-outline" id="btn-copy" onclick="copyMulti('${nome}')">
              📋 Copiar texto
            </button>
          </div>
          <p id="copy-confirm" style="color:var(--green);margin-top:8px;font-size:0.85rem;display:none">✅ Copiado!</p>
        </div>

        <div style="text-align:center;margin-top:16px">
          <a href="index.html#ranking" class="btn btn-outline">Ver Ranking ↗</a>
        </div>
      </div>
    </section>
  `;
}

function formatMultiText(nome, rounds) {
  const blocos = rounds.map(round => {
    const saved = localStorage.getItem(`bolao_${round}_${nome}`);
    if (!saved) return '';
    const { jogos } = JSON.parse(saved);
    const scoring = CONFIG.scoring[round];
    const linhas = jogos.map((j, i) =>
      `Jogo ${i+1}: ${j.teamA} ${j.scoreA}×${j.scoreB} ${j.teamB} → ${j.avanca} avança`
    ).join('\n');
    return `📌 ${scoring.label}\n${linhas}`;
  }).filter(Boolean).join('\n\n');
  return `🏆 Bolão Copa Bizinhos 2026\n👤 ${nome}\n\n${blocos}`;
}

function copyMulti(nome) {
  if (!ctx) return;
  const text = formatMultiText(nome, ctx.rounds);
  navigator.clipboard.writeText(text).then(() => {
    const el = document.getElementById('copy-confirm');
    if (el) { el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 3000); }
  }).catch(() => {
    // fallback para browsers que não suportam clipboard API
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    const el = document.getElementById('copy-confirm');
    if (el) { el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 3000); }
  });
}

function shareMulti(nome) {
  if (!ctx) return;
  const text = formatMultiText(nome, ctx.rounds);
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

/* ─── Listeners ─────────────────────────────────────────────────── */

function setupListenersMulti(rounds, participant) {
  const form = document.getElementById('bet-form');
  if (!form) return;

  const allMatches = rounds.flatMap(r => CONFIG.matches[r] || []);

  // Rastreia quais seleções foram feitas automaticamente pelo poller
  // (distingue de seleções manuais do usuário)
  const autoSelected = new Set();

  // Reflete visualmente seleções pré-preenchidas (edição de palpite existente)
  allMatches.forEach(m => {
    const current = form.querySelector(`input[name="${m.id}-adv"]:checked`);
    if (current) highlightPills(m.id, current.value);
  });

  // Verificador contínuo: a cada 300ms sincroniza "quem avança" com os placares
  setInterval(() => {
    allMatches.forEach(m => {
      const inA = document.getElementById(`sc-${m.id}-a`);
      const inB = document.getElementById(`sc-${m.id}-b`);
      if (!inA || !inB) return;
      const valA = inA.value.trim();
      const valB = inB.value.trim();
      if (valA === '' && valB === '') return;
      const a = valA === '' ? 0 : parseInt(valA, 10);
      const b = valB === '' ? 0 : parseInt(valB, 10);
      if (isNaN(a) || isNaN(b) || a < 0 || b < 0) return;

      if (a !== b) {
        const winner = a > b ? 'A' : 'B';
        const current = form.querySelector(`input[name="${m.id}-adv"]:checked`);
        if (!current || current.value !== winner) {
          const radio = form.querySelector(`input[name="${m.id}-adv"][value="${winner}"]`);
          if (radio) {
            radio.checked = true;
            highlightPills(m.id, winner);
            autoSelected.add(m.id); // marca como auto-selecionado
          }
        }
      } else {
        // Empate: só limpa se foi o poller que tinha selecionado (não o usuário)
        if (autoSelected.has(m.id)) {
          const current = form.querySelector(`input[name="${m.id}-adv"]:checked`);
          if (current) {
            current.checked = false;
            highlightPills(m.id, null);
          }
          autoSelected.delete(m.id);
        }
        // Se o usuário selecionou manualmente, não toca
      }
    });
  }, 300);

  // Radio pills — clique manual: remove do autoSelected para não ser limpo pelo poller
  form.addEventListener('change', e => {
    const el = e.target;
    if (!el.matches('input[type="radio"]') || !el.name.endsWith('-adv')) return;
    const matchId = el.name.replace('-adv', '');
    autoSelected.delete(matchId); // marca como escolha manual
    highlightPills(matchId, el.value);
  });

  // Submit
  form.addEventListener('submit', e => {
    e.preventDefault();
    handleSubmitMulti(form, rounds, participant);
  });
}

function highlightPills(matchId, winner) {
  ['A','B'].forEach(side => {
    const pill = document.getElementById(`rp-${matchId}-${side.toLowerCase()}`);
    if (pill) pill.classList.toggle('selected', winner !== null && side === winner);
  });
}

/* ─── Submit ────────────────────────────────────────────────────── */

function handleSubmitMulti(form, rounds, participant) {
  const nome = participant.name;
  const jogosByRound = {};
  let errors = [];

  rounds.forEach(round => {
    const matches = CONFIG.matches[round] || [];
    const jogos = [];
    matches.forEach((m, i) => {
      const inA  = form.querySelector(`#sc-${m.id}-a`);
      const inB  = form.querySelector(`#sc-${m.id}-b`);
      const adv  = form.querySelector(`input[name="${m.id}-adv"]:checked`);
      const card = document.getElementById(`bet-card-${m.id}`);

      const sA = inA.value.trim() === '' ? 0 : parseInt(inA.value, 10);
      const sB = inB.value.trim() === '' ? 0 : parseInt(inB.value, 10);
      // Só dá erro se "quem avança" não estiver marcado
      const hasError = isNaN(sA) || isNaN(sB) || !adv;
      card.classList.toggle('bet-card--error', hasError);
      if (hasError) {
        errors.push(m.id);
      } else {
        jogos.push({
          id:     m.id,
          teamA:  m.teamA,
          teamB:  m.teamB,
          scoreA: sA,
          scoreB: sB,
          avanca: adv.value === 'A' ? m.teamA : m.teamB,
        });
      }
    });
    jogosByRound[round] = jogos;
  });

  if (errors.length) {
    alert(`Atenção: selecione "quem avança" em todos os jogos.`);
    document.getElementById(`bet-card-${errors[0]}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Salva cada rodada localmente e no GitHub
  rounds.forEach(round => {
    const jogos = jogosByRound[round];
    const entry = { nome, round, timestamp: new Date().toISOString(), jogos };
    localStorage.setItem(`bolao_${round}_${nome}`, JSON.stringify(entry));
    savePalpiteGitHub(nome, round, jogos);
  });

  const anyOpen = rounds.some(r => isRoundOpen(r));
  document.getElementById('palpite-app').innerHTML =
    renderMultiSuccess(nome, rounds, jogosByRound, { justSubmitted: true, anyOpen });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ─── GitHub como backend ────────────────────────────────────────── */

async function savePalpiteGitHub(nome, round, jogos) {
  const { token, repo } = CONFIG.github;
  if (!token) return; // não configurado ainda

  const path    = `data/palpite-${round}-${nome.toLowerCase().replace(/\s/g,'-')}.json`;
  const apiUrl  = `https://api.github.com/repos/${repo}/contents/${path}`;
  const content = JSON.stringify({ nome, round, timestamp: new Date().toISOString(), jogos }, null, 2);
  const encoded = btoa(unescape(encodeURIComponent(content)));
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept':        'application/vnd.github+json',
    'Content-Type':  'application/json',
  };

  try {
    // Verifica se arquivo já existe (para obter o sha necessário para atualizar)
    let sha;
    const check = await fetch(apiUrl, { headers });
    if (check.ok) { const f = await check.json(); sha = f.sha; }

    await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message:   `Palpite de ${nome} — ${round}`,
        content:   encoded,
        committer: { name: 'Bolão Bizinhos Bot', email: 'bolao@bizinhos.com' },
        ...(sha ? { sha } : {}),
      }),
    });
  } catch(e) { /* falha silenciosa — localStorage já salvou */ }
}

/* ─── Boot ──────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', initPalpite);
