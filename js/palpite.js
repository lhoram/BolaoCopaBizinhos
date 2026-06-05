/* ─── Utilities ─────────────────────────────────────────────────── */

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const [, m, d] = dateStr.split('-');
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]}`;
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

  if (!isOpen) { app.innerHTML = renderClosed(scoring); return; }

  app.innerHTML = renderForm(scoring, matches, deadline);
  setupListeners(round, matches);
}

/* ─── Render: form ──────────────────────────────────────────────── */

function renderForm(scoring, matches, deadline) {
  const dlStr = deadline.toLocaleDateString('pt-BR', { day:'2-digit', month:'long' })
              + ' às ' + deadline.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });

  const namesHtml = CONFIG.participants.map(p => `
    <label class="name-pill">
      <input type="radio" name="participante" value="${p.name}" required>
      <span>${p.emoji} ${p.name}</span>
    </label>
  `).join('');

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
            <h2 class="bet-block-title">👤 Quem está apostando?</h2>
            <div class="name-grid">${namesHtml}</div>
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

function setupListeners(round, matches) {
  const form = document.getElementById('bet-form');
  if (!form) return;

  // Score inputs → auto-select "quem avança" when score is not tied
  matches.forEach(m => {
    const inA = document.getElementById(`sc-${m.id}-a`);
    const inB = document.getElementById(`sc-${m.id}-b`);

    function autoAdvance() {
      const a = parseInt(inA.value);
      const b = parseInt(inB.value);
      if (isNaN(a) || isNaN(b)) return;
      if (a !== b) {
        const winner = a > b ? 'A' : 'B';
        const radio = form.querySelector(`input[name="${m.id}-adv"][value="${winner}"]`);
        if (radio) { radio.checked = true; highlightPills(m.id, winner); }
      }
    }

    inA.addEventListener('input', autoAdvance);
    inB.addEventListener('input', autoAdvance);
  });

  // Radio pills highlight
  form.addEventListener('change', e => {
    const el = e.target;
    if (!el.matches('input[type="radio"]')) return;

    if (el.name.endsWith('-adv')) {
      const matchId = el.name.replace('-adv', '');
      highlightPills(matchId, el.value);
    } else if (el.name === 'participante') {
      document.querySelectorAll('.name-pill').forEach(p => p.classList.remove('selected'));
      el.closest('.name-pill').classList.add('selected');
    }
  });

  // Submit
  form.addEventListener('submit', e => {
    e.preventDefault();
    handleSubmit(form, round, matches);
  });
}

function highlightPills(matchId, winner) {
  ['A','B'].forEach(side => {
    const pill = document.getElementById(`rp-${matchId}-${side.toLowerCase()}`);
    if (pill) pill.classList.toggle('selected', side === winner);
  });
}

/* ─── Submit ────────────────────────────────────────────────────── */

function handleSubmit(form, round, matches) {
  // 1. Participant check
  const participanteRadio = form.querySelector('input[name="participante"]:checked');
  if (!participanteRadio) {
    shakeBlock('Selecione seu nome antes de enviar!');
    return;
  }

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
  const nome = participanteRadio.value;
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
