// src/utils/supabase.js
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pnsdrfbrlcadamrnnpsr.supabase.co';
const supabaseAnonKey = 'sb_publishable_5cI6rvOdD19Vq9V7g0SbOA_jHGZaQdp';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});