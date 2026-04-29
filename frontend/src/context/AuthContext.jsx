import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/config/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const applySession = async (session) => {
      if (!isMounted) {
        return;
      }

      if (!session?.user) {
        setUser(null);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setUser({ ...session.user, profile: data || null });
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await applySession(session);
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signup = async (name, email, password) => {
    const safeName = name.trim().replace(/\s+/g, " ");
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name: safeName,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const signupUser = data?.user;
    if (!signupUser) {
      return { success: false, error: "Could not create account." };
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: signupUser.id,
      name: safeName,
      email: normalizedEmail,
      role: "artisan",
      craft_type: null,
      region: null,
      store_setup: false,
      store_slug: null,
      created_at: new Date().toISOString(),
    });

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    return { success: true };
  };

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates) => {
    if (!user?.id) {
      return { success: false, error: "You must be logged in to update your profile." };
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    setUser((currentUser) => ({
      ...currentUser,
      profile: {
        ...(currentUser?.profile || {}),
        ...(data || updates),
      },
    }));

    return { success: true };
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, loginWithGoogle, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
