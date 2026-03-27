// src/components/StatBar.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

export const StatBar = ({ s, val }) => {
  const pct = Math.min(100, (val / 100) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{s.i} {s.l}</Text>
        <Text style={[styles.value, { color: s.c }]}>{val}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: s.c }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { color: THEME.dim, fontSize: 13 },
  value: { fontWeight: 'bold', fontSize: 14 },
  track: { height: 5, backgroundColor: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});