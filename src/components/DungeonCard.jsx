// src/components/DungeonCard.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { THEME } from '../constants/theme';

export const DungeonCard = ({ d, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState(d.progress.toString());

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleBox}>
          <Text style={styles.icon}>🏰</Text>
          <Text style={styles.title}>{d.title}</Text>
        </View>
        {d.done && <Text style={styles.icon}>✅</Text>}
      </View>
      <Text style={styles.desc}>{d.desc}</Text>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.label}>Progression</Text>
          <Text style={styles.percent}>{d.progress}%</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${d.progress}%` }]} />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.xp}>+{d.xp} XP à la victoire</Text>
        {!d.done && (
          <TouchableOpacity onPress={() => setOpen(!open)} style={styles.btn}>
            <Text style={styles.btnText}>{open ? "Fermer" : "Mettre à jour"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {open && !d.done && (
        <View style={styles.updateBox}>
          <View style={styles.inputRow}>
            <Text style={{color: THEME.text}}>Nouveau % :</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={v}
              onChangeText={setV}
              maxLength={3}
            />
          </View>
          <TouchableOpacity 
            style={styles.confirmBtn} 
            onPress={() => { onUpdate(d.id, parseInt(v) || 0); setOpen(false); }}
          >
            <Text style={styles.confirmText}>Confirmer</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(13,13,26,.95)', borderWidth: 1, borderColor: 'rgba(6,182,212,.28)', borderRadius: 14, padding: 16, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  titleBox: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  icon: { fontSize: 18 },
  title: { fontSize: 14, color: THEME.text, fontWeight: 'bold' },
  desc: { fontSize: 12, color: THEME.dim, marginBottom: 10 },
  progressSection: { marginBottom: 10 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: 12, color: THEME.dim },
  percent: { color: '#60a5fa', fontWeight: 'bold', fontSize: 12 },
  track: { height: 9, backgroundColor: 'rgba(255,255,255,.06)', borderRadius: 99, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#06b6d4', borderRadius: 99 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xp: { fontSize: 12, color: THEME.vlight },
  btn: { backgroundColor: '#0e7490', paddingHorizontal: 13, paddingVertical: 5, borderRadius: 20 },
  btnText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  updateBox: { marginTop: 11, padding: 12, backgroundColor: 'rgba(255,255,255,.025)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(124,58,237,.18)' },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  input: { backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', padding: 8, borderRadius: 5, width: 60, textAlign: 'center', borderWidth: 1, borderColor: THEME.violet },
  confirmBtn: { backgroundColor: THEME.violet, padding: 9, borderRadius: 8, alignItems: 'center' },
  confirmText: { color: 'white', fontWeight: 'bold' }
});