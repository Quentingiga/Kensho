"use no memo";

import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { THEME } from '../constants/theme';

export function SystemWidget({ player, tasks }) {
  const p = player || { level: 1, xp: 0 };
  const t = tasks || [];
  
  const xpNeed = Math.floor(120 * Math.pow(1.6, (p.level) - 1));
  let xpPct = Math.floor(((p.xp) / xpNeed) * 100);
  
  // Sécurisation du pourcentage
  if (xpPct < 0) xpPct = 0;
  if (xpPct > 100) xpPct = 100;

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: THEME.surface, 
        borderRadius: 16,
        padding: 16,
        borderWidth: 2,
        borderColor: THEME.violet, 
        flexDirection: 'column',
      }}
    >
      {/* 1. EN-TÊTE : NIVEAU ET XP */}
      <FlexWidget 
        style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 12, 
          width: 'match_parent' 
        }}
      >
        <TextWidget 
          text={`NIVEAU ${p.level}`} 
          style={{ fontSize: 18, color: THEME.violet, fontWeight: 'bold' }} 
        />
        <TextWidget 
          text={`${p.xp} / ${xpNeed} XP`} 
          style={{ fontSize: 12, color: THEME.dim, fontWeight: 'bold' }} 
        />
      </FlexWidget>

      {/* 2. BARRE D'XP */}
      <FlexWidget 
        style={{ 
          flexDirection: 'row', 
          height: 6, 
          backgroundColor: THEME.dim, 
          borderRadius: 3, 
          marginBottom: 16, 
          width: 'match_parent' 
        }}
      >
        {xpPct > 0 && (
          <FlexWidget 
            style={{ 
              height: 'match_parent', 
              backgroundColor: THEME.violet, 
              borderRadius: 3, 
              width: `${xpPct}%` 
            }} 
          />
        )}
      </FlexWidget>

      {/* 3. LISTE DES TÂCHES */}
      {t.length === 0 ? (
         <TextWidget 
            text="Toutes les quêtes sont terminées. Repos." 
            style={{ color: THEME.dim, fontSize: 13, textAlign: 'center', marginTop: 10 }} 
         />
      ) : (
        t.slice(0, 3).map((task, i) => {
           // ✂️ TRONCATURE À 25 CARACTÈRES MAXIMUM
           const fullTitle = task.title || "Tâche";
           const shortTitle = fullTitle.length > 25 
             ? fullTitle.substring(0, 25) + "..." 
             : fullTitle;

           return (
             <FlexWidget 
               key={i} 
               style={{ 
                 flexDirection: 'row', 
                 justifyContent: 'space-between', // 🎯 FORCE LE REJET AUX EXTRÉMITÉS
                 alignItems: 'center', 
                 marginBottom: 8, 
                 backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                 padding: 10, 
                 borderRadius: 8, 
                 width: 'match_parent' 
               }}
             >
                {/* ⬅️ GROUPE DE GAUCHE : Icône + Texte regroupés */}
                <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextWidget text={task.icon || "🎯"} style={{ fontSize: 16, marginRight: 10 }} />
                  <TextWidget text={shortTitle} style={{ fontSize: 14, color: THEME.text, maxLines: 1 }} />
                </FlexWidget>

                {/* ➡️ GROUPE DE DROITE : Le badge de Rang (poussé au bout) */}
                <FlexWidget style={{ backgroundColor: 'rgba(124, 58, 237, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                  <TextWidget text={`${task.diff || "E"}`} style={{ fontSize: 10, color: THEME.vlight, fontWeight: 'bold' }} />
                </FlexWidget>

             </FlexWidget>
           );
        })
      )}
    </FlexWidget>
  );
}