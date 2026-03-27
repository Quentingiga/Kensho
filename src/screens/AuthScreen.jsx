// src/screens/AuthScreen.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../utils/supabase';
import { THEME } from '../constants/theme';

export const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert("Échec de la connexion", error.message);
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert("Erreur", error.message);
    else Alert.alert("Succès", "Profil de Chasseur créé ! Tu peux maintenant te connecter.");
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
        style={{ flex:1}}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
        <View style={styles.container}>
        <Text style={styles.icon}>⚔️</Text>
        <Text style={styles.title}>KENSHO</Text>
        <Text style={styles.subtitle}>Identifiez-vous pour synchroniser vos données.</Text>

        <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor={THEME.dim} value={email} onChangeText={setEmail} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Mot de passe" placeholderTextColor={THEME.dim} value={password} onChangeText={setPassword} secureTextEntry />
        </View>

        {loading ? (
            <ActivityIndicator size="large" color={THEME.cyan} style={{ marginTop: 20 }} />
        ) : (
            <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.btn, styles.btnRegister]} onPress={handleSignUp}>
                <Text style={styles.btnRegisterText}>Enregistrer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnLogin]} onPress={handleSignIn}>
                <Text style={styles.btnLoginText}>Connexion</Text>
            </TouchableOpacity>
            </View>
        )}
        </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg, justifyContent: 'center', padding: 24 },
  icon: { fontSize: 60, textAlign: 'center', marginBottom: 10 },
  title: { color: THEME.cyan, fontSize: 22, fontWeight: 'bold', textAlign: 'center', letterSpacing: 2 },
  subtitle: { color: THEME.dim, fontSize: 13, textAlign: 'center', marginTop: 8, marginBottom: 40 },
  inputContainer: { gap: 15 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(6,182,212,.3)', color: THEME.text, borderRadius: 8, padding: 15, fontSize: 16 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 30 },
  btn: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center' },
  btnRegister: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: THEME.dim },
  btnRegisterText: { color: THEME.vlight, fontWeight: 'bold' },
  btnLogin: { backgroundColor: THEME.cyan },
  btnLoginText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});