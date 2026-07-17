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

// Guarda o contexto da rodada atual para o botão "Editar palpite" poder reabrir o formulário
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

async function initPalpite() {
  const { name, token, round: roundParam } = getUrlParams();
  const participant = name && token ? findParticipant(name, token) : null;
  const app = document.getElementById('palpite-app');

  if (!participant) { app.innerHTML = renderInvalidLink(); return; }

  let round, existingEntry;

  if (roundParam && CONFIG.forms[roundParam]) {
    // Link direto para uma rodada específica (?r=)
    round = roundParam;
    existingEntry = await findBetEntry(participant, round);
  } else {
    // Link padrão: percorre as rodadas abertas e para na primeira sem palpite ainda
    const bettable = getBettableRounds();
    round = null;
    existingEntry = null;
    for (const r of bettable) {
      const entry = await findBetEntry(participant, r);
      round = r;
      existingEntry = entry;
      if (!entry) break; // achou uma rodada aberta ainda sem palpite — para aqui
    }
    if (!round) round = CONFIG.currentRound; // nenhuma rodada aberta agora
  }

  const scoring  = CONFIG.scoring[round];
  const form     = CONFIG.forms[round];
  const matches  = CONFIG.matches[round] || [];
  const deadline = new Date(form.deadline);
  const isOpen   = deadline > new Date();

  document.title = `Palpite — ${scoring.label} · Bolão Bizinhos`;
  ctx = { round, scoring, matches, deadline, isOpen, participant };

  if (existingEntry) {
    app.innerHTML = renderSuccess(participant.name, round, existingEntry.jogos, !isOpen);
    setupShareButtons(participant.name, round, existingEntry.jogos);
    return;
  }

  if (!isOpen) { app.innerHTML = renderClosed(scoring); return; }

  app.innerHTML = renderForm(scoring, matches, deadline, participant);
  setupListeners(round, matches, participant);
}

/* ─── Editar palpite já enviado ─────────────────────────────────── */

function editarPalpite(jogosEncoded) {
  if (!ctx || !ctx.isOpen) return;
  const jogos = JSON.parse(decodeURIComponent(jogosEncoded));
  const prefill = {};
  jogos.forEach(j => { prefill[j.id] = j; });
  const app = document.getElementById('palpite-app');
  app.innerHTML = renderForm(ctx.scoring, ctx.matches, ctx.deadline, ctx.participant, prefill);
  setupListeners(ctx.round, ctx.matches, ctx.participant);
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

/* ─── Render: form ──────────────────────────────────────────────── */

function renderForm(scoring, matches, deadline, participant, prefill) {
  const dlStr = deadline.toLocaleDateString('pt-BR', { day:'2-digit', month:'long' })
              + ' às ' + deadline.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });

  // Nome travado — mostra apenas o participante autenticado
  const namesHtml = `
    <div class="name-locked">
      <span class="name-locked-avatar">${participant.emoji}</span>
      <span class="name-locked-name">${participant.name}</span>
      <span class="name-locked-badge">🔒 Identificado</span>
    </div>
    <input type="hidden" name="participante" value="${participant.name}">
  `;

  const matchesHtml = matches.map((m, i) => {
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

  return `
    <section class="bet-hero">
      <div class="container">
        <a href="index.html" class="bet-back">← Voltar ao site</a>
        <div class="bet-eyebrow">Copa do Mundo 2026</div>
        <h1 class="bet-title">${scoring.label}</h1>
        <p class="bet-deadline">⏰ Prazo: ${dlStr}</p>
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

          <div class="bet-block">
            <h2 class="bet-block-title">⚽ ${scoring.label} — ${matches.length} jogos</h2>
            <div class="bet-grid">${matchesHtml}</div>
          </div>

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

/* ─── Render: success ───────────────────────────────────────────── */

function renderSuccess(nome, round, jogos, isPrazoEncerrado) {
  const scoring = CONFIG.scoring[round];
  const summaryRows = jogos.map((j, i) => `
    <div class="summary-row">
      <span class="summary-idx">Jogo ${i + 1}</span>
      <span class="summary-match">${j.teamA} <strong>${j.scoreA}</strong> × <strong>${j.scoreB}</strong> ${j.teamB}</span>
      <span class="summary-adv">→ <strong>${j.avanca}</strong> avança</span>
    </div>
  `).join('');

  const titulo = isPrazoEncerrado
    ? '📋 Seus palpites'
    : '🏆 Palpite enviado!';
  const subtitulo = isPrazoEncerrado
    ? `Palpites registrados de <strong>${nome}</strong> — ${scoring.label}`
    : `Boa sorte, <strong>${nome}</strong>! Que seus palpites sejam certeiros 🎯`;

  return `
    <section class="bet-hero bet-hero--center">
      <div class="container">
        <a href="index.html" class="bet-back">← Voltar ao site</a>
        <div class="success-trophy">${isPrazoEncerrado ? '📋' : '🏆'}</div>
        <h1 class="bet-title">${titulo}</h1>
        <p class="bet-deadline">${subtitulo}</p>
      </div>
    </section>

    <section class="bet-section">
      <div class="container">
        <div class="success-card">
          <h2 class="success-card-title">✅ ${scoring.label} — ${nome}</h2>
          <div class="summary-list">${summaryRows}</div>
        </div>

        ${isPrazoEncerrado ? '' : `
        <div style="text-align:center;margin-bottom:20px">
          <button class="btn btn-outline" id="btn-editar" onclick="editarPalpite('${encodeURIComponent(JSON.stringify(jogos))}')">
            ✏️ Editar palpite
          </button>
        </div>
        `}

        <div class="share-wrap">
          <p class="share-label">Compartilhe seus palpites no grupo:</p>
          <div class="share-btns">
            <button class="btn btn-gold" id="btn-whatsapp" onclick="sharePalpites('${nome}', '${round}')">
              📱 Enviar no WhatsApp
            </button>
            <button class="btn btn-outline" id="btn-copy" onclick="copyPalpites('${nome}', '${round}')">
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

function formatPalpitesText(nome, round, jogos) {
  const scoring = CONFIG.scoring[round];
  const linhas = jogos.map((j, i) =>
    `Jogo ${i+1}: ${j.teamA} ${j.scoreA}×${j.scoreB} ${j.teamB} → ${j.avanca} avança`
  ).join('\n');
  return `🏆 Bolão Copa Bizinhos 2026\n👤 ${nome} — ${scoring.label}\n\n${linhas}`;
}

function copyPalpites(nome, round) {
  const saved = localStorage.getItem(`bolao_${round}_${nome}`);
  if (!saved) return;
  const { jogos } = JSON.parse(saved);
  const text = formatPalpitesText(nome, round, jogos);
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

function sharePalpites(nome, round) {
  const saved = localStorage.getItem(`bolao_${round}_${nome}`);
  if (!saved) return;
  const { jogos } = JSON.parse(saved);
  const text = formatPalpitesText(nome, round, jogos);
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function setupShareButtons(nome, round, jogos) {
  // botões já têm onclick inline no HTML, nada extra necessário
}

/* ─── Listeners ─────────────────────────────────────────────────── */

function setupListeners(round, matches, participant) {
  const form = document.getElementById('bet-form');
  if (!form) return;

  // Rastreia quais seleções foram feitas automaticamente pelo poller
  // (distingue de seleções manuais do usuário)
  const autoSelected = new Set();

  // Reflete visualmente seleções pré-preenchidas (edição de palpite existente)
  matches.forEach(m => {
    const current = form.querySelector(`input[name="${m.id}-adv"]:checked`);
    if (current) highlightPills(m.id, current.value);
  });

  // Verificador contínuo: a cada 300ms sincroniza "quem avança" com os placares
  setInterval(() => {
    matches.forEach(m => {
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
    handleSubmit(form, round, matches, participant);
  });
}

function highlightPills(matchId, winner) {
  ['A','B'].forEach(side => {
    const pill = document.getElementById(`rp-${matchId}-${side.toLowerCase()}`);
    if (pill) pill.classList.toggle('selected', winner !== null && side === winner);
  });
}

/* ─── Submit ────────────────────────────────────────────────────── */

function handleSubmit(form, round, matches, participant) {
  const nome = participant.name;

  // 2. Validate all matches (campo vazio = 0, só "quem avança" é obrigatório)
  let errors = [];
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
    if (hasError) errors.push(i + 1);
  });

  if (errors.length) {
    alert(`Atenção: selecione "quem avança" nos jogos ${errors.join(', ')}.`);
    document.getElementById(`bet-card-${matches[errors[0]-1].id}`)
            .scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // 3. Collect palpites (campo vazio = 0)
  const jogos = matches.map(m => {
    const advVal = form.querySelector(`input[name="${m.id}-adv"]:checked`).value;
    const rawA = form.querySelector(`#sc-${m.id}-a`).value.trim();
    const rawB = form.querySelector(`#sc-${m.id}-b`).value.trim();
    return {
      id:     m.id,
      teamA:  m.teamA,
      teamB:  m.teamB,
      scoreA: rawA === '' ? 0 : parseInt(rawA),
      scoreB: rawB === '' ? 0 : parseInt(rawB),
      avanca: advVal === 'A' ? m.teamA : m.teamB,
    };
  });

  // 4. Salva localmente e no GitHub
  const entry = { nome, round, timestamp: new Date().toISOString(), jogos };
  localStorage.setItem(`bolao_${round}_${nome}`, JSON.stringify(entry));
  savePalpiteGitHub(nome, round, jogos);

  // 5. Se há outra rodada aberta ainda sem palpite, encadeia para ela; senão mostra sucesso
  const proxima = getBettableRounds().find(r => r !== round && !localStorage.getItem(`bolao_${r}_${nome}`));
  if (proxima) {
    goToRound(proxima, participant, round);
  } else {
    document.getElementById('palpite-app').innerHTML = renderSuccess(nome, round, jogos, false);
    setupShareButtons(nome, round, jogos);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToRound(round, participant, rodadaAnterior) {
  const scoring  = CONFIG.scoring[round];
  const form     = CONFIG.forms[round];
  const matches  = CONFIG.matches[round] || [];
  const deadline = new Date(form.deadline);
  ctx = { round, scoring, matches, deadline, isOpen: true, participant };
  document.title = `Palpite — ${scoring.label} · Bolão Bizinhos`;

  const banner = rodadaAnterior ? `
    <div class="bet-info-box" style="margin:0 auto 20px;max-width:900px">
      ✅ <strong>${CONFIG.scoring[rodadaAnterior].label}</strong> registrado! Agora falta a <strong>${scoring.label}</strong> 👇
    </div>
  ` : '';

  document.getElementById('palpite-app').innerHTML = banner + renderForm(scoring, matches, deadline, participant);
  setupListeners(round, matches, participant);
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

function shakeBlock(msg) {
  alert(msg);
}

/* ─── Boot ──────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', initPalpite);
