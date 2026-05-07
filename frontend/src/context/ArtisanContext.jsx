import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/AuthContext";

const ArtisanContext = createContext(null);

function normalizePhoneNumber(phoneNumber = "") {
  return phoneNumber.replace(/\D/g, "").slice(-10);
}

function getStorefrontId(phoneNumber = "") {
  return normalizePhoneNumber(phoneNumber).slice(-4) || "0000";
}

function mapProfileFromDb(dbProfile) {
  if (!dbProfile) {
    return null;
  }

  const normalizedPhone = normalizePhoneNumber(dbProfile.phone || "");

  return {
    ...dbProfile,
    craftType: dbProfile.craft_type || "",
    samplePhoto: dbProfile.profile_photo || "",
    storefrontId: dbProfile.store_slug || getStorefrontId(normalizedPhone),
  };
}

function mapProfileUpdatesToDb(updates) {
  const nextUpdates = { ...updates };

  if ("craftType" in nextUpdates) {
    nextUpdates.craft_type = nextUpdates.craftType;
    delete nextUpdates.craftType;
  }

  if ("samplePhoto" in nextUpdates) {
    nextUpdates.profile_photo = nextUpdates.samplePhoto;
    delete nextUpdates.samplePhoto;
  }

  if ("storefrontId" in nextUpdates) {
    nextUpdates.store_slug = nextUpdates.storefrontId;
    delete nextUpdates.storefrontId;
  }

  if ("phone" in nextUpdates) {
    nextUpdates.phone = normalizePhoneNumber(nextUpdates.phone || "");
    if (!nextUpdates.store_slug) {
      nextUpdates.store_slug = getStorefrontId(nextUpdates.phone);
    }
  }

  return nextUpdates;
}

export function ArtisanProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const isOnboarded = profile?.store_setup === true;

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!user?.id) {
        if (isMounted) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!isMounted) {
        return;
      }

      setProfile(mapProfileFromDb(data));
      setLoading(false);
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const value = useMemo(
    () => ({
      isOnboarded,
      loading,
      profile,
      async updateProfile(nextProfile) {
        if (!user?.id) {
          return { success: false, error: "You must be logged in to update your profile." };
        }

        const dbUpdates = mapProfileUpdatesToDb(nextProfile);
        const { error } = await supabase
          .from("profiles")
          .update(dbUpdates)
          .eq("id", user.id);

        if (error) {
          return { success: false, error: error.message };
        }

        setProfile((current) => {
          const currentSafe = current || mapProfileFromDb({ id: user.id, ...dbUpdates });
          return {
            ...currentSafe,
            ...nextProfile,
            phone: normalizePhoneNumber(nextProfile.phone || currentSafe?.phone || ""),
            storefrontId:
              nextProfile.storefrontId ||
              currentSafe?.storefrontId ||
              getStorefrontId(nextProfile.phone || currentSafe?.phone || ""),
          };
        });

        return { success: true };
      },
    }),
    [isOnboarded, loading, profile, user?.id],
  );

  if (loading) {
    return null;
  }

  return <ArtisanContext.Provider value={value}>{children}</ArtisanContext.Provider>;
}

/**
 * Reads artisan profile state.
 * @returns {{profile: object | null, isOnboarded: boolean, updateProfile: Function}}
 */
export function useArtisan() {
  return useContext(ArtisanContext);
}
