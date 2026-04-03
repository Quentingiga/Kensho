// src/modals/AIModal.jsx
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { THEME } from '../constants/theme';
import { CAT, DXP } from '../constants/gameData';
import { getRank } from '../utils/helpers';

export const AIModal = ({ player, quests, dungeons, onAdd, onDungeonGenerated, onClose }) => {
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggs, setSuggs] = useState([]);
  const [projectSugg, setProjectSugg] = useState(null);
  
  // Gestion de la sélection
  const [sel, setSel] = useState(new Set());
  const [projSel, setProjSel] = useState(true);

  const getAge = (dobString) => {
    try {
      if (!dobString) return "Inconnu";
      const parts = dobString.split('/');
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
    setLoading(true); setSuggs([]); setProjectSugg(null); setSel(new Set()); setProjSel(true);
    
    try {
      const safeQuests = Array.isArray(quests) ? quests : [];
      const age = getAge(player?.dob);
      const recentQuests = safeQuests.filter(q => q?.done).slice(-15).map(q => q?.title).join(", ") || "Aucune donnée";
      
      const safeDungeons = Array.isArray(dungeons) ? dungeons : [];
      const activeDungeonsCount = safeDungeons.filter(d => !d?.done).length;

      const s = player?.stats || {};
      const safeStats = { force: s.force || 5, agilite: s.agilite || 5, intelligence: s.intelligence || 5, volonte: s.volonte || 5, endurance: s.endurance || 5 };
      const weakestStat = Object.keys(safeStats).reduce((a, b) => safeStats[a] < safeStats[b] ? a : b);

      const RANKS_ORDER = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];
      const currentRankLetter = getRank(player?.level || 1).n;
      const rankIndex = Math.max(0, RANKS_ORDER.indexOf(currentRankLetter));
      const allowedRanks = RANKS_ORDER.slice(Math.max(0, rankIndex - 1), Math.min(RANKS_ORDER.length - 1, rankIndex + 1) + 1).join(', ');

      const deviceLang = Intl.DateTimeFormat().resolvedOptions().locale || 'fr-FR';

      // 🧠 LE CERVEAU DU SYSTÈME
      const systemPrompt = `You are the "System", a cold, analytical, and highly demanding life-optimization AI coach. Your absolute goal is the continuous, global evolution of the "Vessel" (the user). No fantasy roleplay.

📊 VESSEL DATA:
- Rank & Level: Rank ${currentRankLetter} (Level ${player?.level || 1}). Allowed ranks: [${allowedRanks}].
- Body: ${age}yo | ${player?.weight || "X"}kg | ${player?.height || "X"}cm. Activity: ${player?.sedentary || "Unknown"}.
- Mindset: Interests: [${player?.interests || "None"}]. Weaknesses: [${player?.weakness || "None"}].
- Stats: STR ${safeStats.force}, AGI ${safeStats.agilite}, INT ${safeStats.intelligence}, WIL ${safeStats.volonte}, END ${safeStats.endurance}. Current Weakest: ${weakestStat.toUpperCase()}.
- Recent tasks: ${recentQuests}
- Active Long-Term Projects (Epreuves): ${activeDungeonsCount}

⚠️ OPERATIONAL DIRECTIVES:
1. PROGRESSIVE OVERLOAD: Tasks MUST scale with the Vessel's Rank.
2. ADAPT TO REQUEST: The user provides a specific request. Generate EXACTLY 3 daily tasks that fit this request.
3. TONE & DESCRIPTION: 'desc' field MUST be cold, analytical, and include a simulated real-world stat estimation.
4. LONG-TERM PROJECT (ÉPREUVE): GENERATE 1 massive Project. It MUST draw heavily from the Vessel's Interests: [${player?.interests}]. It must be a concrete, long-term goal yielding 1500 XP. Do this even if active projects exist, to offer a new path of evolution.
5. LANGUAGE: Output strictly in ${deviceLang}.

You MUST reply ONLY with a JSON object. EXACT Format:
{
  "tasks": [
    {"title": "Pompes strictes: 15 reps", "category": "Sport", "diff": "${currentRankLetter}", "desc": "Analyse musculaire en cours. Optimisation estimée: +0.2%."}
  ],
  "project": {
    "title": "Coder un algorithme de tri complexe",
    "desc": "Projet basé sur 'Tech'. Augmentation drastique de l'intelligence prévue.",
    "xp": 1500
  }
}`;

      const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{
            parts: [{ text: `Requête spécifique du réceptacle : "${goal || "Génère un protocole d'évolution standard."}"` }]
          }],
          generationConfig: {
            temperature: 0.65,
            responseMimeType: "application/json"
          }
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      
      let textResponse = data.candidates[0].content.parts[0].text.trim();
      textResponse = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      const firstBrace = textResponse.indexOf('{');
      const lastBrace = textResponse.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        textResponse = textResponse.substring(firstBrace, lastBrace + 1);
      } else {
        throw new Error("Erreur de formatage Système.");
      }

      const parsedData = JSON.parse(textResponse);

      if (parsedData.tasks && Array.isArray(parsedData.tasks)) {
        setSuggs(parsedData.tasks);
        setSel(new Set(parsedData.tasks.map((_, i) => i)));
      } else {
        throw new Error("Format des tâches invalide.");
      }

      if (parsedData.project) {
        setProjectSugg(parsedData.project);
      }
      
    } catch (e) {
      console.log("Erreur détaillée Gemini:", e.message);
      setSuggs([{ 
        title: "Erreur Système", 
        category: "Habitudes", 
        diff: "F", 
        desc: `Impossible de calculer l'évolution. (${e.message})` 
      }]);
    }
    setLoading(false);
  };

  const toggleTask = i => {
    const n = new Set(sel);
    n.has(i) ? n.delete(i) : n.add(i);
    setSel(n);
  };

  const confirm = () => {
    suggs.forEach((s, i) => { if (sel.has(i)) onAdd(s); });
    if (projectSugg && projSel && onDungeonGenerated) {
      onDungeonGenerated(projectSugg);
    }
    onClose();
  };

  const totalSelected = sel.size + (projectSugg && projSel ? 1 : 0);

  return (
    <Modal transparent animationType="slide" visible={true} onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>🤖 Requête au Système</Text>
            <Text style={styles.desc}>Ajustement du protocole selon vos directives.</Text>
            
            <View style={styles.inputRow}>
              <TextInput 
                style={styles.input} 
                placeholder="Ex: Axé sur la lecture aujourd'hui..." 
                placeholderTextColor={THEME.dim} 
                value={goal} 
                onChangeText={setGoal} 
              />
            </View>

            <TouchableOpacity style={styles.btnFetchFull} onPress={generate} disabled={loading}>
              <Text style={styles.btnFetchText}>{loading ? "Calcul en cours..." : "GÉNÉRER MON PROTOCOLE"}</Text>
            </TouchableOpacity>

            {loading && (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={THEME.cyan} />
              </View>
            )}

            {!loading && (suggs.length > 0 || projectSugg) && (
              <ScrollView style={styles.suggsList} showsVerticalScrollIndicator={false}>
                
                {/* AFFICHAGE DU PROJET SI GÉNÉRÉ */}
                {projectSugg && (
                  <View style={styles.projectSection}>
                    <Text style={styles.sectionTitle}>NOUVELLE ÉPREUVE (LONG TERME)</Text>
                    <TouchableOpacity onPress={() => setProjSel(!projSel)} style={[styles.suggCard, projSel && styles.projectCardActive]}>
                      <View style={styles.suggHeader}>
                        <Text style={styles.suggTitle}>🏰 {projectSugg.title}</Text>
                        {projSel && <Text style={{ color: THEME.gold, fontWeight: 'bold' }}>✓</Text>}
                      </View>
                      <Text style={styles.suggDesc}>{projectSugg.desc}</Text>
                      <View style={styles.suggFooter}>
                        <Text style={[styles.suggXp, { color: THEME.gold }]}>+{projectSugg.xp || 1500} XP</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

                {/* AFFICHAGE DES TÂCHES */}
                {suggs.length > 0 && (
                  <View>
                    <Text style={styles.sectionTitle}>TÂCHES QUOTIDIENNES</Text>
                    {suggs.map((s, i) => {
                      const cat = CAT[s?.category] || { icon: "⚡", col: THEME.violet };
                      const isSel = sel.has(i);
                      return (
                        <TouchableOpacity key={i} onPress={() => toggleTask(i)} style={[styles.suggCard, isSel && styles.suggCardActive]}>
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
                  </View>
                )}
              </ScrollView>
            )}

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>{(suggs.length > 0 || projectSugg) ? "Ignorer" : "Fermer"}</Text>
              </TouchableOpacity>
              {totalSelected > 0 && (
                <TouchableOpacity style={styles.submitBtn} onPress={confirm}>
                  <Text style={styles.submitText}>Accepter ({totalSelected})</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  
  suggsList: { maxHeight: 400, marginBottom: 10 },
  sectionTitle: { color: THEME.dim, fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  
  suggCard: { backgroundColor: 'rgba(255,255,255,.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,.05)', borderRadius: 10, padding: 12, marginBottom: 8 },
  suggCardActive: { backgroundColor: 'rgba(6,182,212,.1)', borderColor: THEME.cyan },
  projectCardActive: { backgroundColor: 'rgba(251,191,36,.1)', borderColor: THEME.gold },
  
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