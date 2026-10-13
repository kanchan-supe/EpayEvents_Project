'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'attendee' | 'organizer' | 'admin';
  phone?: string;
  avatar_url?: string;
}

interface SignUpMeta {
  fullName: string;
  role?: 'attendee' | 'organizer' | 'admin';
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, meta: SignUpMeta) => Promise<{ error: string | null; needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_MOCK_USER_KEY = 'epay_mock_user';

function getInitialMockUser(): { user: User | null; profile: UserProfile | null } {
  if (typeof window === 'undefined') return { user: null, profile: null };
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_MOCK_USER_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: {
          id: parsed.id,
          email: parsed.email,
          user_metadata: { full_name: parsed.full_name, role: parsed.role },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User,
        profile: parsed as UserProfile,
      };
    }
  } catch {
    // ignore
  }
  return { user: null, profile: null };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();

  const [user, setUser] = useState<User | null>(() => (!configured ? getInitialMockUser().user : null));
  const [profile, setProfile] = useState<UserProfile | null>(() => (!configured ? getInitialMockUser().profile : null));
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(() => configured);

  // Helper to fetch/sync profile from Supabase
  const fetchProfile = useCallback(async (userId: string, userEmail: string, userMeta?: Record<string, unknown>) => {
    if (!configured) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data && !error) {
        setProfile({
          id: data.id,
          email: data.email,
          full_name: data.full_name || 'Attendee',
          role: data.role || 'attendee',
          phone: data.phone,
          avatar_url: data.avatar_url,
        });
      } else {
        // Fallback to user metadata
        setProfile({
          id: userId,
          email: userEmail,
          full_name: (userMeta?.full_name as string) || (userMeta?.name as string) || userEmail.split('@')[0],
          role: ((userMeta?.role as string) as UserProfile['role']) || 'attendee',
          phone: userMeta?.phone as string,
          avatar_url: (userMeta?.avatar_url as string) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        });
      }
    } catch {
      // Use user metadata on network error
      setProfile({
        id: userId,
        email: userEmail,
        full_name: (userMeta?.full_name as string) || userEmail.split('@')[0],
        role: 'attendee',
      });
    }
  }, [configured]);

  useEffect(() => {
    if (!configured) {
      return;
    }

    let mounted = true;

    // 1. Get initial live Supabase session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(
          currentSession.user.id,
          currentSession.user.email || '',
          currentSession.user.user_metadata
        );
      }
      setLoading(false);
    });

    // 2. Real-time Auth State Change Listener
    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await fetchProfile(
          newSession.user.id,
          newSession.user.email || '',
          newSession.user.user_metadata
        );
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener.unsubscribe();
    };
  }, [configured, fetchProfile]);

  // Real-time listener for profile changes in Supabase
  useEffect(() => {
    if (!configured || !user?.id) return;

    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            const row = payload.new as Record<string, unknown>;
            setProfile({
              id: row.id as string,
              email: row.email as string,
              full_name: (row.full_name as string) || 'Attendee',
              role: (row.role as UserProfile['role']) || 'attendee',
              phone: row.phone as string,
              avatar_url: row.avatar_url as string,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [configured, user?.id]);

  // Sign In function
  const signIn = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    if (configured) {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        return { error: null };
      } catch (err: unknown) {
        const authErr = err as AuthError;
        return { error: authErr.message || 'Failed to sign in' };
      }
    } else {
      // Mock Sign In
      const mockProfile: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        full_name: email.split('@')[0].toUpperCase(),
        role: email.includes('organizer') ? 'organizer' : 'attendee',
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };
      const mockUser = {
        id: mockProfile.id,
        email,
        user_metadata: { full_name: mockProfile.full_name, role: mockProfile.role },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;

      setUser(mockUser);
      setProfile(mockProfile);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_MOCK_USER_KEY, JSON.stringify(mockProfile));
      }
      return { error: null };
    }
  }, [configured]);

  // Sign Up function
  const signUp = useCallback(async (
    email: string,
    password: string,
    meta: SignUpMeta
  ): Promise<{ error: string | null; needsEmailConfirmation?: boolean }> => {
    if (configured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: meta.fullName,
              role: meta.role || 'attendee',
              phone: meta.phone || '',
            },
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined,
          },
        });

        if (error) return { error: error.message };

        // Check if email confirmation is required by Supabase
        const needsConfirmation = !data.session;
        return { error: null, needsEmailConfirmation: needsConfirmation };
      } catch (err: unknown) {
        const authErr = err as AuthError;
        return { error: authErr.message || 'Failed to sign up' };
      }
    } else {
      // Mock Sign Up
      const mockProfile: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        full_name: meta.fullName,
        role: meta.role || 'attendee',
        phone: meta.phone,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };
      const mockUser = {
        id: mockProfile.id,
        email,
        user_metadata: { full_name: mockProfile.full_name, role: mockProfile.role },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;

      setUser(mockUser);
      setProfile(mockProfile);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_MOCK_USER_KEY, JSON.stringify(mockProfile));
      }
      return { error: null, needsEmailConfirmation: false };
    }
  }, [configured]);

  // Sign Out function
  const signOut = useCallback(async () => {
    if (configured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setSession(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_MOCK_USER_KEY);
    }
  }, [configured]);

  // Forgot / Reset Password Email function
  const resetPassword = useCallback(async (email: string): Promise<{ error: string | null }> => {
    if (configured) {
      try {
        const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });
        if (error) return { error: error.message };
        return { error: null };
      } catch (err: unknown) {
        const authErr = err as AuthError;
        return { error: authErr.message || 'Failed to send reset email' };
      }
    } else {
      // Mock password reset
      return { error: null };
    }
  }, [configured]);

  // Update Password (when authenticated from reset link)
  const updatePassword = useCallback(async (newPassword: string): Promise<{ error: string | null }> => {
    if (configured) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return { error: error.message };
        return { error: null };
      } catch (err: unknown) {
        const authErr = err as AuthError;
        return { error: authErr.message || 'Failed to update password' };
      }
    } else {
      return { error: null };
    }
  }, [configured]);

  // OAuth Sign In function
  const signInWithOAuth = useCallback(async (provider: 'google' | 'github'): Promise<{ error: string | null }> => {
    if (configured) {
      try {
        const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: redirectUrl,
          },
        });
        if (error) return { error: error.message };
        return { error: null };
      } catch (err: unknown) {
        const authErr = err as AuthError;
        return { error: authErr.message || `Failed to sign in with ${provider}` };
      }
    } else {
      // Mock OAuth
      const mockEmail = `demo.${provider}@example.com`;
      const mockProfile: UserProfile = {
        id: `oauth-${provider}-${Date.now()}`,
        email: mockEmail,
        full_name: `${provider.toUpperCase()} Demo User`,
        role: 'attendee',
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockEmail}`,
      };
      setUser({
        id: mockProfile.id,
        email: mockEmail,
        user_metadata: { full_name: mockProfile.full_name, role: mockProfile.role },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User);
      setProfile(mockProfile);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_MOCK_USER_KEY, JSON.stringify(mockProfile));
      }
      return { error: null };
    }
  }, [configured]);

  const contextValue = useMemo(
    () => ({
      user,
      profile,
      session,
      loading,
      isConfigured: configured,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      signInWithOAuth,
    }),
    [
      user,
      profile,
      session,
      loading,
      configured,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      signInWithOAuth,
    ]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
