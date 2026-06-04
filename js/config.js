const CONFIG = {
  siteName: "Bolão Copa Bizinhos",
  edition: "Copa do Mundo 2026",
  adminContact: "odirpinheiro@hotmail.com",

  // Rodada atual aberta para palpites
  // Opções: "r32" | "oitavas" | "quartas" | "semi" | "terceiro" | "final" | "encerrado"
  currentRound: "r32",

  // Pontuação por rodada
  scoring: {
    r32:      { label: "Rodada das 32",    shortLabel: "R32",   winner: 3,  exact: 2  },
    oitavas:  { label: "Oitavas de Final", shortLabel: "Oitav", winner: 5,  exact: 3  },
    quartas:  { label: "Quartas de Final", shortLabel: "Qrtas", winner: 8,  exact: 5  },
    semi:     { label: "Semifinais",       shortLabel: "Semi",  winner: 12, exact: 7  },
    terceiro: { label: "Disputa 3º Lugar", shortLabel: "3º Lg", winner: 5,  exact: 3  },
    final:    { label: "Grande Final",     shortLabel: "Final", winner: 20, exact: 10 },
  },

  // Links do Google Forms por rodada
  // ADMIN: preencha a URL quando criar cada formulário
  forms: {
    r32:      { url: "", deadline: "2026-06-27T23:59:00" },
    oitavas:  { url: "", deadline: "2026-07-03T23:59:00" },
    quartas:  { url: "", deadline: "2026-07-09T23:59:00" },
    semi:     { url: "", deadline: "2026-07-13T23:59:00" },
    terceiro: { url: "", deadline: "2026-07-17T23:59:00" },
    final:    { url: "", deadline: "2026-07-18T23:59:00" },
  },

  roundOrder: ["r32", "oitavas", "quartas", "semi", "terceiro", "final"],

  // Jogos
  // scoreA/scoreB: null = não jogado, número = placar nos 90min
  // winner: null | "A" | "B"
  // extraTime: true se decidido na prorrogação (bônus de placar exato não conta)
  matches: {
    r32: [
      { id:"r32-1",  teamA:"A definir", teamB:"A definir", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-06-28", time:"12:00", venue:"MetLife Stadium, Nova York" },
      { id:"r32-2",  teamA:"A definir", teamB:"A definir", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-06-28", time:"15:00", venue:"AT&T Stadium, Dallas" },
      { id:"r32-3",  teamA:"A definir", teamB:"A definir", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-06-28", time:"19:00", venue:"SoFi Stadium, Los Angeles" },
      { id:"r32-4",  teamA:"A definir", teamB:"A definir", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-06-28", time:"22:00", venue:"Levi's Stadium, São Francisco" },
      { id:"r32-5",  teamA:"A definir", teamB:"A definir", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-06-29", time:"12:00", venue:"Estadio Azteca, Cidade do México" },
      { id:"r32-6",  teamA:"A definir", teamB:"A definir", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-06-29", time:"15:00", venue:"BMO Field, Toronto" },
      { id:"r32-7",  teamA:"A definir", teamB:"A definir", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-06-29", time:"19:00", venue:"Lincoln Financial, Filadélfia" },
      { id:"r32-8",  teamA:"A definir", teamB:"A definir", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-06-29", time:"22:00", venue:"Arrowhead Stadium, Kansas City" },
      { id:"r32-9",  teamA:"A definir", teamB:"A definir", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-06-30", time:"12:00", venue:"Allegiant Stadium, Las Vegas" },
      { id:"r32-10", teamA:"A definir", teamB:"A definir", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-06-30", time:"15:00", venue:"Gillette Stadium, Boston" },
      { id:"r32-11", teamA:"A definir", teamB:"A definir", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-06-30", time:"19:00", venue:"Hard Rock Stadium, Miami" },
      { id:"r32-12", teamA:"A definir", teamB:"A definir", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-06-30", time:"22:00", venue:"Lumen Field, Seattle" },
      { id:"r32-13", teamA:"A definir", teamB:"A definir", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-07-01", time:"12:00", venue:"NRG Stadium, Houston" },
      { id:"r32-14", teamA:"A definir", teamB:"A definir", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-07-01", time:"15:00", venue:"Estadio Akron, Guadalajara" },
      { id:"r32-15", teamA:"A definir", teamB:"A definir", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-07-01", time:"19:00", venue:"BC Place, Vancouver" },
      { id:"r32-16", teamA:"A definir", teamB:"A definir", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-07-01", time:"22:00", venue:"Rose Bowl, Pasadena" },
    ],
    oitavas: [
      { id:"oit-1", teamA:"Venc. R32-1",  teamB:"Venc. R32-2",  scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-07-04", time:"15:00", venue:"A definir" },
      { id:"oit-2", teamA:"Venc. R32-3",  teamB:"Venc. R32-4",  scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-07-04", time:"19:00", venue:"A definir" },
      { id:"oit-3", teamA:"Venc. R32-5",  teamB:"Venc. R32-6",  scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-07-05", time:"15:00", venue:"A definir" },
      { id:"oit-4", teamA:"Venc. R32-7",  teamB:"Venc. R32-8",  scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-07-05", time:"19:00", venue:"A definir" },
      { id:"oit-5", teamA:"Venc. R32-9",  teamB:"Venc. R32-10", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-07-06", time:"15:00", venue:"A definir" },
      { id:"oit-6", teamA:"Venc. R32-11", teamB:"Venc. R32-12", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-07-06", time:"19:00", venue:"A definir" },
      { id:"oit-7", teamA:"Venc. R32-13", teamB:"Venc. R32-14", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-07-07", time:"15:00", venue:"A definir" },
      { id:"oit-8", teamA:"Venc. R32-15", teamB:"Venc. R32-16", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-07-07", time:"19:00", venue:"A definir" },
    ],
    quartas: [
      { id:"qrt-1", teamA:"Venc. Oit-1", teamB:"Venc. Oit-2", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-07-10", time:"15:00", venue:"A definir" },
      { id:"qrt-2", teamA:"Venc. Oit-3", teamB:"Venc. Oit-4", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-07-10", time:"19:00", venue:"A definir" },
      { id:"qrt-3", teamA:"Venc. Oit-5", teamB:"Venc. Oit-6", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-07-11", time:"15:00", venue:"A definir" },
      { id:"qrt-4", teamA:"Venc. Oit-7", teamB:"Venc. Oit-8", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-07-11", time:"19:00", venue:"A definir" },
    ],
    semi: [
      { id:"semi-1", teamA:"Venc. Qrt-1", teamB:"Venc. Qrt-2", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-07-14", time:"19:00", venue:"MetLife Stadium, Nova York" },
      { id:"semi-2", teamA:"Venc. Qrt-3", teamB:"Venc. Qrt-4", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-07-15", time:"19:00", venue:"Rose Bowl, Pasadena" },
    ],
    terceiro: [
      { id:"3rd-1", teamA:"Perd. Semi-1", teamB:"Perd. Semi-2", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-07-18", time:"16:00", venue:"Hard Rock Stadium, Miami" },
    ],
    final: [
      { id:"final-1", teamA:"Venc. Semi-1", teamB:"Venc. Semi-2", scoreA:null, scoreB:null, winner:null, extraTime:false, date:"2026-07-19", time:"16:00", venue:"MetLife Stadium, Nova York" },
    ],
  },

  // Participantes
  // ADMIN: adicione os participantes aqui e atualize os scores após cada rodada
  participants: [
    { name: "Odir",    emoji: "🧔", scores: { r32:0, oitavas:0, quartas:0, semi:0, terceiro:0, final:0 } },
    { name: "Renata",  emoji: "👩", scores: { r32:0, oitavas:0, quartas:0, semi:0, terceiro:0, final:0 } },
    { name: "João",    emoji: "👨", scores: { r32:0, oitavas:0, quartas:0, semi:0, terceiro:0, final:0 } },
    { name: "Isabela", emoji: "👱‍♀️", scores: { r32:0, oitavas:0, quartas:0, semi:0, terceiro:0, final:0 } },
    { name: "Wiliams", emoji: "🕺", scores: { r32:0, oitavas:0, quartas:0, semi:0, terceiro:0, final:0 } },
    { name: "Wagner",  emoji: "🎯", scores: { r32:0, oitavas:0, quartas:0, semi:0, terceiro:0, final:0 } },
  ],
};
