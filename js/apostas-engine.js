/* ─── Apostas de todos — lê do Supabase ────────────────────────── */

async function initApostas() {
  const round   = CONFIG.currentRound;
  const scoring = CONFIG.scoring[round];
  const matches = CONFIG.matches[round] || [];
  const deadline = new Date(CONFIG.forms[round].deadline);
  const isOpen   = deadline > new Date();
  const content  = document.getElementById('apostas-content');
  const sub      = document.getElementById('ap-sub');

  // Monta mapa de jogos por id para lookup rápido
  const matchById = {};
  matches.forEach(m => { matchById[m.id] = m; });

  sub.textContent = scoring.label + (isOpen ? ' — apostas abertas' : ' — apostas encerradas');

  // Fase aberta: só mostra os próprios palpites (se existirem)
  if (isOpen) {
    content.innerHTML = renderAviso(
      '🔒 Apostas em andamento',
      'Os palpites de todos ficam visíveis assim que o prazo encerrar.<br>Enquanto isso, você pode ver os seus próprios palpites no link pessoal que recebeu.'
    );
    return;
  }

  // Fase encerrada: busca do Supabase
  if (!CONFIG.supabase.url || !CONFIG.supabase.anonKey) {
    content.innerHTML = renderAviso(
      '⚙️ Backend não configurado',
      'O administrador ainda não configurou o Supabase. Configure <code>supabase.url</code> e <code>supabase.anonKey</code> no <code>config.js</code>.'
    );
    return;
  }

  content.innerHTML = '<div class="ap-loading">⏳ Buscando apostas de todos...</div>';

  try {
    const res = await fetch(
      `${CONFIG.supabase.url}/rest/v1/palpites?round=eq.${round}&select=nome,jogos&order=nome`,
      { headers: { 'apikey': CONFIG.supabase.anonKey, 'Authorization': `Bearer ${CONFIG.supabase.anonKey}` } }
    );
    if (!res.ok) throw new Error('Erro na resposta');
    const rows = await res.json();

    if (!rows.length) {
      content.innerHTML = renderAviso('😕 Nenhuma aposta encontrada', 'Nenhum participante enviou palpites ainda.');
      return;
    }

    renderApostas(content, rows, matchById, scoring);
  } catch(e) {
    content.innerHTML = renderAviso('❌ Erro ao carregar', 'Não foi possível buscar as apostas. Tente novamente em instantes.');
  }
}

function renderApostas(container, rows, matchById, scoring) {
  // Ordena pela ordem de participantes do config
  const order = CONFIG.participants.map(p => p.name);
  rows.sort((a, b) => order.indexOf(a.nome) - order.indexOf(b.nome));

  const participant = (nome) => CONFIG.participants.find(p => p.name === nome) || { emoji: '🎯' };

  let html = '<div class="ap-grid">';

  rows.forEach(row => {
    const p    = participant(row.nome);
    const jogos = Array.isArray(row.jogos) ? row.jogos : [];

    const jogoRows = jogos.map((j, i) => {
      const match = matchById[j.id];
      // Verifica se acertou (só se o jogo já tem resultado)
      let statusClass = '';
      let statusIcon  = '';
      if (match && match.winner !== null) {
        const acertouVencedor = (match.winner === 'A' && j.avanca === match.teamA) ||
                                (match.winner === 'B' && j.avanca === match.teamB);
        const acertouPlacar   = match.scoreA === j.scoreA && match.scoreB === j.scoreB;
        if (acertouVencedor && acertouPlacar) { statusClass = 'ap-row--exact'; statusIcon = '⭐'; }
        else if (acertouVencedor)             { statusClass = 'ap-row--win';   statusIcon = '✅'; }
        else                                  { statusClass = 'ap-row--miss';  statusIcon = '❌'; }
      }

      return `
        <div class="ap-row ${statusClass}">
          <span class="ap-jogo">J${i+1}</span>
          <span class="ap-match">${j.teamA} <strong>${j.scoreA}</strong>×<strong>${j.scoreB}</strong> ${j.teamB}</span>
          <span class="ap-avanca">→ ${j.avanca}</span>
          ${statusIcon ? `<span class="ap-status">${statusIcon}</span>` : ''}
        </div>
      `;
    }).join('');

    html += `
      <div class="ap-card">
        <div class="ap-card-head">
          <span class="ap-emoji">${p.emoji}</span>
          <span class="ap-nome">${row.nome}</span>
        </div>
        <div class="ap-rows">${jogoRows}</div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

function renderAviso(titulo, msg) {
  return `
    <div class="ap-aviso">
      <h2>${titulo}</h2>
      <p>${msg}</p>
      <a href="index.html" class="btn btn-outline" style="margin-top:20px">← Voltar ao site</a>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', initApostas);
