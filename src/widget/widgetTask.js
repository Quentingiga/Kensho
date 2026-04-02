// src/widget/widgetTask.js
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SystemWidget } from './SystemWidget';

const CAT_ICONS = {
  "Sport": "⚔", "Cardio": "⚡", "Mental": "🧘", "Étude": "📚", "Habitudes": "🎯"
};

export async function widgetTaskHandler(props) {
  try {
    const pStr = await AsyncStorage.getItem('sl_p');
    const qStr = await AsyncStorage.getItem('sl_q');

    let player = { level: 1, xp: 0 };
    let quests = [];

    if (pStr) player = JSON.parse(pStr);
    if (qStr) quests = JSON.parse(qStr);

    const activeQuests = quests.filter(q => !q.done);
    const mappedTasks = activeQuests.map(q => ({
      title: q.title,
      diff: q.diff,
      icon: CAT_ICONS[q.category] || "🎯"
    }));

    console.log("🛠️ [WIDGET] Injection du rendu dans Android...");
    
    // ⚠️ LA CORRECTION EST LÀ : On n'utilise pas "return", on appelle la fonction d'Android
    props.renderWidget(<SystemWidget player={player} tasks={mappedTasks} />);
    
  } catch (e) {
    console.error("❌ Erreur du Widget:", e);
    props.renderWidget(<SystemWidget player={{level: 1, xp: 0}} tasks={[]} />);
  }
}