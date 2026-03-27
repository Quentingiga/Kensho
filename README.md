# 🗡️ The System - Solo Leveling Habit Tracker

**"L'Éveil a commencé. Bienvenue dans le Système."**

Une application mobile multiplateforme (iOS & Android) développée en **React Native** (Expo). Ce projet gamifie la productivité et le suivi d'objectifs en transformant la vie réelle en un véritable RPG, inspiré par l'univers de *Solo Leveling*.

## 🌟 Fonctionnalités Principales

* **⚔️ Quêtes Quotidiennes (Habitudes) :** Ajoute, gère et valide tes tâches de tous les jours (Sport, Études, Mental). Chaque tâche accomplie te rapporte de l'XP et augmente tes statistiques de base (Force, Agilité, Intelligence...).
* **🏰 Donjons (Objectifs Long Terme) :** Fixe-toi des objectifs massifs avec une barre de progression en pourcentage. Terminer un donjon rapporte un bonus massif d'XP.
* **📈 Système de Leveling & Rangs :** Gagne de l'XP pour monter en niveau. Passe du modeste **Rang E** au légendaire **Rang SSS**. Le Système suit également ta série de jours actifs (*Streak*).
* **🤖 Assistant IA Intégré :** En manque d'inspiration ? Dis au Système ce que tu veux accomplir (ex: "Je veux me remettre en forme"), et l'IA (propulsée par Anthropic/Claude) générera des quêtes sur mesure adaptées à ton niveau.
* **💾 Sauvegarde Locale :** Toute ta progression est sauvegardée de manière persistante sur ton téléphone via `AsyncStorage`.

## 🛠️ Stack Technique

* **Frontend :** React Native
* **Framework :** Expo
* **Stockage :** `@react-native-async-storage/async-storage`
* **Intelligence Artificielle :** API Anthropic (Claude 3)
* **Styling :** StyleSheet natif (UI personnalisée type "Gamer/Dark Mode")

## 📱 Captures d'écran
*(Ajoute tes captures d'écran ici en remplaçant les liens)*
> 📷 `[Capture du Dashboard]` | `[Capture des Quêtes]` | `[Capture du Level Up]`




## 🛠️ Installation & Configuration

1. Clonez ce dépôt sur votre machine :
   \`\`\`bash
   git clone https://github.com/TonPseudo/TonProjet.git
   cd TonProjet
   \`\`\`

2. Installez les dépendances : 
   \`\`\`bash
   npm install
   \`\`\`

3. **Configuration de l'environnement (IMPORTANT) ⚠️**
   - Dupliquez le fichier \`.env.example\` et renommez-le en \`.env\`.
   - Remplissez le fichier \`.env\` avec vos propres clés API (Supabase, Groq).
   
   *Astuce Debug :* Pour ne pas avoir à vous connecter à chaque redémarrage de l'app lors du développement, passez \`EXPO_PUBLIC_BYPASS_AUTH=true\` et renseignez des identifiants de test dans le fichier \`.env\`. L'application vous connectera automatiquement en arrière-plan !

4. Lancez le Système :
   \`\`\`bash
   npx expo start
   \`\`\`