import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, StatusBar, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';

// --- IMPORTS DE NOTRE ARCHITECTURE ---
import { THEME } from './src/constants/theme';
import { DEF_PLAYER, INIT_QUESTS, INIT_DUNGEONS, DXP, CAT } from './src/constants/gameData';
import { stLoad, stSave } from './src/utils/storage';
import { todayStr, uid, xpNeed, getRank } from './src/utils/helpers';

// --- IMPORTS CLOUD & AUTHENTIFICATION ---
import 'react-native-url-polyfill/auto';
import { supabase } from './src/utils/supabase';
import { AuthScreen } from './src/screens/AuthScreen';

// --- IMPORTS DES COMPOSANTS ET ÉCRANS ---
import { BottomNav } from './src/components/BottomNav';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { QuestsScreen } from './src/screens/QuestsScreen';
import { DungeonsScreen } from './src/screens/DungeonsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AutoSystem } from './src/components/AutoSystem';
import { PenaltySystem } from './src/components/PenaltySystem';

// --- IMPORTS DES MODALS ---
import { AddQuestModal } from './src/modals/AddQuestModal';
import { AddDungeonModal } from './src/modals/AddDungeonModal';
import { AIModal } from './src/modals/AIModal';
import { LevelUpOverlay } from './src/modals/LevelUpOverlay';

export default function App() {
  const [session, setSession] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [tab, setTab] = useState("dashboard");
  const [player, setPlayer] = useState(DEF_PLAYER);
  const [quests, setQuests] = useState(INIT_QUESTS);
  const [dungeons, setDungeons] = useState(INIT_DUNGEONS);
  const [ready, setReady] = useState(false);

  const [showAQ, setShowAQ] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showAD, setShowAD] = useState(false);
  const [lvlUp, setLvlUp] = useState(null);

  const pagerRef = useRef(null);
  const TABS_ORDER = ["dashboard", "quests", "dungeons", "profile"];

  const handleTabChange = (newTab) => {
    setTab(newTab);
    pagerRef.current?.setPage(TABS_ORDER.indexOf(newTab));
  };

  // --- 0. GESTION DE LA CONNEXION AU CLOUD ---
  useEffect(() => {
    const checkAuth = async () => {
      // 🛠️ MODE DEBUG : Auto-connexion magique pour le dev
      if (process.env.EXPO_PUBLIC_BYPASS_AUTH === 'true') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: process.env.EXPO_PUBLIC_TEST_EMAIL,
          password: process.env.EXPO_PUBLIC_TEST_PASSWORD,
        });
        
        if (data?.session) {
          console.log("🛠️ DEBUG MODE : Chasseur connecté automatiquement.");
          setSession(data.session);
          setIsAuthChecking(false);
          return; // On arrête là pour ne pas faire la suite
        } else if (error) {
          console.log("🛠️ Erreur Auto-Login :", error.message);
        }
      }

      // 👤 FLUX NORMAL (Si pas en debug, ou si l'auto-login a échoué)
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setIsAuthChecking(false);
      });
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- 1. CHARGEMENT CLOUD (MAPPING SQL -> REACT) ---
  useEffect(() => {
    if (!session) return;

    (async () => {
      try {
        // On télécharge les 3 tables en parallèle pour aller plus vite
        const [pRes, qRes, dRes] = await Promise.all([
          supabase.from('players').select('*').eq('id', session.user.id).single(),
          supabase.from('quests').select('*').eq('user_id', session.user.id),
          supabase.from('dungeons').select('*').eq('user_id', session.user.id)
        ]);

        let p = DEF_PLAYER;
        let q = INIT_QUESTS;
        let d = INIT_DUNGEONS;

        // --- MAPPING DU JOUEUR ---
        if (pRes.data) {
          const dbP = pRes.data;
          p = {
            name: dbP.name, level: dbP.level, xp: dbP.xp, streak: dbP.streak, lastDate: dbP.last_date,
            dob: dbP.dob, weight: dbP.weight, height: dbP.height,
            sedentary: dbP.sedentary, weakness: dbP.weakness, interests: dbP.interests, chronotype: dbP.chronotype,
            stats: { force: dbP.force, agilite: dbP.agilite, intelligence: dbP.intelligence, volonte: dbP.volonte, endurance: dbP.endurance },
            titles: dbP.titles || []
          };
        } else {
          p = await stLoad("sl_p", DEF_PLAYER);
        }

        // --- MAPPING DES QUÊTES ---
        if (qRes.data && qRes.data.length > 0) {
          q = qRes.data.map(dbQ => ({
            id: dbQ.id, title: dbQ.title, category: dbQ.category, diff: dbQ.diff,
            desc: dbQ.description, daily: dbQ.daily, done: dbQ.done, statReward: dbQ.stat_reward || {}
          }));
        } else {
          const localQuests = await stLoad("sl_q", INIT_QUESTS);
          q = Array.isArray(localQuests) ? localQuests : INIT_QUESTS;
        }

        // --- MAPPING DES DONJONS ---
        if (dRes.data && dRes.data.length > 0) {
          d = dRes.data.map(dbD => ({
            id: dbD.id, title: dbD.title, desc: dbD.description, xp: dbD.xp, progress: dbD.progress, done: dbD.done
          }));
        } else {
          d = await stLoad("sl_d", INIT_DUNGEONS);
        }

        // Reset quotidien des quêtes
        const td = todayStr();
        let fq = q;
        if (p.lastDate !== td) {
          fq = q.map(x => ({ ...x, done: false }));
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const wasYesterday = p.lastDate === yesterday.toDateString();
          p.streak = wasYesterday ? (p.streak || 0) + 1 : (p.lastDate ? 0 : p.streak || 0);
          p.lastDate = td;
        }
        
        setPlayer(p); 
        setQuests(Array.isArray(fq) ? fq : INIT_QUESTS); 
        setDungeons(Array.isArray(d) ? d : INIT_DUNGEONS); 
        setReady(true);
      } catch (e) {
        console.log("Erreur chargement:", e);
      }
    })();
  }, [session]);

  // --- 2. SAUVEGARDE CLOUD RELATIONNELLE (DEBOUNCE) ---
  useEffect(() => {
    if (!ready || !session) return;

    stSave("sl_p", player);
    stSave("sl_q", quests);
    stSave("sl_d", dungeons);

    const timer = setTimeout(async () => {
      try {
        const userId = session.user.id;

        // 1. Sauvegarde du Joueur
        await supabase.from('players').upsert({
          id: userId, name: player.name, level: player.level, xp: player.xp, streak: player.streak, last_date: player.lastDate,
          dob: player.dob, weight: player.weight, height: player.height,
          sedentary: player.sedentary, weakness: player.weakness, interests: player.interests, chronotype: player.chronotype,
          force: player.stats.force, agilite: player.stats.agilite, intelligence: player.stats.intelligence, volonte: player.stats.volonte, endurance: player.stats.endurance,
          titles: player.titles, updated_at: new Date()
        });

        // 2. Sauvegarde des Quêtes
        if (quests.length > 0) {
          const dbQuests = quests.map(q => ({
            id: q.id, user_id: userId, title: q.title, category: q.category, diff: q.diff,
            description: q.desc, daily: q.daily, done: q.done, stat_reward: q.statReward, updated_at: new Date()
          }));
          await supabase.from('quests').upsert(dbQuests);
        }
        
        // Nettoyage des quêtes supprimées localement
        const localQIds = quests.map(q => q.id);
        const { data: cloudQuests } = await supabase.from('quests').select('id').eq('user_id', userId);
        if (cloudQuests) {
          const toDeleteQ = cloudQuests.map(q => q.id).filter(id => !localQIds.includes(id));
          if (toDeleteQ.length > 0) await supabase.from('quests').delete().in('id', toDeleteQ);
        }

        // 3. Sauvegarde des Donjons
        if (dungeons.length > 0) {
          const dbDungeons = dungeons.map(d => ({
            id: d.id, user_id: userId, title: d.title, description: d.desc, xp: d.xp, progress: d.progress, done: d.done, updated_at: new Date()
          }));
          await supabase.from('dungeons').upsert(dbDungeons);
        }

        // Nettoyage des donjons supprimés
        const localDIds = dungeons.map(d => d.id);
        const { data: cloudDungeons } = await supabase.from('dungeons').select('id').eq('user_id', userId);
        if (cloudDungeons) {
          const toDeleteD = cloudDungeons.map(d => d.id).filter(id => !localDIds.includes(id));
          if (toDeleteD.length > 0) await supabase.from('dungeons').delete().in('id', toDeleteD);
        }

      } catch (err) {
        console.error("Erreur de synchro DB:", err);
      }
    }, 2500); // 2.5 secondes de pause avant de synchroniser avec le Cloud pour éviter de spammer la base de données

    return () => clearTimeout(timer);
  }, [player, quests, dungeons, ready, session]);

  // --- 3. MÉCANIQUES DE JEU ---
  const gainXP = useCallback((xp, bonus) => {
    setPlayer(p => {
      let { xp: cx, level: lv, stats, titles, ...rest } = p;
      cx += xp;
      let leveled = false, nl = lv;
      
      if (xp > 0) {
        while (cx >= xpNeed(nl)) { cx -= xpNeed(nl); nl++; leveled = true; }
      } else if (xp < 0) {
        while (cx < 0 && nl > 1) { nl--; cx += xpNeed(nl); }
        if (cx < 0 && nl === 1) cx = 0;
      }

      const ns = { ...stats };
      if (bonus) Object.entries(bonus).forEach(([k, v]) => { ns[k] = Math.max(0, (ns[k] || 0) + v); });

      let nt = [...titles];
      if (leveled) {
        setTimeout(() => setLvlUp(nl), 80);
        const or = getRank(lv).n, nr = getRank(nl).n;
        if (or !== nr && !nt.includes(`Chasseur de Rang ${nr}`)) nt = [...nt, `Chasseur de Rang ${nr}`];
      }

      return { ...rest, xp: cx, level: nl, stats: ns, titles: nt };
    });
  }, []);

  const applyPenalty = useCallback((penaltyData) => {
    setQuests(prev => prev.filter(q => !penaltyData.ids.includes(q.id)));
    setPlayer(p => {
      let newXp = p.xp - penaltyData.xp;
      let newLevel = p.level;
      while (newXp < 0 && newLevel > 1) { newLevel--; newXp += xpNeed(newLevel); }
      if (newXp < 0 && newLevel === 1) newXp = 0;

      let newStats = { ...p.stats };
      Object.keys(penaltyData.stats).forEach(k => {
        newStats[k] = Math.max(0, Number((newStats[k] - penaltyData.stats[k]).toFixed(1)));
      });

      return { ...p, xp: newXp, level: newLevel, stats: newStats, streak: 0 };
    });
  }, []);

  const completeQuest = useCallback(id => {
    setQuests(prev => prev.map(q => {
      if (q.id !== id || q.done) return q;
      const cat = CAT[q.category];
      gainXP(DXP[q.diff] || 60, cat ? { [cat.stat]: 1 } : {});
      return { ...q, done: true };
    }));
  }, [gainXP]);

  const undoQuest = useCallback(id => {
    setQuests(prev => prev.map(q => {
      if (q.id !== id || !q.done) return q;
      const cat = CAT[q.category];
      gainXP(-(DXP[q.diff] || 60), cat ? { [cat.stat]: -1 } : {});
      return { ...q, done: false };
    }));
  }, [gainXP]);

  const addQuest = useCallback(f => {
    const cat = CAT[f.category];
    setQuests(p => [...p, {
      id: uid(), title: f.title, category: f.category, diff: f.diff || "D",
      desc: f.desc || "", daily: true, done: false,
      statReward: cat ? { [cat.stat]: 1 } : {}
    }]);
  }, []);

  const deleteQuest = useCallback(id => { setQuests(prev => prev.filter(q => q.id !== id)); }, []);

  const addDungeon = useCallback(f => {
    setDungeons(p => [...p, { id: uid(), title: f.title, desc: f.desc || "", xp: f.xp || 500, progress: 0, done: false }]);
  }, []);

  const updateDungeon = useCallback((id, progress) => {
    setDungeons(prev => prev.map(d => {
      if (d.id !== id) return d;
      const done = progress >= 100;
      if (done && !d.done) gainXP(d.xp, {});
      return { ...d, progress, done };
    }));
  }, [gainXP]);

  // --- 4. AFFICHAGE ET SÉCURITÉ ---
  if (isAuthChecking) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>VÉRIFICATION SÉCURISÉE...</Text>
      </View>
    );
  }

  if (!session) return <AuthScreen />;

  if (!ready) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingIcon}>⚔</Text>
        <Text style={styles.loadingText}>ÉVEIL EN COURS...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar hidden={true} />
      
      <PagerView style={styles.content} initialPage={0} ref={pagerRef} onPageSelected={(e) => setTab(TABS_ORDER[e.nativeEvent.position])}>
        <View key="0" style={{ flex: 1 }}><DashboardScreen player={player} /></View>
        <View key="1" style={{ flex: 1 }}><QuestsScreen quests={quests} player={player} onComplete={completeQuest} onUndo={undoQuest} onDelete={deleteQuest} onAdd={() => setShowAQ(true)} onAI={() => setShowAI(true)} /></View>
        <View key="2" style={{ flex: 1 }}><DungeonsScreen dungeons={dungeons} onUpdate={updateDungeon} onAdd={() => setShowAD(true)} /></View>
        <View key="3" style={{ flex: 1 }}><ProfileScreen player={player} quests={quests} onUpdateProfile={updates => setPlayer(p => ({ ...p, ...updates }))} /></View>
      </PagerView>

      <BottomNav active={tab} onChange={handleTabChange} />

      <AutoSystem player={player} quests={quests} onQuestGenerated={addQuest} />
      <PenaltySystem quests={quests} onApplyPenalty={applyPenalty} />

      {showAQ && <AddQuestModal onAdd={addQuest} onClose={() => setShowAQ(false)} />}
      {showAI && <AIModal player={player} quests={quests} dungeons={dungeons} onAdd={addQuest} onClose={() => setShowAI(false)} />}
      {showAD && <AddDungeonModal onAdd={addDungeon} onClose={() => setShowAD(false)} />}
      {lvlUp && <LevelUpOverlay level={lvlUp} onDone={() => setLvlUp(null)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg, width: '100%', height: '100%' },
  content: { flex: 1, width: '100%' },
  loadingContainer: { flex: 1, backgroundColor: THEME.bg, justifyContent: 'center', alignItems: 'center', width: '100%' },
  loadingIcon: { fontSize: 50, color: THEME.vlight, marginBottom: 20 },
  loadingText: { color: THEME.vlight, letterSpacing: 3, fontWeight: 'bold' }
});