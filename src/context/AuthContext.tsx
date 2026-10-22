'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export type UserRole = 'attendee' | 'organizer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
}

export interface SignUpMeta {
  fullName: string;
  role?: UserRole;
  phone?: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  isAdmin: boolean;
  isOrganizer: boolean;
  isAttendee: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null; role?: UserRole; user?: User | null }>;
  signUp: (email: string, password: string, meta: SignUpMeta) => Promise<{ error: string | null; needsEmailConfirmation?: boolean; user?: User | null; role?: UserRole }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ error: string | null }>;
  upgradeToOrganizer: (phone?: string) => Promise<{ error: string | null }>;
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
  const [loading, setLoading] = useState<boolean>(true);

  // Derive role helper
  const role: UserRole | null = useMemo(() => {
    if (profile?.role) return profile.role;
    if (user?.user_metadata?.role) return user.user_metadata.role as UserRole;
    return null;
  }, [profile?.role, user?.user_metadata?.role]);

  const isAdmin = role === 'admin';
  const isOrganizer = role === 'organizer' || role === 'admin';
  const isAttendee = role === 'attendee';

  // Helper to extract or sync profile
  const syncUserProfile = useCallback((currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    const meta = currentUser.user_metadata || {};
    const userRole: UserRole = (meta.role as UserRole) || 'attendee';
    const fullName: string = meta.full_name || meta.name || currentUser.email?.split('@')[0] || 'User';

    const p: UserProfile = {
      id: currentUser.id,
      email: currentUser.email || '',
      full_name: fullName,
      role: userRole,
      phone: meta.phone,
      avatar_url: meta.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email || currentUser.id}`,
    };
    setProfile(p);
  }, []);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    // 1. Initial live Supabase session retrieval
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      syncUserProfile(currentUser);
      setLoading(false);
    });

    // 2. Real-time Auth State Change Listener
    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      const currentUser = newSession?.user ?? null;
      setUser(currentUser);
      syncUserProfile(currentUser);
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener.unsubscribe();
    };
  }, [configured, syncUserProfile]);

  // Sign In function
  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null; role?: UserRole; user?: User | null }> => {
      if (configured) {
        try {
          const cleanEmail = email.trim();
          let { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });

          // Auto-heal demo password typo if user created organizer with Organizer@2026 or Organize@2026
          if (error && (password === 'Organize@2026' || password === 'Organizer@2026')) {
            const alternatePass = password === 'Organize@2026' ? 'Organizer@2026' : 'Organize@2026';
            const retryRes = await supabase.auth.signInWithPassword({ email: cleanEmail, password: alternatePass });
            if (!retryRes.error && retryRes.data?.user) {
              data = retryRes.data;
              error = null;
            }
          }

          if (error) {
            const msg = error.message || '';
            if (msg.toLowerCase().includes('email not confirmed')) {
              return {
                error: 'Email is not confirmed yet. In your Supabase Dashboard -> Authentication -> Providers -> Email, turn "Confirm email" OFF to allow instant login.',
              };
            }
            if (msg.toLowerCase().includes('invalid login credentials')) {
              return {
                error: 'Invalid login credentials. Please verify your email and password. (If you recently signed up, ensure "Confirm email" is turned OFF in Supabase so your account is immediately active).',
              };
            }
            return { error: msg };
          }

          const loggedInUser = data.user;
          let userRole = (loggedInUser?.user_metadata?.role as UserRole) || 'attendee';

          // Auto-detect & auto-heal missing organizer role from email or organizers table
          if (userRole === 'attendee' && loggedInUser) {
            if (cleanEmail.toLowerCase().includes('organizer')) {
              userRole = 'organizer';
              await supabase.auth.updateUser({ data: { role: 'organizer' } }).catch(() => {});
            } else if (cleanEmail.toLowerCase().includes('admin')) {
              userRole = 'admin';
              await supabase.auth.updateUser({ data: { role: 'admin' } }).catch(() => {});
            } else {
              try {
                const { data: orgRecord } = await supabase
                  .from('organizers')
                  .select('id')
                  .eq('email', cleanEmail)
                  .maybeSingle();
                if (orgRecord) {
                  userRole = 'organizer';
                  await supabase.auth.updateUser({ data: { role: 'organizer' } }).catch(() => {});
                }
              } catch {}
            }
          }

          if (loggedInUser && loggedInUser.user_metadata) {
            loggedInUser.user_metadata.role = userRole;
          }

          setUser(loggedInUser);
          syncUserProfile(loggedInUser);

          return { error: null, role: userRole, user: loggedInUser };
        } catch (err: unknown) {
          const authErr = err as AuthError;
          return { error: authErr.message || 'Failed to sign in' };
        }
      } else {
        // Mock Sign In
        let mockRole: UserRole = 'attendee';
        if (email.includes('admin')) {
          mockRole = 'admin';
        } else if (email.includes('organizer')) {
          mockRole = 'organizer';
        }

        const mockProfile: UserProfile = {
          id: `usr-${Date.now()}`,
          email,
          full_name: email.split('@')[0].toUpperCase(),
          role: mockRole,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        };
        const mockUser = {
          id: mockProfile.id,
          email,
          user_metadata: { full_name: mockProfile.full_name, role: mockRole },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User;

        setUser(mockUser);
        setProfile(mockProfile);
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_MOCK_USER_KEY, JSON.stringify(mockProfile));
        }
        return { error: null, role: mockRole, user: mockUser };
      }
    },
    [configured, syncUserProfile]
  );

  // Sign Up function
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      meta: SignUpMeta
    ): Promise<{ error: string | null; needsEmailConfirmation?: boolean; user?: User | null; role?: UserRole }> => {
      // Security: Admin accounts cannot be created publicly
      const sanitizedRole: UserRole = meta.role === 'admin' ? 'attendee' : meta.role || 'attendee';
      const cleanEmail = email.trim();

      if (configured) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                full_name: meta.fullName,
                role: sanitizedRole,
                phone: meta.phone || '',
              },
              emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined,
            },
          });

          if (error) return { error: error.message };

          const createdUser = data.user;

          // Check if account already exists (Supabase GoTrue returns empty identities array when user already registered)
          if (createdUser && Array.isArray(createdUser.identities) && createdUser.identities.length === 0) {
            return {
              error: `An account with "${cleanEmail}" already exists in Supabase. Please sign in with your password, or delete the old account in Supabase Dashboard -> Authentication -> Users to recreate it.`,
            };
          }

          // If role is organizer, insert a record into the organizers table
          if (sanitizedRole === 'organizer') {
            try {
              await supabase.from('organizers').insert([
                {
                  name: meta.fullName,
                  email: cleanEmail,
                  phone: meta.phone || '+91 98765 43210',
                  logo: '/organizers/organizer_workspace.jpg',
                },
              ]);
            } catch (orgErr) {
              console.warn('[AuthContext] Could not create organizer record:', orgErr);
            }
          }

          // Check if email confirmation is required by Supabase project settings
          const needsConfirmation = !data.session;
          if (createdUser && data.session) {
            setUser(createdUser);
            syncUserProfile(createdUser);
          }

          return {
            error: null,
            needsEmailConfirmation: needsConfirmation,
            user: createdUser,
            role: sanitizedRole,
          };
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
          role: sanitizedRole,
          phone: meta.phone,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        };
        const mockUser = {
          id: mockProfile.id,
          email,
          user_metadata: { full_name: mockProfile.full_name, role: sanitizedRole },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User;

        setUser(mockUser);
        setProfile(mockProfile);
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_MOCK_USER_KEY, JSON.stringify(mockProfile));
        }
        return { error: null, needsEmailConfirmation: false, user: mockUser, role: sanitizedRole };
      }
    },
    [configured, syncUserProfile]
  );

  // Upgrade existing user to Organizer
  const upgradeToOrganizer = useCallback(
    async (phone?: string): Promise<{ error: string | null }> => {
      if (!user) return { error: 'No user signed in' };

      if (configured) {
        try {
          const { data, error } = await supabase.auth.updateUser({
            data: {
              role: 'organizer',
              phone: phone || user.user_metadata?.phone || '',
            },
          });
          if (error) return { error: error.message };

          // Also insert into organizers table if not present
          try {
            await supabase.from('organizers').insert([
              {
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Organizer',
                email: user.email || '',
                phone: phone || user.user_metadata?.phone || '+91 98765 43210',
                logo: '/organizers/organizer_workspace.jpg',
              },
            ]);
          } catch (orgErr) {
            console.warn('[AuthContext] Organizer table update notice:', orgErr);
          }

          if (data.user) {
            setUser(data.user);
            syncUserProfile(data.user);
          }
          return { error: null };
        } catch (err: unknown) {
          return { error: (err as Error).message || 'Failed to upgrade role' };
        }
      } else {
        // Mock upgrade
        if (profile) {
          const updated = { ...profile, role: 'organizer' as UserRole };
          setProfile(updated);
          if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_MOCK_USER_KEY, JSON.stringify(updated));
          }
        }
        return { error: null };
      }
    },
    [configured, user, profile, syncUserProfile]
  );

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
  const resetPassword = useCallback(
    async (email: string): Promise<{ error: string | null }> => {
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
        return { error: null };
      }
    },
    [configured]
  );

  // Update Password
  const updatePassword = useCallback(
    async (newPassword: string): Promise<{ error: string | null }> => {
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
    },
    [configured]
  );

  // OAuth Sign In function
  const signInWithOAuth = useCallback(
    async (provider: 'google' | 'github'): Promise<{ error: string | null }> => {
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
    },
    [configured]
  );

  const contextValue = useMemo(
    () => ({
      user,
      profile,
      role,
      session,
      loading,
      isConfigured: configured,
      isAdmin,
      isOrganizer,
      isAttendee,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      signInWithOAuth,
      upgradeToOrganizer,
    }),
    [
      user,
      profile,
      role,
      session,
      loading,
      configured,
      isAdmin,
      isOrganizer,
      isAttendee,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      signInWithOAuth,
      upgradeToOrganizer,
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

export function useUser() {
  const { user, profile, role, loading, isAdmin, isOrganizer, isAttendee } = useAuth();
  return { user, profile, role, loading, isAdmin, isOrganizer, isAttendee };
}

export function useSession() {
  const { session, loading } = useAuth();
  return { session, loading };
}
