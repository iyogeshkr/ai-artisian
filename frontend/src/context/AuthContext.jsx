import React, { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useAuth as useClerkAuth, useClerk, useUser } from "@clerk/react";
import { setApiAuthTokenGetter } from "@/services/apiClient";
import { getClerkRole, getDashboardPath, isOnboarded, isRoleAllowed } from "@/lib/auth";
import { setSupabaseAuthTokenGetter } from "@/utils/supabase";

const AuthContext = createContext(null);

function normalizeClerkUser(clerkUser) {
  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.primaryEmailAddress?.emailAddress || "";
  const role = getClerkRole(clerkUser);
  const onboarded = isOnboarded(clerkUser);
  const name = clerkUser.fullName || clerkUser.username || email;
  const profile = {
    email,
    full_name: name,
    id: clerkUser.id,
    image_url: clerkUser.imageUrl,
    name,
    role,
    store_setup: onboarded,
  };

  return {
    ...clerkUser,
    email,
    id: clerkUser.id,
    isAdmin: role === "admin",
    isArtisan: role === "artisan",
    isOnboarded: onboarded,
    isUser: role === "user",
    name,
    profile,
    role,
  };
}

export function AuthProvider({ children }) {
  const { getToken } = useClerkAuth();
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { signOut } = useClerk();

  const getFreshClerkToken = useCallback(() => {
    return getToken({ skipCache: true });
  }, [getToken]);

  useEffect(() => {
    const getSupabaseToken = async () => {
      return getFreshClerkToken();
    };
    setApiAuthTokenGetter(() => getFreshClerkToken());
    setSupabaseAuthTokenGetter(getSupabaseToken);
    return () => {
      setApiAuthTokenGetter(null);
      setSupabaseAuthTokenGetter(null);
    };
  }, [getFreshClerkToken]);

  const user = useMemo(
    () => (isLoaded && isSignedIn ? normalizeClerkUser(clerkUser) : null),
    [clerkUser, isLoaded, isSignedIn],
  );

  const hasRole = useCallback((roles) => {
    return isRoleAllowed(user?.role || "user", roles);
  }, [user?.role]);

  const value = useMemo(
    () => ({
      dashboardPath: getDashboardPath(user?.role, user?.isOnboarded),
      hasRole,
      loading: !isLoaded,
      logout: () => signOut({ redirectUrl: "/" }),
      refreshUser: async () => {
        const refreshedUser = await clerkUser?.reload?.();
        return normalizeClerkUser(refreshedUser || clerkUser);
      },
      user,
    }),
    [clerkUser, hasRole, isLoaded, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
