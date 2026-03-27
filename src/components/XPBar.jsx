// src/components/XPBar.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { xpNeed } from '../utils/helpers';
import { THEME } from '../constants/theme';

export const XPBar = ({ xp, level }) => {
  const need = xpNeed(level);
  const pct = Math.min(100, (xp / need) * 100);

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.label}>XP</Text>
        <Text style={styles.values}>{xp} / {need}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { color: THEME.dim, fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  values: { color: THEME.dim, fontSize: 12 },
  track: { height: 8, backgroundColor: 'rgba(255,255,255,.07)', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: THEME.violet, borderRadius: 4 },
});