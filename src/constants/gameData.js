// src/constants/gameData.js

export const RANKS = [
  { n: "E", ml: 1, c: "#9ca3af", g: "rgba(156,163,175,.55)" },
  { n: "D", ml: 10, c: "#34d399", g: "rgba(52,211,153,.55)" },
  { n: "C", ml: 20, c: "#60a5fa", g: "rgba(96,165,250,.55)" },
  { n: "B", ml: 35, c: "#a78bfa", g: "rgba(167,139,250,.55)" },
  { n: "A", ml: 50, c: "#fb923c", g: "rgba(251,146,60,.55)" },
  { n: "S", ml: 70, c: "#f87171", g: "rgba(248,113,113,.55)" },
  { n: "SS", ml: 90, c: "#fbbf24", g: "rgba(251,191,36,.55)" },
  { n: "SSS", ml: 100, c: "#ffffff", g: "rgba(255,255,255,.7)" },
];

export const CAT = {
  "Sport": { stat: "force", icon: "⚔", col: "#f87171" },
  "Cardio": { stat: "agilite", icon: "⚡", col: "#34d399" },
  "Mental": { stat: "endurance", icon: "🧘", col: "#60a5fa" },
  "Étude": { stat: "intelligence", icon: "📚", col: "#a78bfa" },
  "Habitudes": { stat: "volonte", icon: "🎯", col: "#fbbf24" },
};

export const STATS = [
  { k: "force", l: "Force", i: "⚔", c: "#f87171" },
  { k: "agilite", l: "Agilité", i: "⚡", c: "#34d399" },
  { k: "intelligence", l: "Intelligence", i: "📚", c: "#a78bfa" },
  { k: "endurance", l: "Endurance", i: "🧘", c: "#60a5fa" },
  { k: "volonte", l: "Volonté", i: "🎯", c: "#fbbf24" },
];

export const DXP = { F: 30, E: 60, D: 120, C: 240, B: 450, A: 800, S: 1400 };
export const DCL = { F: "#6b7280", E: "#9ca3af", D: "#34d399", C: "#60a5fa", B: "#a78bfa", A: "#fb923c", S: "#f87171" };

export const DEF_PLAYER = { 
  name: "Chasseur", level: 1, xp: 0, 
  stats: { force: 5, agilite: 5, intelligence: 5, endurance: 5, volonte: 5 }, 
  streak: 0, lastDate: null, titles: ["Novice Éveillé"] 
};

export const INIT_QUESTS = [
  { id: "q1", title: "20 Pompes", category: "Sport", diff: "E", daily: true, done: false, desc: "Réalise 20 pompes consécutives" },
  { id: "q2", title: "Méditer 10 min", category: "Mental", diff: "F", daily: true, done: false, desc: "Méditation en pleine conscience" },
  { id: "q3", title: "Lire 20 pages", category: "Étude", diff: "E", daily: true, done: false, desc: "Tout livre de ton choix" },
];

export const INIT_DUNGEONS = [
  { id: "d1", title: "Courir 5km sans s'arrêter", desc: "Entraîne-toi progressivement jusqu'à tenir 5km", xp: 1500, progress: 0, done: false },
];