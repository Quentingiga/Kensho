// src/components/QuestCard.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme';
import { CAT, DXP, DCL, STATS } from '../constants/gameData';

// ⬅️ On remplace onDelete par onDeleteRequest
export const QuestCard = ({ q, onComplete, onUndo, onDeleteRequest }) => {
  const cat = CAT[q.category] || { icon: "⚡", col: "#a78bfa", stat: "volonte" };
  const xp = DXP[q.diff] || 60;
  const dc = DCL[q.diff] || "#a78bfa";
  const st = STATS.find(s => s.k === cat.stat);

  return (
    <TouchableOpacity
      onPress={() => q.done ? onUndo(q.id) : onComplete(q.id)} 
      onLongPress={() => !q.done && onDeleteRequest(q)}
      delayLongPress={400} 
      style={[styles.card, q.done && styles.cardDone]}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={[styles.iconBox, { backgroundColor: `${cat.col}1a`, borderColor: `${cat.col}33` }]}>
          <Text style={styles.icon}>{cat.icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <View style={styles.header}>
            <Text style={[styles.title, q.done && { color: THEME.dim }]} numberOfLines={1}>
              {q.done ? "✓ " : ""}{q.title}
            </Text>
            <View style={[styles.diffBadge, { borderColor: dc }]}>
              <Text style={[styles.diffText, { color: dc }]}>{q.diff}</Text>
            </View>
          </View>
          <Text style={styles.desc} numberOfLines={2}>{q.desc}</Text>
          <View style={styles.footer}>
            <Text style={styles.xp}>+{xp} XP</Text>
            {st && <Text style={[styles.stat, { color: st.c }]}>+1 {st.l}</Text>}
            <Text style={styles.category}>{q.category}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(13,13,26,.95)', borderWidth: 1, borderColor: 'rgba(124,58,237,.32)', borderRadius: 13, padding: 15, marginBottom: 9 },
  cardDone: { backgroundColor: 'rgba(255,255,255,.02)', borderColor: 'rgba(255,255,255,.06)', opacity: 0.5 },
  content: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  iconBox: { width: 38, height: 38, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 18 },
  textContainer: { flex: 1, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 3, justifyContent: 'space-between' },
  title: { fontWeight: '700', fontSize: 15, color: THEME.text, flex: 1, marginRight: 8 },
  diffBadge: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2 },
  diffText: { fontSize: 10, fontWeight: '700' },
  desc: { fontSize: 12, color: THEME.dim, marginBottom: 5 },
  footer: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  xp: { color: THEME.vlight, fontSize: 12, fontWeight: 'bold' },
  stat: { fontSize: 11, fontWeight: 'bold' },
  category: { color: THEME.dim, fontSize: 10, marginLeft: 'auto', textTransform: 'uppercase', letterSpacing: 0.5 }
});