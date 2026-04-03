// src/utils/cloudStorage.js
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const syncToCloud = async (playerId, fullData) => {
  try {
    const { error } = await supabase
      .from('players')
      .upsert({ id: playerId, data: fullData }); // Crée ou met à jour
    
    if (error) throw error;
    console.log("☁️ Sauvegarde Cloud réussie");
  } catch (e) {
    console.error("Erreur Cloud Sync:", e.message);
  }
};

export const loadFromCloud = async (playerId) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('data')
      .eq('id', playerId)
      .single();
    
    if (error) return null;
    return data.data;
  } catch (e) {
    return null;
  }
};