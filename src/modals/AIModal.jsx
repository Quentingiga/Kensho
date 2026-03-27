// src/modals/AIModal.jsx
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { THEME } from '../constants/theme';
import { CAT, DXP } from '../constants/gameData';
import { getRank } from '../utils/helpers';

export const AIModal = ({ player, quests, dungeons, onAdd, onClose }) => {
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggs, setSuggs] = useState([]);
  const [sel, setSel] = useState(new Set());

  const getAge = (dobString) => {
    try {
      if (!dobString) return "Inconnu";
      const parts = dobString.split('/');
      if (parts.length !== 3) return "Inconnu";
      const birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age--;
      return age;
    } catch (e) {
      return "Inconnu";
    }
  };

  const generate = async () => {
    setLoading(true); setSuggs([]); setSel(new Set());
    
    try {
      const safeQuests = Array.isArray(quests) ? quests : [];
      const safeDungeons = Array.isArray(dungeons) ? dungeons : [];
      
      const age = getAge(player?.dob);
      const activeDungeons = safeDungeons.filter(d => !d?.done).map(d => d?.title).join(", ") || "Aucun";
      const recentQuests = safeQuests.filter(q => q?.done).slice(-10).map(q => q?.title).join(", ") || "Aucune";
      
      const s = player?.stats || {};
      const force = s.force || 5;
      const agilite = s.agilite || 5;
      const intelligence = s.intelligence || 5;
      const volonte = s.volonte || 5;

      // 🧮 CALCUL STRICT DES RANGS ET CATÉGORIES
      const RANKS_ORDER = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];
      const currentRankLetter = getRank(player?.level || 1).n;
      const rankIndex = Math.max(0, RANKS_ORDER.indexOf(currentRankLetter));
      const minRank = Math.max(0, rankIndex - 1);
      const maxRank = Math.min(RANKS_ORDER.length - 1, rankIndex + 1);
      const allowedRanks = RANKS_ORDER.slice(minRank, maxRank + 1).join(', ');

      const safeStats = { force, agilite, intelligence, volonte };
      const weakestStat = Object.keys(safeStats).reduce((a, b) => safeStats[a] < safeStats[b] ? a : b);
      
      // 🎲 On récupère toutes tes catégories dispo (ex: "Sport, Cardio, Mental...")
      const availableCategories = Object.keys(CAT).join(', ');

      /// 🧠 NOUVEAU : Récupération du Mindset
        const sedentary = player?.sedentary || "Non spécifié";
        const weakness = player?.weakness || "Non spécifié";
        const interests = player?.interests || "Non spécifié";
        const chronotype = player?.chronotype || "Non spécifié";

        const prompt = `Tu es un Coach de Vie et Entraîneur Sportif d'élite. Tu utilises un système de "Stats" et de "Rangs" pour gamifier l'expérience, mais tes conseils s'appliquent au MONDE RÉEL.
Ta mission : Générer EXACTEMENT 3 quêtes quotidiennes pour une évolution humaine lente, saine, constante et disciplinée. AUCUN roleplay fantastique abstrait.

📊 ANALYSE DU PROFIL :
- Niveau actuel : ${player?.level || 1}.
- Rang : ${currentRankLetter}. Rangs autorisés : [ ${allowedRanks} ].
- Mensurations & Activité : ${age} ans, ${player?.weight || "X"} kg, ${player?.height || "X"} cm. Niveau d'activité pro : ${sedentary}.
- Stats : Force ${force}, Agilité ${agilite}, Intelligence ${intelligence}, Volonté ${volonte}. Stat la plus faible : ${weakestStat.toUpperCase()}.
- Rythme biologique : ${chronotype}.
- Intérêts / Passions : ${interests}. (Sers-toi d'un ou plusieurs de ces éléments pour thématiser la quête 2).
- Points faibles psychologiques : ${weakness}. (⚠️ Cible l'UN SEUL de ces points faibles ou la stat ${weakestStat} pour la quête 3).

📜 HISTORIQUE :
${recentQuests}

⚠️ RÈGLES DE CRÉATION (OBLIGATOIRES) :
- Les quêtes doivent être EXTRÊMEMENT CONCRÈTES, ACTIONNABLES et MESURABLES.
- Utilise 3 catégories différentes parmi : [ ${availableCategories} ].
- Quête 1 (Physique) : Un entraînement ou une action de santé physique claire (adaptée à sa sédentarité).
- Quête 2 (Mental/Habitude) : Une action de productivité ou d'apprentissage, EN UTILISANT ses "Intérêts / Passions" pour le motiver.
- Quête 3 (Focus) : Cible sa stat la plus faible (${weakestStat}) OU son "Point faible psychologique" (${weakness}) avec une action concrète à réaliser aujourd'hui.

Dans le champ "desc", explique brièvement le bénéfice RÉEL de cette action sur sa vie.

Réponds UNIQUEMENT avec un tableau JSON de 3 objets. N'écris AUCUN texte avant ou après. Format EXACT:
[
  {"title":"Titre clair","category":"Sport","diff":"${currentRankLetter}","desc":"Le bénéfice réel..."}
]`;

      const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
      
      // 🛡️ L'Appel à Groq (Llama 3.1)
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 1500, // ⬅️ AJOUTE CETTE LIGNE POUR LUI DONNER LE TEMPS DE FINIR
          temperature: 0.7,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      // Extraction et nettoyage du texte
      let textResponse = data.choices[0].message.content.trim();
      textResponse = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      // 🛡️ LE PANSEMENT MAGIQUE : Si l'IA oublie le crochet de fin, on le rajoute !
      if (!textResponse.endsWith(']')) {
        // S'il y a une virgule qui traîne, on l'enlève pour éviter une erreur
        if (textResponse.endsWith(',')) {
          textResponse = textResponse.slice(0, -1);
        }
        textResponse += ']'; // On ferme le tableau de force !
      }
      
      const firstBracket = textResponse.indexOf('[');
      const lastBracket = textResponse.lastIndexOf(']');
      
      if (firstBracket !== -1 && lastBracket !== -1) {
        textResponse = textResponse.substring(firstBracket, lastBracket + 1);
      } else {
        throw new Error("L'IA n'a pas renvoyé de tableau JSON.");
      }
      
      const parsedQuests = JSON.parse(textResponse);
      
      if (!Array.isArray(parsedQuests)) throw new Error("Format invalide.");

      setSuggs(parsedQuests);
      setSel(new Set(parsedQuests.map((_, i) => i)));
      
    } catch (e) {
      console.log("Erreur détaillée Groq:", e.message);
      setSuggs([{ 
        title: "Erreur Système", 
        category: "Habitudes", 
        diff: "F", 
        desc: `Impossible de générer. (${e.message})` 
      }]);
    }
    setLoading(false);
  };

  const toggle = i => {
    const n = new Set(sel);
    n.has(i) ? n.delete(i) : n.add(i);
    setSel(n);
  };

  const confirm = () => {
    suggs.forEach((s, i) => { if (sel.has(i)) onAdd(s); });
    onClose();
  };

  return (
    <Modal transparent animationType="slide" visible={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>🤖 Éveil Quotidien (Système)</Text>
          <Text style={styles.desc}>Le Système analyse ton réceptacle...</Text>
          
          <View style={styles.inputRow}>
            <TextInput style={styles.input} placeholder="Une envie ? (ex: Repos...)" placeholderTextColor={THEME.dim} value={goal} onChangeText={setGoal} />
          </View>

          <TouchableOpacity style={styles.btnFetchFull} onPress={generate} disabled={loading}>
            <Text style={styles.btnFetchText}>{loading ? "Analyse en cours..." : "GÉNÉRER MES QUÊTES"}</Text>
          </TouchableOpacity>

          {loading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={THEME.cyan} />
            </View>
          )}

          {!loading && suggs.length > 0 && (
            <ScrollView style={styles.suggsList}>
              {suggs.map((s, i) => {
                const cat = CAT[s?.category] || { icon: "⚡", col: THEME.violet };
                const isSel = sel.has(i);
                return (
                  <TouchableOpacity key={i} onPress={() => toggle(i)} style={[styles.suggCard, isSel && styles.suggCardActive]}>
                    <View style={styles.suggHeader}>
                      <Text style={styles.suggTitle}>{cat.icon} {s?.title || "Quête Inconnue"}</Text>
                      {isSel && <Text style={{ color: THEME.cyan, fontWeight: 'bold' }}>✓</Text>}
                    </View>
                    <Text style={styles.suggDesc}>{s?.desc}</Text>
                    <View style={styles.suggFooter}>
                      <Text style={styles.suggXp}>+{DXP[s?.diff] || 60} XP</Text>
                      <View style={styles.suggBadge}><Text style={styles.suggBadgeText}>Rang {s?.diff || "E"}</Text></View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>{suggs.length > 0 ? "Ignorer" : "Fermer"}</Text>
            </TouchableOpacity>
            {sel.size > 0 && (
              <TouchableOpacity style={styles.submitBtn} onPress={confirm}>
                <Text style={styles.submitText}>Accepter ({sel.size})</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.85)', justifyContent: 'flex-end' },
  modal: { backgroundColor: THEME.surface, borderTopWidth: 1, borderColor: THEME.cyan, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, maxHeight: '92%' },
  title: { color: THEME.cyan, fontSize: 18, fontWeight: 'bold' },
  desc: { color: THEME.dim, fontSize: 12, marginBottom: 14, marginTop: 4 },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,.05)', borderWidth: 1, borderColor: 'rgba(6,182,212,.3)', color: THEME.text, borderRadius: 8, padding: 12 },
  btnFetchFull: { backgroundColor: 'rgba(6,182,212,.15)', borderWidth: 1, borderColor: THEME.cyan, borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 15 },
  btnFetchText: { color: THEME.cyan, fontWeight: 'bold', letterSpacing: 1 },
  loadingBox: { alignItems: 'center', paddingVertical: 40 },
  suggsList: { maxHeight: 350, marginBottom: 10 },
  suggCard: { backgroundColor: 'rgba(255,255,255,.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,.05)', borderRadius: 10, padding: 12, marginBottom: 8 },
  suggCardActive: { backgroundColor: 'rgba(6,182,212,.1)', borderColor: THEME.cyan },
  suggHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' },
  suggTitle: { color: THEME.text, fontWeight: 'bold', fontSize: 14 },
  suggDesc: { color: THEME.dim, fontSize: 12, marginBottom: 8, lineHeight: 18 },
  suggFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  suggXp: { color: THEME.vlight, fontSize: 12, fontWeight: 'bold' },
  suggBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  suggBadgeText: { color: THEME.text, fontSize: 10, fontWeight: 'bold' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', backgroundColor: 'rgba(255,255,255,.05)' },
  submitBtn: { flex: 2, padding: 14, borderRadius: 8, alignItems: 'center', backgroundColor: THEME.cyan },
  cancelText: { color: THEME.dim, fontWeight: 'bold' },
  submitText: { color: '#000', fontWeight: 'bold', fontSize: 15 }
});