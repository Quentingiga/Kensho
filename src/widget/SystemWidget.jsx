// src/widget/SystemWidget.jsx
import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function SystemWidget({ player, tasks }) {
  // Calcul de l'XP requise (identique à helpers.js)
  const xpNeed = Math.floor(120 * Math.pow(1.6, (player?.level || 1) - 1));
  const xpPct = Math.min(100, ((player?.xp || 0) / xpNeed) * 100);

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#0d0d1a', // THEME.surface
        borderRadius: 16,
        padding: 16,
        borderWidth: 2,
        borderColor: '#06b6d4', // THEME.cyan
        flexDirection: 'column',
      }}
    >
      {/* 1. EN-TÊTE : NIVEAU ET XP */}
      <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <TextWidget 
          text={`NIVEAU ${player?.level || 1}`} 
          style={{ fontSize: 18, color: '#06b6d4', fontWeight: 'bold' }} 
        />
        <TextWidget 
          text={`${player?.xp || 0} / ${xpNeed} XP`} 
          style={{ fontSize: 12, color: '#94a3b8' }} 
        />
      </FlexWidget>

      {/* 2. BARRE D'XP */}
      <FlexWidget style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: 16, width: '100%' }}>
        <FlexWidget style={{ height: 6, width: `${xpPct}%`, backgroundColor: '#7c3aed', borderRadius: 3 }} />
      </FlexWidget>

      {/* 3. LISTE DES TÂCHES (Max 3) */}
      {tasks.slice(0, 3).map((task, i) => (
         <FlexWidget key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8, width: '100%' }}>
            <TextWidget text={task.icon} style={{ fontSize: 16, marginRight: 10 }} />
            {/* maxLines permet de couper le texte s'il est trop long avec des "..." */}
            <TextWidget text={task.title} style={{ fontSize: 14, color: '#e2e8f0', flex: 1, maxLines: 1 }} />
            
            <FlexWidget style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 }}>
              <TextWidget text={`RANG ${task.diff}`} style={{ fontSize: 10, color: '#a78bfa', fontWeight: 'bold' }} />
            </FlexWidget>
         </FlexWidget>
      ))}

      {tasks.length === 0 && (
         <TextWidget text="Toutes les quêtes sont terminées. Repos." style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', marginTop: 10, fontStyle: 'italic' }} />
      )}
    </FlexWidget>
  );
}