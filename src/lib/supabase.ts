import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read raw env variables (Vite injects these at build time)
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Robust check to ensure the values look like real Supabase credentials
export const isSupabaseConfigured = () => {
  if (!rawSupabaseUrl || !rawSupabaseAnonKey) return false;
  if (rawSupabaseUrl.includes('placeholder') || rawSupabaseAnonKey.includes('placeholder')) return false;
  if (!/^https?:\/\//.test(rawSupabaseUrl)) return false;
  if (rawSupabaseAnonKey.length < 20) return false;
  return true;
};

// Only create the client if configuration looks valid; otherwise keep it null
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(rawSupabaseUrl as string, rawSupabaseAnonKey as string)
  : null;

// Auth helper functions
export const signUp = async (email: string, password: string, role: 'staff' | 'user') => {
  if (!isSupabaseConfigured()) {
    return { 
      data: null, 
      error: { message: 'Please connect to Supabase first. Click the "Connect to Supabase" button in the top right.' }
    };
  }
  
  // At this point the client must exist because configuration was validated
  const client = supabase!;
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: role
      }
    }
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  if (!isSupabaseConfigured()) {
    return { 
      data: null, 
      error: { message: 'Please connect to Supabase first. Click the "Connect to Supabase" button in the top right.' }
    };
  }
  
  const client = supabase!;
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }
  
  const client = supabase!;
  const { error } = await client.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  if (!isSupabaseConfigured()) {
    return { user: null, error: null };
  }
  
  const client = supabase!;
  const { data: { user }, error } = await client.auth.getUser();
  return { user, error };
};

/**
 * Fallback storage for demo mode when Supabase is not configured.
 * Stores vehicles in localStorage under 'demo_vehicles' and returns the inserted record.
 */
export const saveVehicleFallback = async (record: any) => {
  try {
    const raw = localStorage.getItem('vehicles') || '[]';
    const list = JSON.parse(raw);
    const id = Date.now();
    const newRec = { id, ...record };
    list.push(newRec);
    localStorage.setItem('vehicles', JSON.stringify(list));
    return { data: newRec, error: null };
  } catch (err: any) {
    return { data: null, error: { message: 'Failed to save vehicle locally' } };
  }
};