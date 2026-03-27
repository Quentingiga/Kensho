// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const stLoad = async (k, d) => {
  try {
    const r = await AsyncStorage.getItem(k);
    return r ? JSON.parse(r) : d;
  } catch (e) {
    console.error("Erreur de chargement", e);
    return d;
  }
};

export const stSave = async (k, v) => {
  try {
    await AsyncStorage.setItem(k, JSON.stringify(v));
  } catch (e) {
    console.error("Erreur de sauvegarde", e);
  }
};