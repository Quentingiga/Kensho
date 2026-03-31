// src/screens/DashboardScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { RankBadge } from '../components/RankBadge';
import { XPBar } from '../components/XPBar';
import { StatBar } from '../components/StatBar';
import { THEME } from '../constants/theme';
import { STATS } from '../constants/gameData';
import { getRank } from '../utils/helpers';

export const DashboardScreen = ({ player, onAI }) => {
  const r = getRank(player.level);
  const activeTitle = player.activeTitle || player.titles?.[0] || "Novice Éveillé";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.systemText}>LE SYSTÈME</Text>
        <Text style={styles.playerName}>{player.name.toUpperCase()}</Text>
        
        <View style={styles.activeTitleContainer}>
          <Text style={styles.activeTitleIcon}>✧</Text>
          <Text style={styles.activeTitleText}>{activeTitle}</Text>
          <Text style={styles.activeTitleIcon}>✧</Text>
        </View>
      </View>

      <View style={[styles.mainCard, { borderColor: `${r.c}33` }]}>
        <View style={styles.cardTop}>
          <RankBadge level={player.level} size="lg" />
          <View style={styles.levelInfo}>
            <Text style={styles.levelLabel}>NIVEAU</Text>
            <Text style={[styles.levelValue, { color: r.c }]}>{player.level}</Text>
            <Text style={styles.streakText}>🔥 Streak : {player.streak} jour{player.streak > 1 ? 's' : ''}</Text>
          </View>
        </View>
        <XPBar xp={player.xp} level={player.level} />
      </View>

      {/* 🤖 LE NOUVEAU BOUTON DU SYSTÈME */}
      <TouchableOpacity style={styles.aiButton} onPress={onAI} activeOpacity={0.8}>
        <Text style={styles.aiButtonIcon}>🔹</Text>
        <Text style={styles.aiButtonText}>SOLLICITER LE SYSTÈME</Text>
        <Text style={styles.aiButtonIcon}>🔹</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>STATISTIQUES</Text>
        {STATS.map(s => <StatBar key={s.k} s={s} val={player.stats[s.k]} />)}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  header: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
  systemText: { color: THEME.dim, fontSize: 11, letterSpacing: 3, fontWeight: 'bold' },
  playerName: { color: THEME.cyan, fontSize: 26, fontWeight: '900', marginTop: 4, letterSpacing: 1 },
  activeTitleContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 6, backgroundColor: 'rgba(251,191,36,0.1)', paddingHorizontal: 16, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(251,191,36,0.3)' },
  activeTitleText: { color: THEME.gold, fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginHorizontal: 8 },
  activeTitleIcon: { color: THEME.gold, fontSize: 14 },
  mainCard: { backgroundColor: THEME.surface2, borderWidth: 1, borderRadius: 20, padding: 20, marginBottom: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 16 },
  levelInfo: { flex: 1 },
  levelLabel: { color: THEME.dim, fontSize: 11, letterSpacing: 2 },
  levelValue: { fontSize: 44, fontWeight: '900', lineHeight: 48 },
  streakText: { color: THEME.gold, fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  
  // Style du bouton IA
  aiButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(6,182,212,.1)', borderWidth: 1, borderColor: THEME.cyan, borderRadius: 16, padding: 16, marginBottom: 14, gap: 10 },
  aiButtonIcon: { fontSize: 20 },
  aiButtonText: { color: THEME.cyan, fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },

  section: { backgroundColor: 'rgba(13,13,26,.92)', borderWidth: 1, borderColor: 'rgba(124,58,237,.18)', borderRadius: 16, padding: 16, marginBottom: 14 },
  sectionTitle: { color: THEME.dim, fontSize: 12, letterSpacing: 2, marginBottom: 14, fontWeight: 'bold' }
});