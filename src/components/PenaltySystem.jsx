// src/components/PenaltySystem.jsx
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme';

export const PenaltySystem = ({ penaltyData, onApplyPenalty }) => {
  if (!penaltyData) return null;

  return (
    <Modal transparent animationType="fade" visible={true}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>⚠️ AVERTISSEMENT DU SYSTÈME</Text>
          <Text style={styles.desc}>
            Vous avez échoué à terminer {penaltyData.count} quête(s) hier. La faiblesse a un prix, et votre réceptacle va en subir les conséquences.
          </Text>

          <View style={styles.penaltyBox}>
            <Text style={styles.penaltyLabel}>PÉNALITÉ APPLIQUÉE :</Text>
            <Text style={styles.penaltyText}>- {penaltyData.xp} XP</Text>
            {Object.entries(penaltyData.stats).map(([k, v]) => {
              if (v > 0) return <Text key={k} style={styles.penaltyText}>- {v.toFixed(1)} {k.toUpperCase()}</Text>
            })}
            <Text style={[styles.penaltyText, { color: THEME.gold, marginTop: 4 }]}>🔥 Streak réinitialisé (0)</Text>
          </View>

          <TouchableOpacity style={styles.btn} onPress={() => onApplyPenalty(penaltyData)}>
            <Text style={styles.btnText}>Accepter la sentence</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(153, 27, 27, 0.9)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: '#450a0a', borderWidth: 2, borderColor: '#ef4444', borderRadius: 16, padding: 22, alignItems: 'center', elevation: 15 },
  title: { color: '#f87171', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 12, letterSpacing: 1 },
  desc: { color: '#fca5a5', fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  penaltyBox: { backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: 1, borderColor: '#ef4444', width: '100%', padding: 16, borderRadius: 10, marginBottom: 20 },
  penaltyLabel: { color: '#f87171', fontSize: 12, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  penaltyText: { color: '#fecaca', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  btn: { backgroundColor: '#ef4444', width: '100%', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 }
});