// src/components/AutoSystem.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../constants/theme';
import { CAT } from '../constants/gameData';
import { getRank } from '../utils/helpers';

export const AutoSystem = ({ player, quests, dungeons, onQuestGenerated, onDungeonGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const checkDaily = async () => {
      try {
        const today = new Date().toDateString();
        const lastDate = await AsyncStorage.getItem('last_auto_quest_date');

        if (lastDate === today) return;

        setIsGenerating(true);

        const safeQuests = Array.isArray(quests) ? quests : [];
        const recentQuests = safeQuests.filter(q => q?.done).slice(-15).map(q => q?.title).join(", ") || "Aucune donnée récente";

        // Vérification des Projets en cours
        const safeDungeons = Array.isArray(dungeons) ? dungeons : [];
        const activeDungeonsCount = safeDungeons.filter(d => !d?.done).length;
        const needsNewProject = activeDungeonsCount === 0;

        let age = "Inconnu";
        if (player?.dob) {
          const parts = player.dob.split('/');
          const birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
          const d = new Date();
          age = d.getFullYear() - birthDate.getFullYear();
          if (d.getMonth() < birthDate.getMonth() || (d.getMonth() === birthDate.getMonth() && d.getDate() < birthDate.getDate())) age--;
        }

        const s = player?.stats || {};
        const safeStats = { force: s.force || 5, agilite: s.agilite || 5, intelligence: s.intelligence || 5, volonte: s.volonte || 5, endurance: s.endurance || 5 };
        const weakestStat = Object.keys(safeStats).reduce((a, b) => safeStats[a] < safeStats[b] ? a : b);

        const currentRankLetter = getRank(player?.level || 1).n;
        const availableCategories = Object.keys(CAT).join(', ');
        const deviceLang = Intl.DateTimeFormat().resolvedOptions().locale || 'fr-FR';

        // 🧠 LE CERVEAU DU SYSTÈME - PROMPT OPTIMISÉ
        const systemPrompt = `You are the "System", a cold, analytical, and highly demanding life-optimization AI coach. Your absolute goal is the continuous, global evolution of the "Vessel" (the user) towards perfection. No fantasy roleplay.

📊 VESSEL DATA (Analyze carefully for scaling):
- Rank & Level: Rank ${currentRankLetter} (Level ${player?.level || 1}).
- Body Profile: ${age}yo | ${player?.weight || "X"}kg | ${player?.height || "X"}cm.
- Lifestyle: ${player?.sedentary || "Unknown"}.
- Mindset: Interests: [${player?.interests || "None"}]. Weaknesses: [${player?.weakness || "None"}].
- Stats: STR ${safeStats.force}, AGI ${safeStats.agilite}, INT ${safeStats.intelligence}, WIL ${safeStats.volonte}, END ${safeStats.endurance}. Current Weakest: ${weakestStat.toUpperCase()}.
- Recent tasks (Avoid exact repetition, vary the methods): ${recentQuests}

⚠️ OPERATIONAL DIRECTIVES:
1. PROGRESSIVE OVERLOAD (Crescendo): Tasks MUST scale with the Vessel's Rank. A Rank E gets accessible but challenging tasks. A Rank S gets extreme tasks. Take age/weight into account to avoid injury, but push them past their limits.
2. GLOBAL IMPROVEMENT: Do not just focus on the weakness. Ensure a mix of physical, mental, and intellectual growth over time.
3. TONE & DESCRIPTION: The 'desc' field MUST be written in a cold, analytical, or strict coach tone. It MUST include a simulated real-world stat estimation (e.g., "Augmentation estimée de la capacité pulmonaire: +0.4%").
4. LONG-TERM PROJECT: ${needsNewProject ? `GENERATE 1 massive Project. It MUST draw heavily from the Vessel's Interests: [${player?.interests}]. It must be a concrete, long-term goal (weeks/months) yielding 1500 XP.` : `DO NOT GENERATE A PROJECT. Active project exists.`}
5. LANGUAGE: Output strictly in ${deviceLang}.

You MUST reply ONLY with a JSON object. EXACT Format:
{
  "tasks": [
    {"title": "Pompes strictes: 15 reps", "category": "Sport", "diff": "${currentRankLetter}", "desc": "Analyse musculaire en cours. Optimisation de la force estimée à +0.2%. Exécution requise."}
  ]${needsNewProject ? `,
  "project": {
    "title": "Coder un algorithme de tri complexe",
    "desc": "Projet à long terme basé sur l'intérêt 'Tech/Code'. Augmentation drastique de l'intelligence prévue.",
    "xp": 1500
  }` : ''}
}`;

        const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY; 
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
        
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: "Système, génère mon protocole d'évolution quotidien." }] }],
            generationConfig: { temperature: 0.65, responseMimeType: "application/json" } // Température légèrement baissée pour plus de précision et de rationalité
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

        // Déploiement des tâches
        if (parsedData.tasks && Array.isArray(parsedData.tasks)) {
          parsedData.tasks.forEach((q, index) => {
            setTimeout(() => onQuestGenerated(q), index * 100); 
          });
        }

        // Déploiement du Projet
        if (parsedData.project && onDungeonGenerated) {
          setTimeout(() => onDungeonGenerated(parsedData.project), 500);
        }

        await AsyncStorage.setItem('last_auto_quest_date', today);
        setTimeout(() => setIsGenerating(false), 1500);

      } catch (e) {
        console.log("Erreur AutoSystem:", e.message);
        setIsGenerating(false);
      }
    };

    const timer = setTimeout(checkDaily, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isGenerating) return null;

  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>⚠️ AVIS DU SYSTÈME</Text>
      <ActivityIndicator size="large" color={THEME.cyan} style={{ marginVertical: 35, transform: [{ scale: 1.5 }] }} />
      <Text style={styles.desc}>Calcul du protocole d'évolution...</Text>
      <Text style={styles.subdesc}>Analyse des statistiques et intérêts du réceptacle</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(5, 5, 15, 0.98)', zIndex: 9999, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { color: THEME.cyan, fontSize: 24, fontWeight: 'bold', letterSpacing: 2, textAlign: 'center' },
  desc: { color: THEME.text, fontSize: 16, textAlign: 'center', fontWeight: 'bold' },
  subdesc: { color: THEME.dim, fontSize: 13, textAlign: 'center', marginTop: 12, fontStyle: 'italic' }
});