const CONFIG = {
  siteName: "Bolão Copa Bizinhos",
  edition: "Copa do Mundo 2026",
  adminContact: "odirpinheiro@hotmail.com",

  // Rodada atual aberta para palpites
  // Opções: "r32" | "oitavas" | "quartas" | "semi" | "terceiro" | "final" | "encerrado"
  currentRound: "oitavas",

  // Pontuação por rodada
  scoring: {
    r32:      { label: "16 avos de Final",  shortLabel: "16avos", winner: 3,  exact: 2  },
    oitavas:  { label: "Oitavas de Final", shortLabel: "Oitav", winner: 5,  exact: 3  },
    quartas:  { label: "Quartas de Final", shortLabel: "Qrtas", winner: 8,  exact: 5  },
    semi:     { label: "Semifinais",       shortLabel: "Semi",  winner: 12, exact: 7  },
    terceiro: { label: "Disputa 3º Lugar", shortLabel: "3º Lg", winner: 5,  exact: 3  },
    final:    { label: "Grande Final",     shortLabel: "Final", winner: 20, exact: 10 },
  },

  // Links do Google Forms por rodada
  // ADMIN: preencha a URL quando criar cada formulário
  forms: {
    r32:      { url: "", deadline: "2026-06-29T18:00:00" },
    oitavas:  { url: "", deadline: "2026-07-04T12:00:00" },
    quartas:  { url: "", deadline: "2026-07-09T23:59:00" },
    semi:     { url: "", deadline: "2026-07-13T23:59:00" },
    terceiro: { url: "", deadline: "2026-07-17T23:59:00" },
    final:    { url: "", deadline: "2026-07-18T23:59:00" },
  },

  github: {
    // token ofuscado (xor 73) — só tem permissão de escrita em data/ deste repo
    _e: "2e203d213c2b1639283d16787808017e13051a1079330f2d283f7d052f393e3e27160d71382c103d063a10333d107c7c2c3d08701f2d087f70383d317f067f2e252318337a302b381c0a303e31051c047d0c1d011a792e0c2d3d3c3f3b",
    get token() { return this._e.match(/.{2}/g).map(h=>String.fromCharCode(parseInt(h,16)^73)).join(''); },
    repo: "lhoram/BolaoCopaBizinhos",
  },

  roundOrder: ["r32", "oitavas", "quartas", "semi", "terceiro", "final"],

  // Grupos Copa 2026 (referência para o admin)
  // Após a fase de grupos (termina 27/Jun), substitua "1º Grupo X" pelo time classificado real.
  groups: {
    A: ["México", "África do Sul", "Coreia do Sul", "Rep. Tcheca"],
    B: ["Canadá", "Bósnia e Herz.", "Catar", "Suíça"],
    C: ["Brasil", "Marrocos", "Haiti", "Escócia"],
    D: ["Estados Unidos", "Paraguai", "Austrália", "Turquia"],
    E: ["Alemanha", "Curaçau", "Costa do Marfim", "Equador"],
    F: ["Holanda", "Japão", "Suécia", "Tunísia"],
    G: ["Bélgica", "Egito", "Irã", "Nova Zelândia"],
    H: ["Espanha", "Cabo Verde", "Arábia Saudita", "Uruguai"],
    I: ["França", "Senegal", "Iraque", "Noruega"],
    J: ["Argentina", "Argélia", "Áustria", "Jordânia"],
    K: ["Portugal", "Rep. D. Congo", "Uzbequistão", "Colômbia"],
    L: ["Inglaterra", "Croácia", "Gana", "Panamá"],
  },

  // Jogos
  // scoreA/scoreB : null = não jogado | número = placar ao fim dos 90 MINUTOS (sempre)
  // winner        : null | "A" | "B"  — vencedor real (inclui prorrogação / pênaltis)
  // resolution    : "regular"   — decidido no tempo normal
  //                 "extratime" — decidido na prorrogação (placar aqui = 90min, gol da prorrog. não entra)
  //                 "penalties" — decidido nos pênaltis   (placar aqui = empate dos 90min)
  // REGRA DE PONTUAÇÃO:
  //   • Vencedor    → quem acertou o time vencedor (independente de como foi decidido)
  //   • Placar exato → quem acertou o placar dos 90min (resolution não interfere nesse bônus)
  // ADMIN: após 27/Jun substitua "1º Grupo X" / "2º Grupo X" pelos times reais classificados
  matches: {
    r32: [
      // Chaveamento oficial Copa 2026 — 16 avos de final (horários de Brasília)
      { id:"r32-1",  teamA:"África do Sul 🇿🇦", teamB:"Canadá 🇨🇦",        scoreA:0, scoreB:1, winner:"B", resolution:"regular", date:"2026-06-28", time:"16:00", venue:"SoFi Stadium, Los Angeles" },
      { id:"r32-2",  teamA:"Brasil 🇧🇷",        teamB:"Japão 🇯🇵",          scoreA:2, scoreB:1, winner:"A", resolution:"regular", date:"2026-06-29", time:"14:00", venue:"NRG Stadium, Houston" },
      { id:"r32-3",  teamA:"Alemanha 🇩🇪",      teamB:"Paraguai 🇵🇾",       scoreA:1, scoreB:1, winner:"B", resolution:"penalties", date:"2026-06-29", time:"17:30", venue:"Gillette Stadium, Boston" },
      { id:"r32-4",  teamA:"Holanda 🇳🇱",       teamB:"Marrocos 🇲🇦",       scoreA:2, scoreB:1, winner:"A", resolution:"regular", date:"2026-06-29", time:"22:00", venue:"Estadio BBVA, Monterrey" },
      { id:"r32-5",  teamA:"Costa do Marfim 🇨🇮",teamB:"Noruega 🇳🇴",      scoreA:0, scoreB:1, winner:"B", resolution:"regular", date:"2026-06-30", time:"14:00", venue:"AT&T Stadium, Dallas" },
      { id:"r32-6",  teamA:"França 🇫🇷",        teamB:"Suécia 🇸🇪",         scoreA:2, scoreB:0, winner:"A", resolution:"regular", date:"2026-06-30", time:"18:00", venue:"MetLife Stadium, Nova Jersey" },
      { id:"r32-7",  teamA:"México 🇲🇽",        teamB:"Equador 🇪🇨",        scoreA:1, scoreB:0, winner:"A", resolution:"regular", date:"2026-06-30", time:"22:00", venue:"Estadio Azteca, Cidade do México" },
      { id:"r32-8",  teamA:"Inglaterra 🏴󠁧󠁢󠁥󠁮󠁧󠁿",   teamB:"RD Congo 🇨🇩",       scoreA:3, scoreB:0, winner:"A", resolution:"regular", date:"2026-07-01", time:"13:00", venue:"Mercedes-Benz Stadium, Atlanta" },
      { id:"r32-9",  teamA:"Bélgica 🇧🇪",       teamB:"Senegal 🇸🇳",        scoreA:2, scoreB:1, winner:"A", resolution:"regular", date:"2026-07-01", time:"17:00", venue:"Lumen Field, Seattle" },
      { id:"r32-10", teamA:"EUA 🇺🇸",           teamB:"Bósnia 🇧🇦",         scoreA:2, scoreB:0, winner:"A", resolution:"regular", date:"2026-07-01", time:"21:00", venue:"Levi's Stadium, Santa Clara" },
      { id:"r32-11", teamA:"Espanha 🇪🇸",       teamB:"Áustria 🇦🇹",        scoreA:3, scoreB:1, winner:"A", resolution:"regular", date:"2026-07-02", time:"16:00", venue:"Rose Bowl, Los Angeles" },
      { id:"r32-12", teamA:"Portugal 🇵🇹",      teamB:"Croácia 🇭🇷",        scoreA:2, scoreB:1, winner:"A", resolution:"regular", date:"2026-07-02", time:"20:00", venue:"BMO Field, Toronto" },
      { id:"r32-13", teamA:"Suíça 🇨🇭",         teamB:"Argélia 🇩🇿",        scoreA:1, scoreB:0, winner:"A", resolution:"regular", date:"2026-07-03", time:"00:00", venue:"BC Place, Vancouver" },
      { id:"r32-14", teamA:"Austrália 🇦🇺",     teamB:"Egito 🇪🇬",          scoreA:1, scoreB:2, winner:"B", resolution:"regular", date:"2026-07-03", time:"15:00", venue:"AT&T Stadium, Dallas" },
      { id:"r32-15", teamA:"Argentina 🇦🇷",     teamB:"Cabo Verde 🇨🇻",     scoreA:3, scoreB:0, winner:"A", resolution:"regular", date:"2026-07-03", time:"19:00", venue:"Hard Rock Stadium, Miami" },
      { id:"r32-16", teamA:"Colômbia 🇨🇴",      teamB:"Gana 🇬🇭",           scoreA:2, scoreB:1, winner:"A", resolution:"regular", date:"2026-07-03", time:"22:30", venue:"Arrowhead Stadium, Kansas City" },
    ],
    oitavas: [
      { id:"oit-1", teamA:"Canadá 🇨🇦",   teamB:"Brasil 🇧🇷",     scoreA:null, scoreB:null, winner:null, resolution:"regular", date:"2026-07-04", time:"15:00", venue:"Lincoln Financial Field, Filadélfia" },
      { id:"oit-2", teamA:"Paraguai 🇵🇾", teamB:"Holanda 🇳🇱",    scoreA:null, scoreB:null, winner:null, resolution:"regular", date:"2026-07-04", time:"19:00", venue:"Arrowhead Stadium, Kansas City" },
      { id:"oit-3", teamA:"Noruega 🇳🇴",  teamB:"França 🇫🇷",     scoreA:null, scoreB:null, winner:null, resolution:"regular", date:"2026-07-05", time:"15:00", venue:"SoFi Stadium, Los Angeles" },
      { id:"oit-4", teamA:"México 🇲🇽",   teamB:"Inglaterra 🏴󠁧󠁢󠁥󠁮󠁧󠁿", scoreA:null, scoreB:null, winner:null, resolution:"regular", date:"2026-07-05", time:"19:00", venue:"Estadio Azteca, Cidade do México" },
      { id:"oit-5", teamA:"Bélgica 🇧🇪",  teamB:"EUA 🇺🇸",        scoreA:null, scoreB:null, winner:null, resolution:"regular", date:"2026-07-06", time:"15:00", venue:"Gillette Stadium, Boston" },
      { id:"oit-6", teamA:"Espanha 🇪🇸",  teamB:"Portugal 🇵🇹",   scoreA:null, scoreB:null, winner:null, resolution:"regular", date:"2026-07-06", time:"19:00", venue:"MetLife Stadium, Nova Jersey" },
      { id:"oit-7", teamA:"Suíça 🇨🇭",    teamB:"Egito 🇪🇬",      scoreA:null, scoreB:null, winner:null, resolution:"regular", date:"2026-07-07", time:"15:00", venue:"BC Place, Vancouver" },
      { id:"oit-8", teamA:"Argentina 🇦🇷",teamB:"Colômbia 🇨🇴",   scoreA:null, scoreB:null, winner:null, resolution:"regular", date:"2026-07-07", time:"19:00", venue:"Hard Rock Stadium, Miami" },
    ],
    quartas: [
      { id:"qrt-1", teamA:"Venc. Oit-1", teamB:"Venc. Oit-2", scoreA:null, scoreB:null, winner:null, resolution:"regular", date:"2026-07-10", time:"15:00", venue:"A definir" },
      { id:"qrt-2", teamA:"Venc. Oit-3", teamB:"Venc. Oit-4", scoreA:null, scoreB:null, winner:null, resolution:"regular", date:"2026-07-10", time:"19:00", venue:"A definir" },
      { id:"qrt-3", teamA:"Venc. Oit-5", teamB:"Venc. Oit-6", scoreA:null, scoreB:null, winner:null, resolution:"regular", date:"2026-07-11", time:"15:00", venue:"A definir" },
      { id:"qrt-4", teamA:"Venc. Oit-7", teamB:"Venc. Oit-8", scoreA:null, scoreB:null, winner:null, resolution:"regular", date:"2026-07-11", time:"19:00", venue:"A definir" },
    ],
    semi: [
      { id:"semi-1", teamA:"Venc. Qrt-1", teamB:"Venc. Qrt-2", scoreA:null, scoreB:null, winner:null, resolution:"regular", date:"2026-07-14", time:"19:00", venue:"MetLife Stadium, Nova York" },
      { id:"semi-2", teamA:"Venc. Qrt-3", teamB:"Venc. Qrt-4", scoreA:null, scoreB:null, winner:null, resolution:"regular", date:"2026-07-15", time:"19:00", venue:"Rose Bowl, Pasadena" },
    ],
    terceiro: [
      { id:"3rd-1", teamA:"Perd. Semi-1", teamB:"Perd. Semi-2", scoreA:null, scoreB:null, winner:null, resolution:"regular", date:"2026-07-18", time:"16:00", venue:"Hard Rock Stadium, Miami" },
    ],
    final: [
      { id:"final-1", teamA:"Venc. Semi-1", teamB:"Venc. Semi-2", scoreA:null, scoreB:null, winner:null, resolution:"regular", date:"2026-07-19", time:"16:00", venue:"MetLife Stadium, Nova York" },
    ],
  },

  // Participantes
  // ADMIN: cada pessoa recebe seu link exclusivo para fazer palpites:
  //   https://lhoram.github.io/BolaoCopaBizinhos/palpite.html?p=NOME&t=TOKEN
  // Substitua NOME e TOKEN pelos valores abaixo. Compartilhe via WhatsApp individualmente.
  participants: [
    { name: "Odir",    emoji: "🧔", token: "od7k2f", scores: { r32:0, oitavas:0, quartas:0, semi:0, terceiro:0, final:0 } },
    { name: "Renata",  emoji: "👩", token: "rn4m9x", scores: { r32:0, oitavas:0, quartas:0, semi:0, terceiro:0, final:0 } },
    { name: "João",    emoji: "👨", token: "jo5w3q", scores: { r32:0, oitavas:0, quartas:0, semi:0, terceiro:0, final:0 } },
    { name: "Isabela", emoji: "👱‍♀️", token: "is8b1r", scores: { r32:0, oitavas:0, quartas:0, semi:0, terceiro:0, final:0 } },
    { name: "Wiliams", emoji: "🕺", token: "wi2p6s", scores: { r32:0, oitavas:0, quartas:0, semi:0, terceiro:0, final:0 } },
    { name: "Wagner",  emoji: "🎯", token: "wg9n4v", scores: { r32:0, oitavas:0, quartas:0, semi:0, terceiro:0, final:0 } },
  ],
};
