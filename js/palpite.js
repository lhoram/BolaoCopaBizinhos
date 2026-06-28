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
  return { name: p.get('p'), token: p.get('t') };
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

function initPalpite() {
  const round    = CONFIG.currentRound;
  const scoring  = CONFIG.scoring[round];
  const form     = CONFIG.forms[round];
  const matches  = CONFIG.matches[round] || [];
  const deadline = new Date(form.deadline);
  const isOpen   = deadline > new Date();
  const app      = document.getElementById('palpite-app');

  document.title = `Palpite — ${scoring.label} · Bolão Bizinhos`;

  // Valida token da URL
  const { name, token } = getUrlParams();
  const participant = name && token ? findParticipant(name, token) : null;

  if (!participant) { app.innerHTML = renderInvalidLink(); return; }
  if (!isOpen)      { app.innerHTML = renderClosed(scoring); return; }

  app.innerHTML = renderForm(scoring, matches, deadline, participant);
  setupListeners(round, matches, participant);
}

/* ─── Render: form ──────────────────────────────────────────────── */

function renderForm(scoring, matches, deadline, participant) {
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

  const matchesHtml = matches.map((m, i) => `
    <div class="bet-card" id="bet-card-${m.id}">
      <div class="bet-card__head">
        <span class="bet-num">Jogo ${i + 1}</span>
        <span class="bet-date">${fmtDate(m.date)} · ${m.time}</span>
      </div>
      <div class="bet-venue">${m.venue}</div>

      <div class="bet-score-row">
        <span class="bet-team-name">${m.teamA}</span>
        <input class="bet-input" type="number"
               id="sc-${m.id}-a" name="${m.id}-a"
               min="0" max="20" placeholder="0"
               required autocomplete="off"
               data-match="${m.id}">
        <span class="bet-sep">×</span>
        <input class="bet-input" type="number"
               id="sc-${m.id}-b" name="${m.id}-b"
               min="0" max="20" placeholder="0"
               required autocomplete="off"
               data-match="${m.id}">
        <span class="bet-team-name bet-team-name--right">${m.teamB}</span>
      </div>

      <div class="bet-advance">
        <span class="bet-advance-lbl">Quem avança?</span>
        <div class="bet-radios">
          <label class="radio-pill" id="rp-${m.id}-a">
            <input type="radio" name="${m.id}-adv" value="A" required>
            <span>${m.teamA}</span>
          </label>
          <label class="radio-pill" id="rp-${m.id}-b">
            <input type="radio" name="${m.id}-adv" value="B">
            <span>${m.teamB}</span>
          </label>
        </div>
      </div>
    </div>
  `).join('');

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

function renderSuccess(nome, round, jogos) {
  const scoring = CONFIG.scoring[round];
  const summaryRows = jogos.map((j, i) => `
    <div class="summary-row">
      <span class="summary-idx">Jogo ${i + 1}</span>
      <span class="summary-match">${j.teamA} <strong>${j.scoreA}</strong> × <strong>${j.scoreB}</strong> ${j.teamB}</span>
      <span class="summary-adv">→ <strong>${j.avanca}</strong> avança</span>
    </div>
  `).join('');

  return `
    <section class="bet-hero bet-hero--center">
      <div class="container">
        <a href="index.html" class="bet-back">← Voltar ao site</a>
        <div class="success-trophy">🏆</div>
        <h1 class="bet-title">Palpite enviado!</h1>
        <p class="bet-deadline">Boa sorte, <strong>${nome}</strong>! Que seus palpites sejam certeiros 🎯</p>
      </div>
    </section>

    <section class="bet-section">
      <div class="container">
        <div class="success-card">
          <h2 class="success-card-title">✅ Seus palpites — ${scoring.label}</h2>
          <div class="summary-list">${summaryRows}</div>
        </div>
        <div style="text-align:center;margin-top:24px">
          <a href="index.html#ranking" class="btn btn-gold">Ver Ranking ↗</a>
        </div>
      </div>
    </section>
  `;
}

/* ─── Listeners ─────────────────────────────────────────────────── */

function setupListeners(round, matches, participant) {
  const form = document.getElementById('bet-form');
  if (!form) return;

  // Verificador contínuo: a cada 300ms sincroniza "quem avança" com os placares
  // Mais confiável que eventos isolados em mobile e quando o usuário edita valores
  setInterval(() => {
    matches.forEach(m => {
      const inA = document.getElementById(`sc-${m.id}-a`);
      const inB = document.getElementById(`sc-${m.id}-b`);
      if (!inA || !inB) return;
      const valA = inA.value.trim();
      const valB = inB.value.trim();
      if (valA === '' || valB === '') return;
      const a = parseInt(valA, 10);
      const b = parseInt(valB, 10);
      if (isNaN(a) || isNaN(b)) return;

      if (a !== b) {
        const winner = a > b ? 'A' : 'B';
        const current = form.querySelector(`input[name="${m.id}-adv"]:checked`);
        if (!current || current.value !== winner) {
          const radio = form.querySelector(`input[name="${m.id}-adv"][value="${winner}"]`);
          if (radio) { radio.checked = true; highlightPills(m.id, winner); }
        }
      } else {
        const current = form.querySelector(`input[name="${m.id}-adv"]:checked`);
        if (current) {
          current.checked = false;
          highlightPills(m.id, null);
        }
      }
    });
  }, 300);

  // Radio pills highlight
  form.addEventListener('change', e => {
    const el = e.target;
    if (!el.matches('input[type="radio"]') || !el.name.endsWith('-adv')) return;
    const matchId = el.name.replace('-adv', '');
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

  // 2. Validate all matches
  let errors = [];
  matches.forEach((m, i) => {
    const a   = form.querySelector(`#sc-${m.id}-a`);
    const b   = form.querySelector(`#sc-${m.id}-b`);
    const adv = form.querySelector(`input[name="${m.id}-adv"]:checked`);
    const card = document.getElementById(`bet-card-${m.id}`);

    const hasError = a.value === '' || b.value === '' || !adv;
    card.classList.toggle('bet-card--error', hasError);
    if (hasError) errors.push(i + 1);
  });

  if (errors.length) {
    alert(`Atenção: preencha placar e "quem avança" nos jogos ${errors.join(', ')}.`);
    document.getElementById(`bet-card-${matches[errors[0]-1].id}`)
            .scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // 3. Collect palpites
  const jogos = matches.map(m => {
    const advVal = form.querySelector(`input[name="${m.id}-adv"]:checked`).value;
    return {
      id:     m.id,
      teamA:  m.teamA,
      teamB:  m.teamB,
      scoreA: parseInt(form.querySelector(`#sc-${m.id}-a`).value),
      scoreB: parseInt(form.querySelector(`#sc-${m.id}-b`).value),
      avanca: advVal === 'A' ? m.teamA : m.teamB,
    };
  });

  // 4. Save to localStorage (demo — sem backend)
  const entry = { nome, round, timestamp: new Date().toISOString(), jogos };
  localStorage.setItem(`bolao_${round}_${nome}`, JSON.stringify(entry));

  // 5. Show success
  document.getElementById('palpite-app').innerHTML = renderSuccess(nome, round, jogos);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function shakeBlock(msg) {
  alert(msg);
}

/* ─── Boot ──────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', initPalpite);
