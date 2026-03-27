// src/modals/AddQuestModal.jsx
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { THEME } from '../constants/theme';
import { CAT, DXP } from '../constants/gameData';

export const AddQuestModal = ({ onAdd, onClose }) => {
  const [f, setF] = useState({ title: "", category: "Sport", diff: "D", desc: "" });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  return (
    <Modal transparent animationType="slide" visible={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>⚔ Nouvelle Quête</Text>
          
          <TextInput style={styles.input} placeholder="Titre de la quête" placeholderTextColor={THEME.dim} value={f.title} onChangeText={t => set("title", t)} />
          
          <Text style={styles.label}>Catégorie</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
            {Object.keys(CAT).map(c => (
              <TouchableOpacity key={c} onPress={() => set("category", c)} style={[styles.chip, f.category === c && styles.chipActive]}>
                <Text style={styles.chipText}>{CAT[c].icon} {c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Difficulté</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
            {Object.keys(DXP).map(d => (
              <TouchableOpacity key={d} onPress={() => set("diff", d)} style={[styles.chip, f.diff === d && styles.chipActive]}>
                <Text style={styles.chipText}>Rang {d} ({DXP[d]} XP)</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput style={[styles.input, styles.textArea]} placeholder="Description (optionnel)" placeholderTextColor={THEME.dim} value={f.desc} onChangeText={t => set("desc", t)} multiline />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={() => { if(f.title.trim()) { onAdd(f); onClose(); }}}>
              <Text style={styles.submitText}>Créer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.82)', justifyContent: 'flex-end' },
  modal: { backgroundColor: THEME.surface, borderTopWidth: 1, borderColor: 'rgba(124,58,237,.38)', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 40 },
  title: { color: THEME.vlight, fontSize: 18, fontWeight: 'bold', marginBottom: 18 },
  input: { backgroundColor: 'rgba(255,255,255,.05)', borderWidth: 1, borderColor: 'rgba(124,58,237,.3)', color: THEME.text, borderRadius: 8, padding: 12, marginBottom: 12 },
  textArea: { minHeight: 60, textAlignVertical: 'top' },
  label: { color: THEME.dim, fontSize: 12, marginBottom: 6, fontWeight: 'bold' },
  scrollRow: { marginBottom: 15, maxHeight: 40 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,.05)', marginRight: 8, borderWidth: 1, borderColor: 'transparent' },
  chipActive: { backgroundColor: 'rgba(124,58,237,.2)', borderColor: THEME.violet },
  chipText: { color: THEME.text, fontSize: 13 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: 'rgba(255,255,255,.05)' },
  submitBtn: { flex: 2, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: THEME.violet },
  cancelText: { color: THEME.dim, fontWeight: 'bold' },
  submitText: { color: 'white', fontWeight: 'bold' }
});