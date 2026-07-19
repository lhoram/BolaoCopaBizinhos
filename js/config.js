const CONFIG = {
  siteName: "Bolão Copa Bizinhos",
  edition: "Copa do Mundo 2026",
  adminContact: "odirpinheiro@hotmail.com",

  // Rodada atual aberta para palpites
  // Opções: "oitavas" | "quartas" | "semi" | "terceiro" | "final" | "encerrado"
  currentRound: "final",

  // Pontuação por rodada
  scoring: {
    oitavas:  { label: "Oitavas de Final", shortLabel: "Oitav", winner: 5,  exact: 3  },
    quartas:  { label: "Quartas de Final", shortLabel: "Qrtas", winner: 8,  exact: 5  },
    semi:     { label: "Semifinais",       shortLabel: "Semi",  winner: 12, exact: 7  },
    terceiro: { label: "Disputa 3º Lugar", shortLabel: "3º Lg", winner: 5,  exact: 3  },
    final:    { label: "Grande Final",     shortLabel: "Final", winner: 20, exact: 10 },
  },

  // Links do Google Forms por rodada
  // ADMIN: preencha a URL quando criar cada formulário
  forms: {
    oitavas:  { url: "", deadline: "2026-07-04T12:00:00" },
    quartas:  { url: "", deadline: "2026-07-09T12:00:00" },
    semi:     { url: "", deadline: "2026-07-13T23:59:00" },
    terceiro: { url: "", deadline: "2026-07-18T09:45:00" },
    final:    { url: "", deadline: "2026-07-18T23:59:00" },
  },

  github: {
    // token ofuscado (xor 73) — só tem permissão de escrita em data/ deste repo
    _e: "2e203d213c2b1639283d16787808017e13051a1079330f2d283f7d052f393e3e27160d71382c103d063a10333d107c7c2c3d08701f2d087f70383d317f067f2e252318337a302b381c0a303e31051c047d0c1d011a792e0c2d3d3c3f3b",
    get token() { return this._e.match(/.{2}/g).map(h=>String.fromCharCode(parseInt(h,16)^73)).join(''); },
    repo: "lhoram/BolaoCopaBizinhos",
  },

  roundOrder: ["oitavas", "quartas", "semi", "terceiro", "final"],

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
    oitavas: [
      { id:"oit-1", teamA:"Canadá", teamB:"Marrocos", scoreA:0, scoreB:3, winner:"B", resolution:"regular", date:"2026-07-04", time:"14:00", venue:"Houston" },
      { id:"oit-2", teamA:"Paraguai", teamB:"França", scoreA:0, scoreB:1, winner:"B", resolution:"regular", date:"2026-07-04", time:"18:00", venue:"Filadélfia" },
      { id:"oit-3", teamA:"Brasil", teamB:"Noruega", scoreA:0, scoreB:2, winner:"B", resolution:"regular", date:"2026-07-05", time:"17:00", venue:"MetLife Stadium, Nova Jersey" },
      { id:"oit-4", teamA:"México", teamB:"Inglaterra", scoreA:2, scoreB:3, winner:"B", resolution:"regular", date:"2026-07-05", time:"21:00", venue:"Cidade do México" },
      { id:"oit-5", teamA:"Portugal", teamB:"Espanha", scoreA:0, scoreB:1, winner:"B", resolution:"regular", date:"2026-07-06", time:"16:00", venue:"Dallas" },
      { id:"oit-6", teamA:"Estados Unidos", teamB:"Bélgica", scoreA:1, scoreB:4, winner:"B", resolution:"regular", date:"2026-07-06", time:"21:00", venue:"Lumen Field, Seattle" },
      { id:"oit-7", teamA:"Argentina", teamB:"Egito", scoreA:3, scoreB:2, winner:"A", resolution:"regular", date:"2026-07-07", time:"13:00", venue:"Atlanta" },
      { id:"oit-8", teamA:"Suíça", teamB:"Colômbia", scoreA:0, scoreB:0, winner:"A", resolution:"penalties", date:"2026-07-07", time:"17:00", venue:"Vancouver" },
    ],
    quartas: [
      { id:"qrt-1", teamA:"França", teamB:"Marrocos", scoreA:2, scoreB:0, winner:"A", resolution:"regular", date:"2026-07-09", time:"17:00", venue:"Gillette Stadium, Boston" },
      { id:"qrt-2", teamA:"Espanha", teamB:"Bélgica", scoreA:2, scoreB:1, winner:"A", resolution:"regular", date:"2026-07-10", time:"16:00", venue:"SoFi Stadium, Los Angeles" },
      { id:"qrt-3", teamA:"Noruega", teamB:"Inglaterra", scoreA:1, scoreB:1, winner:"B", resolution:"extratime", date:"2026-07-11", time:"18:00", venue:"Hard Rock Stadium, Miami" },
      { id:"qrt-4", teamA:"Argentina", teamB:"Suíça", scoreA:1, scoreB:1, winner:"A", resolution:"extratime", date:"2026-07-11", time:"22:00", venue:"Arrowhead Stadium, Kansas City" },
    ],
    semi: [
      { id:"semi-1", teamA:"França", teamB:"Espanha", scoreA:0, scoreB:2, winner:"B", resolution:"regular", date:"2026-07-14", time:"16:00", venue:"Dallas" },
      { id:"semi-2", teamA:"Inglaterra", teamB:"Argentina", scoreA:1, scoreB:2, winner:"B", resolution:"regular", date:"2026-07-15", time:"16:00", venue:"Atlanta" },
    ],
    terceiro: [
      { id:"3rd-1", teamA:"França", teamB:"Inglaterra", scoreA:4, scoreB:6, winner:"B", resolution:"regular", date:"2026-07-18", time:"18:00", venue:"Hard Rock Stadium, Miami" },
    ],
    final: [
      { id:"final-1", teamA:"Espanha", teamB:"Argentina", scoreA:null, scoreB:null, winner:null, resolution:"regular", date:"2026-07-19", time:"16:00", venue:"MetLife Stadium, Nova Jersey" },
    ],
  },

  // Participantes
  // ADMIN: cada pessoa recebe seu link exclusivo para fazer palpites:
  //   https://lhoram.github.io/BolaoCopaBizinhos/palpite.html?p=NOME&t=TOKEN
  // Substitua NOME e TOKEN pelos valores abaixo. Compartilhe via WhatsApp individualmente.
  participants: [
    { name: "Odir",    emoji: "🧔", token: "od7k2f", scores: { oitavas:0, quartas:0, semi:0, terceiro:0, final:0 } },
    { name: "Renata",  emoji: "👩", token: "rn4m9x", scores: { oitavas:0, quartas:0, semi:0, terceiro:0, final:0 } },
    { name: "João",    emoji: "👨", token: "jo5w3q", scores: { oitavas:0, quartas:0, semi:0, terceiro:0, final:0 } },
    { name: "Isabela", emoji: "👱‍♀️", token: "is8b1r", scores: { oitavas:0, quartas:0, semi:0, terceiro:0, final:0 } },
    { name: "Wiliams", emoji: "🕺", token: "wi2p6s", scores: { oitavas:0, quartas:0, semi:0, terceiro:0, final:0 } },
    { name: "Wagner",  emoji: "🎯", token: "wg9n4v", scores: { oitavas:0, quartas:0, semi:0, terceiro:0, final:0 } },
  ],
};
