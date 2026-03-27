// src/modals/AddDungeonModal.jsx
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

export const AddDungeonModal = ({ onAdd, onClose }) => {
  const [f, setF] = useState({ title: "", desc: "", xp: "500" });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  return (
    <Modal transparent animationType="slide" visible={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>🏰 Nouveau Donjon</Text>
          
          <TextInput style={styles.input} placeholder="Objectif (ex: Courir 5km)" placeholderTextColor={THEME.dim} value={f.title} onChangeText={t => set("title", t)} />
          <TextInput style={[styles.input, styles.textArea]} placeholder="Description" placeholderTextColor={THEME.dim} value={f.desc} onChangeText={t => set("desc", t)} multiline />
          
          <Text style={styles.label}>Récompense XP</Text>
          <TextInput style={styles.input} placeholder="Ex: 500" placeholderTextColor={THEME.dim} value={f.xp} onChangeText={t => set("xp", t)} keyboardType="numeric" />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={() => { if(f.title.trim()) { onAdd({ ...f, xp: parseInt(f.xp) || 500 }); onClose(); }}}>
              <Text style={styles.submitText}>Ouvrir le donjon</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.82)', justifyContent: 'flex-end' },
  modal: { backgroundColor: THEME.surface, borderTopWidth: 1, borderColor: 'rgba(6,182,212,.38)', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 40 },
  title: { color: '#60a5fa', fontSize: 18, fontWeight: 'bold', marginBottom: 18 },
  input: { backgroundColor: 'rgba(255,255,255,.05)', borderWidth: 1, borderColor: 'rgba(6,182,212,.3)', color: THEME.text, borderRadius: 8, padding: 12, marginBottom: 12 },
  textArea: { minHeight: 60, textAlignVertical: 'top' },
  label: { color: THEME.dim, fontSize: 12, marginBottom: 6, fontWeight: 'bold' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: 'rgba(255,255,255,.05)' },
  submitBtn: { flex: 2, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: '#0891b2' },
  cancelText: { color: THEME.dim, fontWeight: 'bold' },
  submitText: { color: 'white', fontWeight: 'bold' }
});