// src/components/RankBadge.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getRank } from '../utils/helpers';

export const RankBadge = ({ level, size = "md" }) => {
  const r = getRank(level);
  const s = size === "lg" ? { w: 72, fs: 28 } : size === "sm" ? { w: 28, fs: 12 } : { w: 46, fs: 18 };
  
  return (
    <View style={[
      styles.badge, 
      { width: s.w, height: s.w, borderRadius: s.w / 2, borderColor: r.c, shadowColor: r.c }
    ]}>
      <Text style={[styles.text, { color: r.c, fontSize: s.fs }]}>{r.n}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5, // Pour l'ombre sur Android
  },
  text: {
    fontWeight: '900',
  }
});