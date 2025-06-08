"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User as AppUser, Role } from '../types';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  loading: boolean;
  refreshUserProfile: () => Promise<void>; // Added to allow manual refresh if needed
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAndSetAppUser = async (authenticatedSupabaseUser: SupabaseUser) => {
    try {
      // /api/me will internally verify the session with Supabase again
      const response = await fetch('/api/me');
      if (!response.ok) {
        console.error('Failed to fetch user profile from /api/me:', response.status, await response.text());
        // Fallback to basic user info from the authenticated Supabase user
        setUser({
          id: authenticatedSupabaseUser.id,
          email: authenticatedSupabaseUser.email || '',
          name: authenticatedSupabaseUser.user_metadata?.full_name || authenticatedSupabaseUser.email || 'User (Profile Error)',
          role: Role.MEMBER, // Default role
          createdAt: authenticatedSupabaseUser.created_at,
          updatedAt: authenticatedSupabaseUser.updated_at || new Date().toISOString(),
        });
        return;
      }
      const profile = await response.json() as AppUser;
      setUser(profile);
    } catch (error) {
      console.error("Error fetching /api/me:", error);
      // Fallback to basic user info
      setUser({
        id: authenticatedSupabaseUser.id,
        email: authenticatedSupabaseUser.email || '',
        name: authenticatedSupabaseUser.user_metadata?.full_name || authenticatedSupabaseUser.email || 'User (Fetch Error)',
        role: Role.MEMBER,
        createdAt: authenticatedSupabaseUser.created_at,
        updatedAt: authenticatedSupabaseUser.updated_at || new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    const getInitialData = async () => {
      setLoading(true);
      // First, try to get the session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      setSession(currentSession); // Set session state

      if (sessionError) {
        console.error("Error getting initial session:", sessionError);
        setUser(null); // No session means no user
        setLoading(false);
        return;
      }

      if (currentSession) {
        // If a session exists, verify it and get the authenticated user
        const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error("Error getting authenticated user initially:", userError);
          setUser(null); // Error fetching user, treat as logged out for app state
        } else if (supabaseUser) {
          await fetchAndSetAppUser(supabaseUser);
        } else {
          setUser(null); // No authenticated user despite session (e.g., session invalid)
        }
      } else {
        setUser(null); // No session, no user
      }
      setLoading(false);
    };

    getInitialData();

    const { data: authSubscriptionData } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setLoading(true);
        setSession(newSession);

        if (newSession) {
          // Session changed (login/token refresh), get the authenticated user
          const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();
          if (userError) {
            console.error("Error getting authenticated user on auth change:", userError);
            setUser(null);
          } else if (supabaseUser) {
            await fetchAndSetAppUser(supabaseUser);
          } else {
            setUser(null); // No authenticated user for the new session
          }
        } else {
          // Session is null (logout)
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authSubscriptionData?.subscription?.unsubscribe();
    };
  }, [supabase]); // supabase client is stable

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
    }
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  const refreshUserProfile = async () => {
    setLoading(true);
    const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();
    if (userError || !supabaseUser) {
        console.error("Refresh: Error getting authenticated user or no user", userError);
        setUser(null); 
        // Optionally, you could try to sign out here if the user is truly invalid
        // await supabase.auth.signOut(); 
    } else {
        await fetchAndSetAppUser(supabaseUser);
    }
    setLoading(false);
  };

  const isAuthenticated = !!user && !!session;
  const isAdmin = user?.role === Role.ADMIN;

  return (
    <AuthContext.Provider value={{ user, session, isAuthenticated, isAdmin, logout, loading, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};