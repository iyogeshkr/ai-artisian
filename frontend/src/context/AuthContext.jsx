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

    // Try to recover session from localStorage if getSession fails
    const recoverSessionFromStorage = async () => {
      try {
        // Get the stored token from localStorage
        const storageKey = Object.keys(localStorage).find(
          (key) => key.startsWith("sb-") && key.endsWith("-auth-token")
        );

        if (storageKey) {
          const tokenData = JSON.parse(localStorage.getItem(storageKey));
          if (tokenData?.user && tokenData?.access_token) {
            // Manually construct a session object
            const recoveredSession = {
              user: tokenData.user,
              access_token: tokenData.access_token,
              token_type: tokenData.token_type || "bearer",
              expires_in: tokenData.expires_in,
              expires_at: tokenData.expires_at,
              refresh_token: tokenData.refresh_token,
            };
            return recoveredSession;
          }
        }
      } catch (err) {
        console.warn("Failed to recover session from storage:", err);
      }
      return null;
    };

    const initializeSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          await applySession(data.session);
        } else {
          // Fallback: try to recover from localStorage
          const recoveredSession = await recoverSessionFromStorage();
          if (recoveredSession?.user) {
            await applySession(recoveredSession);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error initializing session:", error);
        // Last resort: try to recover from localStorage
        const recoveredSession = await recoverSessionFromStorage();
        if (recoveredSession?.user) {
          await applySession(recoveredSession);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeSession();

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
    try {
      const safeName = name.trim().replace(/\s+/g, " ");
      const normalizedEmail = email.trim().toLowerCase();
      const safeRole = VALID_ROLES.has(role) && role !== "admin" ? role : "customer";

      // Add timeout to prevent infinite hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Signup request timed out. Please check your connection and try again.")), 15000)
      );

      const signupPromise = supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: safeName,
            role: safeRole,
          },
        },
      });

      const { data, error } = await Promise.race([signupPromise, timeoutPromise]);

      if (error) {
        return { success: false, error: error.message };
      }

      const signupUser = data?.user;
      if (!signupUser) {
        return { success: false, error: "Could not create account." };
      }

      // Add timeout for profile insert too
      const profileInsertPromise = supabase.from("profiles").insert({
        id: signupUser.id,
        email: normalizedEmail,
        full_name: safeName,
        role: safeRole,
      });

      const profileTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Could not save profile. Please try again.")), 10000)
      );

      const { error: profileError } = await Promise.race([profileInsertPromise, profileTimeoutPromise]);

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      await refreshUser(signupUser);
      return { success: true, userId: signupUser.id, role: safeRole };
    } catch (err) {
      return {
        success: false,
        error: err.message || "An error occurred during signup. Please try again.",
      };
    }
  };

  const signupCustomer = (name, email, password) => signup({ name, email, password, role: "customer" });
  const signupArtisan = (name, email, password) => signup({ name, email, password, role: "artisan" });

  const login = async (email, password) => {
    try {
      // Add timeout to prevent infinite hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Login request timed out. Please check your connection and try again.")), 15000)
      );

      const loginPromise = supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      const { data, error } = await Promise.race([loginPromise, timeoutPromise]);

      if (error) {
        return { success: false, error: error.message };
      }

      const nextUser = await refreshUser(data?.user);
      return { success: true, userId: data?.user?.id, role: nextUser?.profile?.role || "customer" };
    } catch (err) {
      return {
        success: false,
        error: err.message || "An error occurred during login. Please try again.",
      };
    }
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
