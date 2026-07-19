/* ─── Utilities ────────────────────────────────────────────────── */

function fmt(n) { return String(n).padStart(2, '0'); }

function getTotal(p) {
  return Object.values(p.scores).reduce((a, b) => a + b, 0);
}

function isFormOpen(roundKey) {
  const f = CONFIG.forms[roundKey];
  return f && new Date(f.deadline) > new Date();
}

// Times ainda não definidos ("Venc. X" / "Perd. X" / "A definir") — rodada ainda não pode ser apostada
function roundHasRealTeams(roundKey) {
  const matches = CONFIG.matches[roundKey] || [];
  if (!matches.length) return false;
  return matches.every(m =>
    !/^(Venc\.|Perd\.)/.test(m.teamA) && m.teamA !== 'A definir' &&
    !/^(Venc\.|Perd\.)/.test(m.teamB) && m.teamB !== 'A definir'
  );
}

function roundIsConcluded(roundKey) {
  const matches = CONFIG.matches[roundKey] || [];
  return matches.length > 0 && matches.every(m => m.scoreA !== null && m.scoreB !== null);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [, m, d] = dateStr.split('-');
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]}`;
}

/* ─── Page meta ────────────────────────────────────────────────── */

function setupPageMeta() {
  document.title = `${CONFIG.siteName} · ${CONFIG.edition}`;
  const footerTitle = document.getElementById('footer-title');
  if (footerTitle) footerTitle.textContent = CONFIG.siteName;
  const footerContact = document.getElementById('footer-contact');
  if (footerContact) {
    footerContact.innerHTML = `Admin: <a href="mailto:${CONFIG.adminContact}">${CONFIG.adminContact}</a>`;
  }
}

/* ─── Star field ────────────────────────────────────────────────── */

function createStars() {
  const layer = document.getElementById('stars-layer');
  if (!layer) return;
  const count = 160;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    const size = Math.random() < 0.55 ? 1 : Math.random() < 0.6 ? 2 : 3;
    star.style.cssText = [
      `position:absolute`,
      `border-radius:50%`,
      `background:#fff`,
      `width:${size}px`,
      `height:${size}px`,
      `left:${(Math.random() * 100).toFixed(2)}%`,
      `top:${(Math.random() * 100).toFixed(2)}%`,
      `opacity:${(0.15 + Math.random() * 0.7).toFixed(2)}`,
      `animation:twinkle ${(2 + Math.random() * 3).toFixed(1)}s ease-in-out ${(Math.random() * 4).toFixed(1)}s infinite`,
    ].join(';');
    fragment.appendChild(star);
  }
  layer.appendChild(fragment);
}

/* ─── Countdown ─────────────────────────────────────────────────── */

function startCountdown() {
  const round = CONFIG.currentRound;
  if (round === 'encerrado') {
    const label = document.getElementById('cd-label');
    if (label) label.textContent = 'Copa encerrada! 🏆';
    ['cd-d','cd-h','cd-m','cd-s'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '00';
    });
    return;
  }
  const form = CONFIG.forms[round];
  if (!form) return;

  const scoring = CONFIG.scoring[round];
  const label = document.getElementById('cd-label');
  const deadline = new Date(form.deadline);

  function tick() {
    const diff = deadline - new Date();
    if (diff <= 0) {
      if (label) label.textContent = 'Prazo de palpites encerrado!';
      ['cd-d','cd-h','cd-m','cd-s'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '00';
      });
      return;
    }
    if (label) label.textContent = `Palpites das ${scoring.label} fecham em:`;
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);
    const secs  = Math.floor((diff % 60000) / 1000);
    const vals = { 'cd-d': days, 'cd-h': hours, 'cd-m': mins, 'cd-s': secs };
    for (const [id, val] of Object.entries(vals)) {
      const el = document.getElementById(id);
      if (el) el.textContent = fmt(val);
    }
  }

  tick();
  setInterval(tick, 1000);
}

/* ─── Palpites section ──────────────────────────────────────────── */

function renderPalpites() {
  const el = document.getElementById('palpites-content');
  if (!el) return;

  const currentRound = CONFIG.currentRound;
  let html = '<div class="rounds-grid">';

  CONFIG.roundOrder.forEach(roundKey => {
    const scoring     = CONFIG.scoring[roundKey];
    const form        = CONFIG.forms[roundKey];
    const isCur       = roundKey === currentRound;
    const concluded   = roundIsConcluded(roundKey);
    const bettable    = !concluded && isFormOpen(roundKey) && roundHasRealTeams(roundKey);
    const past        = new Date(form.deadline) < new Date();
    const dl          = new Date(form.deadline);
    const dlStr       = dl.toLocaleDateString('pt-BR', { day:'2-digit', month:'short' }) +
                    ' às ' + dl.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
    const maxPts  = scoring.winner + scoring.exact;

    let badge, badgeClass, btn;

    if (bettable) {
      badge = '🟢 Aberto';
      badgeClass = 'badge-open';
      btn = `<a href="palpite.html?r=${roundKey}" class="btn btn-gold btn-full">⚽ Fazer Palpite Agora</a>`;
    } else if (concluded) {
      badge = '✅ Concluído';
      badgeClass = 'badge-done';
      btn = '';
    } else if (past) {
      badge = '🔴 Encerrado';
      badgeClass = 'badge-closed';
      btn = `<div class="btn-disabled">⏳ Aguardando apuração dos resultados...</div>`;
    } else {
      badge = '🔒 Em breve';
      badgeClass = 'badge-soon';
      btn = '';
    }

    html += `
      <div class="round-card${bettable ? ' round-card--current' : ''}">
        <div class="round-card__head">
          <h3 class="round-card__name">${scoring.label}</h3>
          <span class="badge ${badgeClass}">${badge}</span>
        </div>
        <div class="round-card__pts">
          <div class="pts-item">
            <span class="pts-num">${scoring.winner}</span>
            <span class="pts-lbl">vencedor</span>
          </div>
          <span class="pts-plus">+</span>
          <div class="pts-item">
            <span class="pts-num">${scoring.exact}</span>
            <span class="pts-lbl">placar exato</span>
          </div>
          <span class="pts-eq">=</span>
          <div class="pts-item pts-item--max">
            <span class="pts-num">${maxPts}</span>
            <span class="pts-lbl">pts máx</span>
          </div>
        </div>
        ${bettable || (!concluded && !past) ? `<p class="round-card__deadline">⏰ Prazo: ${dlStr}</p>` : ''}
        ${btn}
      </div>
    `;
  });

  html += '</div>';
  el.innerHTML = html;
}

/* ─── Pontuação automática ──────────────────────────────────────── */

function calcPontos(jogos, round) {
  const scoring  = CONFIG.scoring[round];
  const matches  = CONFIG.matches[round] || [];
  const byId     = {};
  matches.forEach(m => byId[m.id] = m);

  let pts = 0, vencedores = 0, exatos = 0;
  (jogos || []).forEach(j => {
    const m = byId[j.id];
    if (!m || m.winner === null) return; // jogo ainda não aconteceu

    const acertouVencedor = (m.winner === 'A' && j.avanca === m.teamA) ||
                            (m.winner === 'B' && j.avanca === m.teamB);
    const acertouPlacar   = m.scoreA !== null && m.scoreA === j.scoreA && m.scoreB === j.scoreB;

    if (acertouVencedor) { pts += scoring.winner; vencedores++; }
    if (acertouPlacar)   { pts += scoring.exact;  exatos++; }
  });
  return { pts, vencedores, exatos };
}

async function fetchBetsAllRounds() {
  const repo  = CONFIG.github.repo;

  // Busca os arquivos de cada participante em cada rodada (paralelo)
  // IMPORTANTE: raw.githubusercontent.com é um CDN público — NUNCA mandar
  // header de Authorization aqui, isso quebra o CORS (preflight falha) e
  // a requisição falha silenciosamente (cai no catch).
  const allBets = {}; // allBets[nome][round] = jogos[]

  await Promise.all(CONFIG.participants.map(async p => {
    allBets[p.name] = {};
    await Promise.all(CONFIG.roundOrder.map(async round => {
      const path = `data/palpite-${round}-${p.name.toLowerCase().replace(/\s/g,'-')}.json`;
      const url  = `https://raw.githubusercontent.com/${repo}/main/${path}?t=${Date.now()}`;
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          allBets[p.name][round] = data.jogos || [];
        }
      } catch(e) { /* sem aposta ainda */ }
    }));
  }));

  return allBets;
}

/* ─── Ranking section ───────────────────────────────────────────── */

async function renderRanking() {
  const el = document.getElementById('ranking-content');
  if (!el) return;

  // Mostra loading enquanto busca
  el.innerHTML = '<p style="text-align:center;color:var(--grey);padding:40px 0">⏳ Calculando ranking...</p>';

  // Busca todas as apostas do GitHub
  const allBets = await fetchBetsAllRounds();

  // Calcula pontos de cada participante por rodada
  const sorted = CONFIG.participants.map(p => {
    const scoresByRound = {};
    let total = 0;
    CONFIG.roundOrder.forEach(round => {
      const jogos = allBets[p.name]?.[round] || [];
      const { pts } = calcPontos(jogos, round);
      scoresByRound[round] = pts;
      total += pts;
    });
    return { ...p, scoresByRound, total };
  }).sort((a, b) => b.total - a.total);

  const allZero = sorted.every(p => p.total === 0);

  /* Podium */
  let podiumHtml = '';
  if (sorted.length >= 2) {
    const order = [sorted[1], sorted[0], sorted[2]].filter(Boolean);
    const heights = [120, 160, 90];
    const posBadges = ['🥈', '🥇', '🥉'];
    const posNumbers = [2, 1, 3];

    podiumHtml = '<div class="podium">';
    order.forEach((p, idx) => {
      if (!p) return;
      const pos = posNumbers[idx];
      const h   = heights[idx];
      podiumHtml += `
        <div class="podium-place podium-place--${pos}">
          <div class="podium-avatar">${p.emoji}</div>
          <div class="podium-name">${p.name}</div>
          <div class="podium-pts">${p.total} pts</div>
          <div class="podium-bar" style="height:${h}px">
            <span class="podium-medal">${posBadges[idx]}</span>
          </div>
        </div>
      `;
    });
    podiumHtml += '</div>';
  }

  /* Note if all zero */
  const zeroNote = allZero
    ? `<p class="ranking-note">⏳ O ranking será atualizado após cada rodada. Copa começa em 11/Jun!</p>`
    : '';

  /* Table */
  const medals = ['🥇','🥈','🥉'];
  let tableHtml = `
    <div class="ranking-wrap">
      <table class="ranking-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Participante</th>
            <th>Total</th>
            ${CONFIG.roundOrder.map(r => `<th>${CONFIG.scoring[r].shortLabel}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
  `;
  sorted.forEach((p, i) => {
    const rowClass = i === 0 ? 'row--gold' : i === 1 ? 'row--silver' : i === 2 ? 'row--bronze' : '';
    tableHtml += `
      <tr class="${rowClass}">
        <td class="td-pos">${i < 3 ? medals[i] : (i + 1) + 'º'}</td>
        <td class="td-name"><span class="td-emoji">${p.emoji}</span>${p.name}</td>
        <td class="td-total">${p.total}</td>
        ${CONFIG.roundOrder.map(r => `<td class="td-round">${p.scoresByRound[r] ?? 0}</td>`).join('')}
      </tr>
    `;
  });
  tableHtml += '</tbody></table></div>';

  const zeroNote2 = allZero
    ? `<p class="ranking-note">⏳ Apostas ainda não computadas ou jogos ainda não aconteceram.</p>`
    : '';

  el.innerHTML = podiumHtml + zeroNote2 + tableHtml;
}

/* ─── Bracket section ───────────────────────────────────────────── */

function renderBracket() {
  const el = document.getElementById('bracket-content');
  if (!el) return;

  /* Tabs */
  let tabsHtml = '<div class="bracket-tabs" role="tablist">';
  CONFIG.roundOrder.forEach(roundKey => {
    const active = roundKey === CONFIG.currentRound;
    tabsHtml += `
      <button class="bracket-tab${active ? ' active' : ''}"
              role="tab"
              data-round="${roundKey}"
              aria-selected="${active}">
        ${CONFIG.scoring[roundKey].shortLabel}
      </button>
    `;
  });
  tabsHtml += '</div>';

  /* Panels */
  let panelsHtml = '';
  CONFIG.roundOrder.forEach(roundKey => {
    const hidden  = roundKey !== CONFIG.currentRound;
    const matches = CONFIG.matches[roundKey] || [];
    const s       = CONFIG.scoring[roundKey];

    panelsHtml += `<div class="bracket-panel${hidden ? ' hidden' : ''}" data-round="${roundKey}">`;
    panelsHtml += `<h3 class="bracket-round-title">${s.label}</h3>`;
    panelsHtml += `<div class="matches-grid">`;

    matches.forEach((m, idx) => {
      const played = m.scoreA !== null;
      const winA   = m.winner === 'A';
      const winB   = m.winner === 'B';
      const sA     = played ? m.scoreA : '–';
      const sB     = played ? m.scoreB : '–';

      const resLabel = {
        extratime: { text: '⏱ Prorrogação', cls: 'match-res--et'  },
        penalties:  { text: '🥅 Pênaltis',   cls: 'match-res--pen' },
      }[m.resolution] || null;

      panelsHtml += `
        <div class="match-card${played ? ' match-card--played' : ''}">
          <div class="match-num">Jogo ${idx + 1}</div>
          <div class="match-teams">
            <div class="match-team${winA ? ' match-team--winner' : winB ? ' match-team--elim' : ''}">
              <span class="team-name">${m.teamA}</span>
              <span class="team-score">${sA}</span>
            </div>
            <div class="match-sep"></div>
            <div class="match-team${winB ? ' match-team--winner' : winA ? ' match-team--elim' : ''}">
              <span class="team-name">${m.teamB}</span>
              <span class="team-score">${sB}</span>
            </div>
          </div>
          <div class="match-meta">
            <span class="match-date">${formatDate(m.date)} · ${m.time}</span>
            ${resLabel ? `<span class="match-res ${resLabel.cls}">${resLabel.text}</span>` : ''}
          </div>
          <div class="match-venue">${m.venue}</div>
        </div>
      `;
    });

    panelsHtml += '</div></div>';
  });

  el.innerHTML = tabsHtml + panelsHtml;

  /* Tab switching */
  el.querySelectorAll('.bracket-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      el.querySelectorAll('.bracket-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      el.querySelectorAll('.bracket-panel').forEach(p => p.classList.add('hidden'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      el.querySelector(`.bracket-panel[data-round="${tab.dataset.round}"]`).classList.remove('hidden');
    });
  });
}

/* ─── Regras section ────────────────────────────────────────────── */

function renderRegras() {
  const el = document.getElementById('regras-content');
  if (!el) return;

  /* Scoring cards */
  let scoringHtml = '<div class="regras-block"><h3 class="regras-subtitle">Sistema de Pontuação</h3><div class="scoring-grid">';
  CONFIG.roundOrder.forEach(roundKey => {
    const s   = CONFIG.scoring[roundKey];
    const max = s.winner + s.exact;
    scoringHtml += `
      <div class="scoring-card">
        <div class="scoring-phase">${s.label}</div>
        <div class="scoring-row">
          <span class="scoring-pts">${s.winner} pts</span>
          <span class="scoring-desc">— acertou o vencedor</span>
        </div>
        <div class="scoring-row scoring-row--bonus">
          <span class="scoring-pts">+${s.exact} pts</span>
          <span class="scoring-desc">— placar exato (bônus)</span>
        </div>
        <div class="scoring-max">Máximo: <strong>${max} pts</strong> por jogo</div>
      </div>
    `;
  });
  scoringHtml += '</div></div>';

  /* Rules list */
  const rules = [
    { icon:'📋', title:'Palpites por rodada',      desc:'Um formulário Google Forms é aberto antes de cada fase com os times qualificados. Você palpita todos os jogos daquela rodada de uma vez.' },
    { icon:'⏰', title:'Prazo improrrogável',       desc:'O formulário fecha no horário indicado. Palpites enviados após o prazo não são aceitos. Fique de olho nas notificações do grupo!' },
    { icon:'⚽', title:'Como palpitar',             desc:'Para cada jogo você informa o placar ao final dos 90 minutos. Não é necessário prever prorrogação nem pênaltis — o palpite é sempre pelo placar do tempo normal.' },
    { icon:'⏱', title:'Prorrogação & Pênaltis',    desc:'O bônus de placar exato é sempre pelo placar dos 90min. Se o jogo foi para prorrogação ou pênaltis, quem acertou o empate certo (ex: 1×1) ainda recebe o bônus. O vencedor vale pontos pelo time que efetivamente passou de fase.' },
    { icon:'🏆', title:'Pontuação crescente',       desc:'Os pontos aumentam a cada fase: acertar uma Semifinal vale muito mais do que acertar a Rodada das 32. Quem subestimar as fases finais fica para trás.' },
    { icon:'🤝', title:'Critério de desempate',     desc:'Em caso de empate total: 1º) mais placares exatos; 2º) mais vencedores corretos nas fases finais; 3º) ordem alfabética (só para não deixar empatado).' },
    { icon:'📊', title:'Ranking automático',          desc:'O ranking é calculado automaticamente comparando seus palpites com os resultados. Assim que o admin registrar o placar de um jogo, os pontos aparecem sozinhos.' },
  ];

  let rulesHtml = '<div class="regras-block"><h3 class="regras-subtitle">Regras Gerais</h3><div class="rules-grid">';
  rules.forEach(r => {
    rulesHtml += `
      <div class="rule-card">
        <div class="rule-icon">${r.icon}</div>
        <div class="rule-body">
          <h4 class="rule-title">${r.title}</h4>
          <p class="rule-desc">${r.desc}</p>
        </div>
      </div>
    `;
  });
  rulesHtml += '</div></div>';

  el.innerHTML = scoringHtml + rulesHtml;
}

/* ─── Navbar ────────────────────────────────────────────────────── */

function setupNavScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => navbar.classList.toggle('navbar--scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Active link highlight via IntersectionObserver */
  const sectionIds = ['top', 'palpites', 'ranking', 'chaveamento', 'regras'];
  const links = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  sectionIds.forEach(id => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}

function setupMobileNav() {
  const burger = document.getElementById('nav-burger');
  const drawer = document.getElementById('nav-drawer');
  if (!burger || !drawer) return;

  burger.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    drawer.setAttribute('aria-hidden', !open);
  });

  drawer.querySelectorAll('.nav-drawer-link').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
    });
  });
}

/* ─── Trophy animation ──────────────────────────────────────────── */

function setupTrophyParallax() {
  const trophy = document.getElementById('hero-trophy');
  if (!trophy) return;
  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    trophy.style.transform = `translateY(-6px) rotate(${dx * 3}deg)`;
  });
}

/* ─── Init ──────────────────────────────────────────────────────── */

async function init() {
  setupPageMeta();
  setupNavScroll();
  setupMobileNav();
  createStars();
  startCountdown();
  renderPalpites();
  renderBracket();
  renderRegras();
  setupTrophyParallax();
  await renderRanking(); // async: busca apostas do GitHub e calcula pontos
}

document.addEventListener('DOMContentLoaded', init);
