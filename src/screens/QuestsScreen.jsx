// src/screens/QuestsScreen.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native'; // ⬅️ Ajout de Modal
import { QuestCard } from '../components/QuestCard';
import { THEME } from '../constants/theme';
import { DCL } from '../constants/gameData';

export const QuestsScreen = ({ quests, player, onComplete, onUndo, onDelete, onAdd, onAI }) => {
  const [filter, setFilter] = useState('ALL');
  
  // 🗑️ Nouvel état pour gérer la quête qu'on veut supprimer
  const [questToDelete, setQuestToDelete] = useState(null);

  const done = quests.filter(q => q.done).length;
  const pct = quests.length ? (done / quests.length) * 100 : 0;
  const RANKS = ['ALL', 'S', 'A', 'B', 'C', 'D', 'E', 'F'];
  const filteredQuests = filter === 'ALL' ? quests : quests.filter(q => q.diff === filter);

  // Fonction pour confirmer la suppression
  const confirmDelete = () => {
    if (questToDelete) onDelete(questToDelete.id);
    setQuestToDelete(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>TÂCHES</Text>
          <Text style={styles.counter}>{done}/{quests.length}</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>

        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {RANKS.map(rank => {
              const isActive = filter === rank;
              const color = rank === 'ALL' ? THEME.vlight : (DCL[rank] || THEME.text);
              return (
                <TouchableOpacity
                  key={rank}
                  activeOpacity={0.7}
                  onPress={() => setFilter(rank)}
                  style={[styles.filterChip, isActive && { borderColor: color, backgroundColor: `${color}15` }]}
                >
                  <Text style={[styles.filterText, isActive && { color: color, fontWeight: 'bold' }]}>
                    {rank === 'ALL' ? 'TOUTES' : `RANG ${rank}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {filteredQuests.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⚔</Text>
            <Text style={styles.emptyText}>
              {filter === 'ALL' ? "Aucune quête active.\nGénère des quêtes avec l'IA !" : `Aucune quête de rang ${filter} pour le moment.`}
            </Text>
          </View>
        )}

        {filteredQuests.map(q => (
          <QuestCard 
            key={q.id} 
            q={q} 
            onComplete={onComplete} 
            onUndo={onUndo} 
            onDeleteRequest={setQuestToDelete}
          />
        ))}
      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fabPrimary} onPress={onAdd}><Text style={styles.fabText}>+</Text></TouchableOpacity>
      </View>

      {/* 🔴 MODALE DE SUPPRESSION SYSTÈME */}
      {questToDelete && (
        <Modal transparent animationType="fade" visible={true} onRequestClose={() => setQuestToDelete(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>⚠️ ABANDON DE QUÊTE</Text>
              <Text style={styles.modalText}>
                Le Système va effacer cet objectif :{"\n\n"}
                <Text style={styles.modalQuestName}>"{questToDelete.title}"</Text>
              </Text>
              
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setQuestToDelete(null)}>
                  <Text style={styles.modalCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalDeleteBtn} onPress={confirmDelete}>
                  <Text style={styles.modalDeleteText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  title: { fontSize: 20, fontWeight: 'bold', color: THEME.text },
  counter: { color: THEME.dim, fontSize: 14 },
  track: { height: 3, backgroundColor: 'rgba(255,255,255,.06)', borderRadius: 99, marginBottom: 12, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: THEME.violet },
  filterContainer: { marginHorizontal: -16, marginBottom: 16 },
  filterScroll: { paddingHorizontal: 16 },
  filterChip: { marginRight: 8, paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'transparent' },
  filterText: { color: THEME.dim, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyText: { color: THEME.dim, textAlign: 'center', lineHeight: 22 },
  fabContainer: { position: 'absolute', bottom: 80, right: 16, flexDirection: 'row', gap: 10 },
  fabPrimary: { width: 56, height: 56, borderRadius: 28, backgroundColor: THEME.violet, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  fabSecondary: { width: 48, height: 48, borderRadius: 24, backgroundColor: THEME.surface2, borderWidth: 1, borderColor: THEME.violet, alignItems: 'center', justifyContent: 'center', elevation: 5, alignSelf: 'center' },
  fabText: { fontSize: 24, color: 'white' },

  // Styles de la Modale de Suppression
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: THEME.surface2, borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)', borderRadius: 16, padding: 22, width: '82%', alignItems: 'center', elevation: 10 },
  modalTitle: { color: '#ef4444', fontSize: 15, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12 },
  modalText: { color: THEME.dim, fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  modalQuestName: { color: THEME.text, fontSize: 16, fontWeight: 'bold' },
  modalBtnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  modalDeleteBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: '#ef4444' },
  modalCancelText: { color: THEME.text, fontWeight: 'bold', fontSize: 14 },
  modalDeleteText: { color: '#ef4444', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 }
});