// src/components/BottomNav.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { THEME } from '../constants/theme';

const TABS = [
  { id: "dashboard", icon: "🏠", l: "Accueil" },
  { id: "quests", icon: "⚔️", l: "Tâches" },
  { id: "dungeons", icon: "🏰", l: "Hebdomadaire" },
  { id: "profile", icon: "👤", l: "Profil" }
];

export const BottomNav = ({ active, onChange }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {TABS.map(t => {
          const act = t.id === active;
          return (
            <TouchableOpacity 
              key={t.id} 
              onPress={() => onChange(t.id)} 
              style={styles.tab}
              activeOpacity={0.7}
            >
              <Text style={[styles.icon, act && styles.iconActive]}>{t.icon}</Text>
              <Text style={[styles.label, { color: act ? THEME.vlight : 'rgba(255,255,255,.3)' }]}>
                {t.l}
              </Text>
              {act && <View style={styles.indicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { backgroundColor: 'rgba(5,5,15,.97)' },
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: 'rgba(124,58,237,.22)',
    paddingVertical: 8,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  icon: { fontSize: 20, opacity: 0.6, marginBottom: 2 },
  iconActive: { opacity: 1, transform: [{ scale: 1.15 }] },
  label: { fontSize: 10, fontWeight: '500' },
  indicator: {
    position: 'absolute',
    bottom: -8,
    width: 20,
    height: 3,
    backgroundColor: THEME.violet,
    borderRadius: 2,
  }
});