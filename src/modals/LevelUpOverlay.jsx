// src/modals/LevelUpOverlay.jsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { getRank } from '../utils/helpers';
import { THEME } from '../constants/theme';

export const LevelUpOverlay = ({ level, onDone }) => {
  const r = getRank(level);

  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, []);

  return (
    <Modal transparent animationType="fade" visible={true}>
      <View style={styles.overlay}>
        <View style={styles.centerBox}>
          <Text style={styles.icon}>⚡</Text>
          <Text style={[styles.title, { color: r.c }]}>LEVEL UP</Text>
          <Text style={[styles.levelText, { color: r.c, textShadowColor: r.c }]}>{level}</Text>
          <Text style={styles.rankText}>Rang <Text style={{ color: r.c }}>{r.n}</Text></Text>
          <Text style={styles.flavorText}>Tu deviens plus fort.</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.95)', justifyContent: 'center', alignItems: 'center' },
  centerBox: { alignItems: 'center' },
  icon: { fontSize: 50, marginBottom: 15 },
  title: { fontSize: 16, letterSpacing: 4, fontWeight: 'bold', marginBottom: 6 },
  levelText: { fontSize: 90, fontWeight: '900', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
  rankText: { fontSize: 20, color: THEME.text, marginTop: 12, fontWeight: 'bold' },
  flavorText: { color: THEME.dim, marginTop: 8, fontSize: 14 }
});