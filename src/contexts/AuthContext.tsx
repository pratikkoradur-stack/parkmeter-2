import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, role: 'staff' | 'user') => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user && !error) {
        await fetchUserProfile(session.user);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      const userProfile: User = {
        id: authUser.id,
        email: authUser.email || '',
        role: authUser.user_metadata?.role || 'user',
        created_at: authUser.created_at,
        profile: profile || undefined
      };

      setUser(userProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, role: 'staff' | 'user') => {
    try {
      if (!isSupabaseConfigured()) {
        const mockUser: User = {
          id: `demo-${role}-${Date.now()}`,
          email,
          role,
          created_at: new Date().toISOString()
        };
        setUser(mockUser);
        return { data: { user: mockUser }, error: null };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role }
        }
      });

      if (!error && data.user) {
        await supabase.from('user_profiles').insert({
          user_id: data.user.id,
          full_name: '',
          member_since: new Date().toISOString()
        });
      }

      return { data, error };
    } catch (err: any) {
      return {
        data: null,
        error: { message: err.message }
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (!isSupabaseConfigured()) {
        const role = email.includes('staff') ? 'staff' : 'user';
        const mockUser: User = {
          id: `demo-${role}-${Date.now()}`,
          email,
          role,
          created_at: new Date().toISOString()
        };
        setUser(mockUser);
        return { data: { user: mockUser }, error: null };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { data, error };
    } catch (err: any) {
      return {
        data: null,
        error: { message: err.message }
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};