// src/screens/ProfileScreen.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { RankBadge } from '../components/RankBadge';
import { THEME } from '../constants/theme';
import { STATS, CAT, DXP } from '../constants/gameData';
import { getRank } from '../utils/helpers';
import { supabase } from '../utils/supabase'; 

const PRESETS = {
  sedentary: ["Sédentaire", "Étudiant", "Actif", "Travail physique"],
  weakness: ["Procrastination", "Stress/Anxiété", "Discipline", "Écrans/Réseaux", "Confiance en soi", "Sommeil"],
  interests: ["Sport/Musculation", "Tech/Code", "Business/Finance", "Art/Design", "Lecture/Savoir", "Cuisine"],
  chronotype: ["Lève-tôt", "Couche-tard", "Flexible"]
};

const MultiSelectionBox = ({ value, onChange, options }) => {
  const items = (value || "").split(',').map(s => s.trim()).filter(Boolean);
  const activePresets = items.filter(i => options.includes(i));
  const initialCustom = items.filter(i => !options.includes(i)).join(', ');

  const [showCustom, setShowCustom] = useState(initialCustom.length > 0);
  const [customText, setCustomText] = useState(initialCustom);

  const togglePreset = (opt) => {
    let newPresets;
    if (activePresets.includes(opt)) {
      newPresets = activePresets.filter(p => p !== opt);
    } else {
      newPresets = [...activePresets, opt];
    }
    updateParent(newPresets, customText);
  };

  const handleCustomChange = (text) => {
    setCustomText(text);
    updateParent(activePresets, text);
  };

  const updateParent = (presets, custom) => {
    const all = [...presets];
    if (custom.trim()) all.push(custom.trim());
    onChange(all.join(', '));
  };

  return (
    <View style={styles.selectionContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {options.map(opt => {
          const isActive = activePresets.includes(opt);
          return (
            <TouchableOpacity key={opt} onPress={() => togglePreset(opt)} style={[styles.chip, isActive && styles.chipActive]}>
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity onPress={() => setShowCustom(!showCustom)} style={[styles.chip, showCustom && styles.chipActive]}>
          <Text style={[styles.chipText, showCustom && styles.chipTextActive]}>Autre ✏️</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {showCustom && (
        <TextInput 
          style={styles.mindInput} 
          value={customText} 
          onChangeText={handleCustomChange} 
          placeholder="Sépare tes autres choix par une virgule..." 
          placeholderTextColor={THEME.dim}
        />
      )}
    </View>
  );
};

export const ProfileScreen = ({ player, quests, onUpdateProfile }) => {
  const r = getRank(player.level);
  
  const [showSettings, setShowSettings] = useState(false);

  const [editName, setEditName] = useState(false);
  const [name, setName] = useState(player.name);

  const [editPhys, setEditPhys] = useState(false);
  const [phys, setPhys] = useState({
    dob: player.dob || "",
    weight: player.weight?.toString() || "",
    height: player.height?.toString() || ""
  });

  const [editMind, setEditMind] = useState(false);
  const [mind, setMind] = useState({
    sedentary: player.sedentary || "",
    weakness: player.weakness || "",
    interests: player.interests || "",
    chronotype: player.chronotype || ""
  });

  const [expandedStat, setExpandedStat] = useState(null);

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion du Système",
      "Es-tu sûr de vouloir quitter ton réceptacle ? (Tes données resteront sauvegardées dans le Cloud)",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Déconnexion", 
          style: "destructive", 
          onPress: async () => {
            setShowSettings(false);
            await supabase.auth.signOut();
          } 
        }
      ]
    );
  };

  const getAge = (dobString) => {
    if (!dobString) return "?";
    const parts = dobString.split('/');
    if (parts.length !== 3) return "?";
    const birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return isNaN(age) ? "?" : age;
  };

  const handleDobChange = (text) => {
    let cleaned = ('' + text).replace(/\D/g, '');
    let match = cleaned.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);
    let formatted = !match ? '' : !match[2] ? match[1] : `${match[1]}/${match[2]}${match[3] ? `/${match[3]}` : ''}`;
    setPhys({ ...phys, dob: formatted });
  };

  const handleSaveName = () => { onUpdateProfile({ name: name.trim() || player.name }); setEditName(false); };
  
  const handleSavePhys = () => {
    onUpdateProfile({ dob: phys.dob.trim(), weight: parseInt(phys.weight) || player.weight || null, height: parseInt(phys.height) || player.height || null });
    setEditPhys(false);
  };

  const handleSaveMind = () => {
    onUpdateProfile({
      sedentary: mind.sedentary.trim(),
      weakness: mind.weakness.trim(),
      interests: mind.interests.trim(),
      chronotype: mind.chronotype.trim()
    });
    setEditMind(false);
  };

  const getStatHistory = (statKey) => {
    const linkedCategories = Object.keys(CAT).filter(c => CAT[c].stat === statKey);
    return quests.filter(q => q.done && linkedCategories.includes(q.category));
  };

  return (
    <View style={styles.container}>
      <Modal transparent visible={showSettings} animationType="fade" onRequestClose={() => setShowSettings(false)}>
        <TouchableOpacity style={styles.settingsOverlay} activeOpacity={1} onPress={() => setShowSettings(false)}>
          <View style={styles.settingsMenu}>
            <Text style={styles.settingsMenuTitle}>PARAMÈTRES SYSTÈME</Text>
            
            <TouchableOpacity style={styles.settingsMenuItem} onPress={handleLogout}>
              <Text style={styles.settingsMenuItemText}>🚪 Déconnexion</Text>
            </TouchableOpacity>

            <Text style={styles.settingsMenuHint}>D'autres fonctionnalités de Guilde arriveront bientôt...</Text>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 🛡️ AJOUT DU KEYBOARD AVOIDING VIEW ICI */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerRow}>
            <Text style={styles.mainTitle}>PROFIL</Text>
            <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.settingsBtn}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { borderColor: `${r.c}33` }]}>
            <View style={styles.badgeContainer}><RankBadge level={player.level} size="lg" /></View>
            <View style={styles.infoBox}>
              {editName ? (
                <View style={styles.editRow}>
                  <TextInput style={styles.input} value={name} onChangeText={setName} maxLength={20} autoFocus />
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSaveName}><Text style={styles.saveBtnText}>✓</Text></TouchableOpacity>
                </View>
              ) : (
                <View style={styles.nameRow}>
                  <Text style={[styles.name, { color: r.c }]}>{player.name}</Text>
                  <TouchableOpacity onPress={() => setEditName(true)} style={styles.editBtn}><Text style={styles.editIcon}>✏️</Text></TouchableOpacity>
                </View>
              )}
              <Text style={styles.subText}>Rang {r.n} · Niveau {player.level}</Text>
              <Text style={styles.streakText}>🔥 {player.streak} jour{player.streak > 1 ? 's' : ''} de streak</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>TITRE ACTIF</Text>
            </View>
            <View style={styles.titlesGrid}>
              {player.titles.map((t, i) => {
                const isActive = player.activeTitle === t || (!player.activeTitle && i === 0);
                return (
                  <TouchableOpacity 
                    key={i} 
                    activeOpacity={0.7}
                    onPress={() => onUpdateProfile({ activeTitle: t })}
                    style={[styles.titleBadge, isActive && styles.titleBadgeActive]}
                  >
                    <Text style={[styles.titleText, isActive && styles.titleTextActive]}>
                      {t} {isActive && "✓"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>LE RÉCEPTACLE</Text>
              <TouchableOpacity onPress={editPhys ? handleSavePhys : () => setEditPhys(true)}>
                <Text style={styles.editIcon}>{editPhys ? "✅" : "✏️"}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.physGrid}>
              <View style={[styles.physBox, { borderColor: 'rgba(6,182,212,.18)' }]}>
                <Text style={styles.physLabel}>{editPhys ? "Naissance" : "Âge"}</Text>
                {editPhys ? (
                  <TextInput style={styles.physInput} value={phys.dob} onChangeText={handleDobChange} keyboardType="numeric" maxLength={10} placeholder="JJ/MM/AAAA" placeholderTextColor={THEME.dim} />
                ) : <Text style={styles.physValue}>{getAge(player.dob)} <Text style={styles.physUnit}>ans</Text></Text>}
              </View>
              <View style={[styles.physBox, { borderColor: 'rgba(6,182,212,.18)' }]}>
                <Text style={styles.physLabel}>Poids</Text>
                {editPhys ? (
                  <TextInput style={styles.physInput} value={phys.weight} onChangeText={t => setPhys({...phys, weight: t})} keyboardType="numeric" maxLength={3} placeholder="ex: 75" placeholderTextColor={THEME.dim} />
                ) : <Text style={styles.physValue}>{player.weight || "?"} <Text style={styles.physUnit}>kg</Text></Text>}
              </View>
              <View style={[styles.physBox, { borderColor: 'rgba(6,182,212,.18)' }]}>
                <Text style={styles.physLabel}>Taille</Text>
                {editPhys ? (
                  <TextInput style={styles.physInput} value={phys.height} onChangeText={t => setPhys({...phys, height: t})} keyboardType="numeric" maxLength={3} placeholder="ex: 180" placeholderTextColor={THEME.dim} />
                ) : <Text style={styles.physValue}>{player.height || "?"} <Text style={styles.physUnit}>cm</Text></Text>}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>MINDSET & MODE DE VIE</Text>
              <TouchableOpacity onPress={editMind ? handleSaveMind : () => setEditMind(true)}>
                <Text style={styles.editIcon}>{editMind ? "✅" : "✏️"}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.mindList}>
              <View style={styles.mindItem}>
                <Text style={styles.mindLabel}>Niveau d'activité (Travail/Études) :</Text>
                {editMind ? (
                  <MultiSelectionBox value={mind.sedentary} onChange={t => setMind({...mind, sedentary: t})} options={PRESETS.sedentary} />
                ) : <Text style={styles.mindValue}>{player.sedentary || "Non spécifié"}</Text>}
              </View>

              <View style={styles.mindItem}>
                <Text style={styles.mindLabel}>Points faibles psychologiques :</Text>
                {editMind ? (
                  <MultiSelectionBox value={mind.weakness} onChange={t => setMind({...mind, weakness: t})} options={PRESETS.weakness} />
                ) : <Text style={styles.mindValue}>{player.weakness || "Non spécifié"}</Text>}
              </View>

              <View style={styles.mindItem}>
                <Text style={styles.mindLabel}>Centres d'intérêt / Passions :</Text>
                {editMind ? (
                  <MultiSelectionBox value={mind.interests} onChange={t => setMind({...mind, interests: t})} options={PRESETS.interests} />
                ) : <Text style={styles.mindValue}>{player.interests || "Non spécifié"}</Text>}
              </View>

              <View style={styles.mindItem}>
                <Text style={styles.mindLabel}>Rythme biologique :</Text>
                {editMind ? (
                  <MultiSelectionBox value={mind.chronotype} onChange={t => setMind({...mind, chronotype: t})} options={PRESETS.chronotype} />
                ) : <Text style={styles.mindValue}>{player.chronotype || "Non spécifié"}</Text>}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderStats}>
              <Text style={styles.sectionTitle}>STATS DÉTAILLÉES</Text>
              <Text style={styles.hintText}>(Appui long pour voir l'historique)</Text>
            </View>
            
            <View style={styles.statsGrid}>
              {STATS.map(s => {
                const isExpanded = expandedStat === s.k;
                return (
                  <TouchableOpacity 
                    key={s.k} 
                    activeOpacity={0.7}
                    delayLongPress={300}
                    onLongPress={() => setExpandedStat(isExpanded ? null : s.k)}
                    style={[
                      styles.statBox, 
                      { 
                        borderColor: isExpanded ? s.c : `${s.c}18`,
                        backgroundColor: isExpanded ? `${s.c}15` : 'rgba(255,255,255,.025)'
                      }
                    ]}
                  >
                    <Text style={styles.statIcon}>{s.i}</Text>
                    <Text style={[styles.statValue, { color: s.c }]}>{player.stats[s.k]}</Text>
                    <Text style={styles.statLabel}>{s.l}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {expandedStat && (
              <View style={[styles.historyPanel, { borderColor: STATS.find(s => s.k === expandedStat).c }]}>
                <View style={styles.historyHeader}>
                  <Text style={[styles.historyTitle, { color: STATS.find(s => s.k === expandedStat).c }]}>
                    Quêtes du jour ({STATS.find(s => s.k === expandedStat).l})
                  </Text>
                  <TouchableOpacity onPress={() => setExpandedStat(null)}>
                    <Text style={styles.historyClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                {getStatHistory(expandedStat).length === 0 ? (
                  <Text style={styles.historyEmpty}>Aucune quête validée pour cette stat aujourd'hui.</Text>
                ) : (
                  getStatHistory(expandedStat).map(q => (
                    <View key={q.id} style={styles.historyItem}>
                      <Text style={styles.historyItemTitle} numberOfLines={1}>✓ {q.title}</Text>
                      <Text style={styles.historyItemXp}>+{DXP[q.diff] || 60} XP</Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  mainTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.text },
  settingsBtn: { padding: 5, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  settingsIcon: { fontSize: 18 },

  settingsOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-start', alignItems: 'flex-end', padding: 20, paddingTop: 60 },
  settingsMenu: { backgroundColor: THEME.surface, borderWidth: 1, borderColor: THEME.cyan, borderRadius: 16, padding: 18, width: 240, elevation: 10 },
  settingsMenuTitle: { color: THEME.dim, fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 18, textAlign: 'center' },
  settingsMenuItem: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', padding: 12, borderRadius: 8, alignItems: 'center' },
  settingsMenuItemText: { color: '#ef4444', fontWeight: 'bold', fontSize: 14 },
  settingsMenuHint: { color: THEME.dim, fontSize: 10, fontStyle: 'italic', textAlign: 'center', marginTop: 18, lineHeight: 16 },

  card: { backgroundColor: THEME.surface2, borderWidth: 1, borderRadius: 20, padding: 22, marginBottom: 14, alignItems: 'center' },
  badgeContainer: { marginBottom: 11 },
  infoBox: { alignItems: 'center', width: '100%' },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  name: { fontSize: 24, fontWeight: 'bold' },
  editBtn: { padding: 5 },
  editIcon: { fontSize: 14 },
  editRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 4 },
  input: { backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', padding: 5, borderRadius: 5, width: 140, textAlign: 'center', borderWidth: 1, borderColor: THEME.violet },
  saveBtn: { backgroundColor: THEME.violet, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  saveBtnText: { color: 'white', fontWeight: 'bold' },
  subText: { color: THEME.dim, fontSize: 13, marginTop: 4 },
  streakText: { color: THEME.gold, fontSize: 13, marginTop: 4, fontWeight: 'bold' },
  
  section: { backgroundColor: 'rgba(13,13,26,.92)', borderWidth: 1, borderColor: 'rgba(124,58,237,.18)', borderRadius: 16, padding: 16, marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionHeaderStats: { marginBottom: 14 },
  sectionTitle: { color: THEME.dim, fontSize: 12, letterSpacing: 2, fontWeight: 'bold' },
  hintText: { color: THEME.dim, fontSize: 10, fontStyle: 'italic', marginTop: 3 },
  
  physGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  physBox: { flex: 1, backgroundColor: 'rgba(255,255,255,.025)', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1 },
  physLabel: { color: THEME.dim, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  physValue: { color: THEME.cyan, fontSize: 18, fontWeight: 'bold' },
  physUnit: { fontSize: 11, color: THEME.dim, fontWeight: 'normal' },
  physInput: { backgroundColor: 'rgba(0,0,0,0.3)', color: THEME.cyan, paddingVertical: 2, paddingHorizontal: 2, borderRadius: 5, width: '100%', textAlign: 'center', borderWidth: 1, borderColor: THEME.cyan, fontSize: 12, fontWeight: 'bold' },

  mindList: { gap: 14 },
  mindItem: { backgroundColor: 'rgba(255,255,255,.02)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,.05)' },
  mindLabel: { color: THEME.dim, fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  mindValue: { color: THEME.text, fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  
  selectionContainer: { marginTop: 8 },
  chipScroll: { marginHorizontal: -4 },
  chip: { backgroundColor: 'rgba(255,255,255,.05)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginHorizontal: 4, borderWidth: 1, borderColor: 'transparent' },
  chipActive: { backgroundColor: 'rgba(6,182,212,.15)', borderColor: THEME.cyan },
  chipText: { color: THEME.dim, fontSize: 12 },
  chipTextActive: { color: THEME.cyan, fontWeight: 'bold' },
  mindInput: { backgroundColor: 'rgba(0,0,0,0.3)', color: THEME.text, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: THEME.cyan, fontSize: 14, marginTop: 12 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statBox: { width: '48%', borderRadius: 10, padding: 11, alignItems: 'center', borderWidth: 1, marginBottom: 10 },
  statIcon: { fontSize: 22, marginBottom: 3 },
  statValue: { fontWeight: 'bold', fontSize: 24 },
  statLabel: { fontSize: 11, color: THEME.dim },

  historyPanel: { marginTop: 4, backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderRadius: 12, padding: 14 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 8 },
  historyTitle: { fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  historyClose: { color: THEME.dim, fontSize: 16, paddingHorizontal: 5 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', padding: 10, borderRadius: 8, marginBottom: 6 },
  historyItemTitle: { color: THEME.text, fontSize: 12, flex: 1, paddingRight: 10 },
  historyItemXp: { color: THEME.vlight, fontSize: 11, fontWeight: 'bold' },
  historyEmpty: { color: THEME.dim, fontSize: 12, fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 },

  titlesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  titleBadge: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.02)' },
  titleBadgeActive: { borderColor: THEME.gold, backgroundColor: 'rgba(251,191,36,0.1)' },
  titleText: { color: THEME.dim, fontSize: 13, fontWeight: 'bold' },
  titleTextActive: { color: THEME.gold },
});