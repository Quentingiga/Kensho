// src/screens/DashboardScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RankBadge } from '../components/RankBadge';
import { XPBar } from '../components/XPBar';
import { StatBar } from '../components/StatBar';
import { THEME } from '../constants/theme';
import { STATS } from '../constants/gameData';
import { getRank } from '../utils/helpers';

export const DashboardScreen = ({ player }) => {
  const r = getRank(player.level);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.systemText}>LE SYSTÈME</Text>
        <Text style={styles.playerName}>{player.name.toUpperCase()}</Text>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>STATISTIQUES</Text>
        {STATS.map(s => <StatBar key={s.k} s={s} val={player.stats[s.k]} />)}
      </View>

      <View style={[styles.section, { borderColor: 'rgba(251,191,36,.18)' }]}>
        <Text style={styles.sectionTitle}>TITRES</Text>
        <View style={styles.titlesGrid}>
          {player.titles.map((t, i) => (
            <View key={i} style={styles.titleBadge}>
              <Text style={styles.titleText}>{t}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  header: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
  systemText: { color: THEME.dim, fontSize: 11, letterSpacing: 3, fontWeight: 'bold' },
  playerName: { color: THEME.cyan, fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  mainCard: { backgroundColor: THEME.surface2, borderWidth: 1, borderRadius: 20, padding: 20, marginBottom: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 16 },
  levelInfo: { flex: 1 },
  levelLabel: { color: THEME.dim, fontSize: 11, letterSpacing: 2 },
  levelValue: { fontSize: 44, fontWeight: '900', lineHeight: 48 },
  streakText: { color: THEME.gold, fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  section: { backgroundColor: 'rgba(13,13,26,.92)', borderWidth: 1, borderColor: 'rgba(124,58,237,.18)', borderRadius: 16, padding: 16, marginBottom: 14 },
  sectionTitle: { color: THEME.dim, fontSize: 12, letterSpacing: 2, marginBottom: 14, fontWeight: 'bold' },
  titlesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  titleBadge: { borderWidth: 1, borderColor: 'rgba(251,191,36,.38)', paddingHorizontal: 11, paddingVertical: 4, borderRadius: 99 },
  titleText: { color: THEME.gold, fontSize: 12, fontWeight: 'bold' }
});