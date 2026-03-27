// src/components/PenaltySystem.jsx
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../constants/theme';
import { CAT, DXP } from '../constants/gameData';

export const PenaltySystem = ({ quests, onApplyPenalty }) => {
  const [penaltyData, setPenaltyData] = useState(null);

  useEffect(() => {
    const checkPenalty = async () => {
      try {
        const today = new Date().toDateString();
        const lastDate = await AsyncStorage.getItem('last_login_date');

        // Si c'est la toute première fois qu'on ouvre l'app, on initialise juste la date
        if (!lastDate) {
          await AsyncStorage.setItem('last_login_date', today);
          return;
        }

        // C'est un nouveau jour : on fait l'inventaire des échecs de la veille
        if (lastDate !== today) {
          const unfinished = quests.filter(q => !q.done);

          if (unfinished.length > 0) {
            let totalXp = 0;
            let statsLost = { force: 0, agilite: 0, intelligence: 0, volonte: 0 };

            unfinished.forEach(q => {
              // 1/5ème de l'XP prévue
              const xp = DXP[q.diff] || 60;
              totalXp += Math.floor(xp / 5); 
              
              // 1/5ème (0.2) du point de stat prévu
              const cat = CAT[q.category];
              if (cat && cat.stat) {
                statsLost[cat.stat] += 0.2;
              }
            });

            // On prépare le rapport de pénalité et on ouvre la modale
            setPenaltyData({ 
              xp: totalXp, 
              stats: statsLost, 
              ids: unfinished.map(q => q.id), 
              count: unfinished.length 
            });
          }

          // On met à jour la date d'aujourd'hui pour ne punir qu'une fois
          await AsyncStorage.setItem('last_login_date', today);
        }
      } catch (e) {
        console.log("Erreur PenaltySystem:", e);
      }
    };

    // On laisse le temps à l'application de charger avant de lancer le jugement (2 secondes)
    const timer = setTimeout(checkPenalty, 2000);
    return () => clearTimeout(timer);
  }, [quests]);

  const handleAcceptPenalty = () => {
    onApplyPenalty(penaltyData);
    setPenaltyData(null);
  };

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

          <TouchableOpacity style={styles.btn} onPress={handleAcceptPenalty}>
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