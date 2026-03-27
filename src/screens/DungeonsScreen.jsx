// src/screens/DungeonsScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { DungeonCard } from '../components/DungeonCard';
import { THEME } from '../constants/theme';

export const DungeonsScreen = ({ dungeons, onUpdate, onAdd }) => {
  const activeCount = dungeons.filter(d => !d.done).length;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>HEBDOMADAIRE</Text>
          <Text style={styles.counter}>{activeCount} actif{activeCount > 1 ? 's' : ''}</Text>
        </View>

        {dungeons.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏰</Text>
            <Text style={styles.emptyText}>Aucun donjon ouvert.{"\n"}Crée un objectif long terme !</Text>
          </View>
        )}

        {dungeons.map(d => <DungeonCard key={d.id} d={d} onUpdate={onUpdate} />)}
      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fabPrimary} onPress={onAdd}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  title: { fontSize: 20, fontWeight: 'bold', color: THEME.text },
  counter: { color: THEME.dim, fontSize: 13 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyText: { color: THEME.dim, textAlign: 'center', lineHeight: 22 },
  fabContainer: { position: 'absolute', bottom: 80, right: 16 },
  fabPrimary: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#0891b2', alignItems: 'center', justifyContent: 'center', elevation: 5 },
  fabText: { fontSize: 24, color: 'white' }
});