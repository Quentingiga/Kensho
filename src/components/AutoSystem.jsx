// src/components/AutoSystem.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../constants/theme';
import { CAT } from '../constants/gameData';
import { getRank } from '../utils/helpers';

export const AutoSystem = ({ player, quests, onQuestGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const checkDaily = async () => {
      try {
        // 1. On vérifie la date du jour
        const today = new Date().toDateString();
        const lastDate = await AsyncStorage.getItem('last_auto_quest_date');

        // Si les quêtes ont déjà été générées aujourd'hui, le composant reste invisible et ne fait rien !
        if (lastDate === today) return;

        // 2. C'est un nouveau jour ! On bloque l'écran pour montrer que le Système travaille
        setIsGenerating(true);

        const safeQuests = Array.isArray(quests) ? quests : [];
        const recentQuests = safeQuests.filter(q => q?.done).slice(-10).map(q => q?.title).join(", ") || "Aucune";

        let age = "Inconnu";
        if (player?.dob) {
          const parts = player.dob.split('/');
          const birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
          const d = new Date();
          age = d.getFullYear() - birthDate.getFullYear();
          if (d.getMonth() < birthDate.getMonth() || (d.getMonth() === birthDate.getMonth() && d.getDate() < birthDate.getDate())) age--;
        }

        const s = player?.stats || {};
        const force = s.force || 5;
        const agilite = s.agilite || 5;
        const intelligence = s.intelligence || 5;
        const volonte = s.volonte || 5;

        const safeStats = { force, agilite, intelligence, volonte };
        const weakestStat = Object.keys(safeStats).reduce((a, b) => safeStats[a] < safeStats[b] ? a : b);

        const RANKS_ORDER = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];
        const currentRankLetter = getRank(player?.level || 1).n;
        const rankIndex = Math.max(0, RANKS_ORDER.indexOf(currentRankLetter));
        const minRank = Math.max(0, rankIndex - 1);
        const maxRank = Math.min(RANKS_ORDER.length - 1, rankIndex + 1);
        const allowedRanks = RANKS_ORDER.slice(minRank, maxRank + 1).join(', ');

        const availableCategories = Object.keys(CAT).join(', ');

        // 🧠 NOUVEAU : Récupération du Mindset
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
        
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
          body: JSON.stringify({ model: "llama-3.1-8b-instant", max_tokens: 1500, temperature: 0.7, messages: [{ role: "user", content: prompt }] })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        
        let textResponse = data.choices[0].message.content.trim();
        textResponse = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        if (!textResponse.endsWith(']')) {
          if (textResponse.endsWith(',')) textResponse = textResponse.slice(0, -1);
          textResponse += ']'; 
        }
        
        const firstBracket = textResponse.indexOf('[');
        const lastBracket = textResponse.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1) {
          textResponse = textResponse.substring(firstBracket, lastBracket + 1);
        } else throw new Error("Format JSON invalide.");
        
        const parsedQuests = JSON.parse(textResponse);

        // 3. Magie d'intégration automatique : On ajoute les quêtes une par une avec un mini-délai
        if (Array.isArray(parsedQuests)) {
          parsedQuests.forEach((q, index) => {
            setTimeout(() => onQuestGenerated(q), index * 100); 
          });
          // On sauvegarde la date pour ne plus l'embêter aujourd'hui
          await AsyncStorage.setItem('last_auto_quest_date', today);
        }

        // 4. On referme l'écran de chargement tout seul après 1 seconde
        setTimeout(() => setIsGenerating(false), 1000);

      } catch (e) {
        console.log("Erreur AutoSystem:", e.message);
        setIsGenerating(false); // En cas de problème de connexion, on libère l'écran
      }
    };

    // Laisse l'application charger pendant 1.5 seconde, puis déclenche l'analyse
    const timer = setTimeout(checkDaily, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Si l'IA n'est pas en train de générer les quêtes quotidiennes, ce composant est INVISIBLE.
  if (!isGenerating) return null;

  // Si l'IA travaille, on affiche cette interface menaçante façon "Système" sur tout l'écran :
  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>⚠️ AVIS DU SYSTÈME</Text>
      <ActivityIndicator size="large" color={THEME.cyan} style={{ marginVertical: 35, transform: [{ scale: 1.5 }] }} />
      <Text style={styles.desc}>Génération de vos objectifs quotidiens...</Text>
      <Text style={styles.subdesc}>Analyse de votre réceptacle en cours</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 10, 20, 0.96)', zIndex: 9999, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { color: THEME.cyan, fontSize: 24, fontWeight: 'bold', letterSpacing: 2, textAlign: 'center' },
  desc: { color: THEME.text, fontSize: 16, textAlign: 'center', fontWeight: 'bold' },
  subdesc: { color: THEME.dim, fontSize: 13, textAlign: 'center', marginTop: 12, fontStyle: 'italic' }
});