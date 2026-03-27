// src/utils/helpers.js
import { RANKS } from '../constants/gameData';

export const xpNeed = l => Math.floor(120 * Math.pow(1.6, l - 1));
export const getRank = l => [...RANKS].reverse().find(r => l >= r.ml) || RANKS[0];
export const todayStr = () => new Date().toDateString();
export const uid = () => Math.random().toString(36).slice(2, 9);