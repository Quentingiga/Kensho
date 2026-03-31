// src/widget/widgetTask.js
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SystemWidget } from './SystemWidget';

// On recrée rapidement le mapping des icônes pour le widget
const CAT_ICONS = {
  "Sport": "⚔", "Cardio": "⚡", "Mental": "🧘", "Étude": "📚", "Habitudes": "🎯"
};

export async function widgetTaskHandler({ widgetAction }) {
  try {
    // Le widget lit les mêmes données que l'application principale
    const pStr = await AsyncStorage.getItem('sl_p');
    const qStr = await AsyncStorage.getItem('sl_q');

    let player = { level: 1, xp: 0 };
    let quests = [];

    if (pStr) player = JSON.parse(pStr);
    if (qStr) quests = JSON.parse(qStr);

    // On ne garde que les quêtes non terminées (pour mettre la pression au Chasseur)
    const activeQuests = quests.filter(q => !q.done);
    
    const mappedTasks = activeQuests.map(q => ({
      title: q.title,
      diff: q.diff,
      icon: CAT_ICONS[q.category] || "🎯"
    }));

    return {
      props: { player, tasks: mappedTasks },
      widget: SystemWidget,
    };
  } catch (e) {
    console.error("Erreur du Widget:", e);
    return { props: { player: {level: 1, xp: 0}, tasks: [] }, widget: SystemWidget };
  }
}