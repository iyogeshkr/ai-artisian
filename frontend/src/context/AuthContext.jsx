import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/config/supabase";

const AuthContext = createContext(null);
const VALID_ROLES = new Set(["customer", "artisan", "admin"]);

function normalizeProfile(profile, authUser) {
  if (!authUser) {
    return null;
  }

  const userMetadata = authUser.user_metadata || {};
  const normalizedRole = VALID_ROLES.has(profile?.role) ? profile.role : "customer";
  const fullName = profile?.full_name || profile?.name || userMetadata.full_name || userMetadata.name || "";

  return {
    ...(profile || {}),
    id: authUser.id,
    email: profile?.email || authUser.email || "",
    full_name: fullName,
    name: fullName,
    role: normalizedRole,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null);
      return null;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    const normalizedProfile = normalizeProfile(profile, authUser);
    const nextUser = {
      ...authUser,
      name: normalizedProfile?.name || authUser.email,
      role: normalizedProfile?.role || "customer",
      profile: normalizedProfile,
    };

    setUser(nextUser);
    return nextUser;
  }, []);

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

      await refreshUser(session.user);
    };

    supabase.auth.getSession().then(({ data }) => {
      applySession(data?.session).finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    });

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
  }, [refreshUser]);

  const signup = async ({ name, email, password, role = "customer" }) => {
    const safeName = name.trim().replace(/\s+/g, " ");
    const normalizedEmail = email.trim().toLowerCase();
    const safeRole = VALID_ROLES.has(role) && role !== "admin" ? role : "customer";

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: safeName,
          role: safeRole,
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
      email: normalizedEmail,
      full_name: safeName,
      role: safeRole,
    });

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    await refreshUser(signupUser);
    return { success: true, userId: signupUser.id, role: safeRole };
  };

  const signupCustomer = (name, email, password) => signup({ name, email, password, role: "customer" });
  const signupArtisan = (name, email, password) => signup({ name, email, password, role: "artisan" });

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const nextUser = await refreshUser(data?.user);
    return { success: true, userId: data?.user?.id, role: nextUser?.profile?.role || "customer" };
  };

  const loginWithGoogle = async (role = "customer") => {
    const safeRole = VALID_ROLES.has(role) && role !== "admin" ? role : "customer";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: "select_account" },
      },
    });

    localStorage.setItem("ai_artisan_pending_oauth_role", safeRole);

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

    const normalizedProfile = normalizeProfile(data, user);
    setUser((currentUser) => ({
      ...currentUser,
      name: normalizedProfile?.name || currentUser?.email,
      role: normalizedProfile?.role || currentUser?.role,
      profile: normalizedProfile,
    }));

    return { success: true, profile: normalizedProfile };
  };

  const hasRole = useCallback((roles) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(user?.profile?.role || user?.role);
  }, [user?.profile?.role, user?.role]);

  const value = useMemo(
    () => ({
      hasRole,
      loading,
      login,
      loginWithGoogle,
      logout,
      refreshUser,
      signup,
      signupArtisan,
      signupCustomer,
      updateProfile,
      user,
    }),
    [hasRole, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
