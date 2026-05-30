import { clerkClient } from "@clerk/express";
import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/authMiddleware.js";
import { getSupabaseAdminClient } from "../lib/supabaseAdmin.js";
import { APP_ROLES, normalizeRole } from "../utils/roles.js";

const router = Router();

function getPrimaryEmail(clerkUser) {
  return clerkUser.emailAddresses?.[0]?.emailAddress || clerkUser.primaryEmailAddress?.emailAddress || "";
}

function getDisplayName(clerkUser) {
  return clerkUser.fullName || [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || getPrimaryEmail(clerkUser);
}

function normalizePhoneNumber(phoneNumber = "") {
  return String(phoneNumber).replace(/\D/g, "").slice(-10);
}

function createStoreSlug(name = "") {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getSupabaseError(error, fallbackMessage = "Supabase request failed.") {
  if (!error) return null;
  const nextError = new Error(error.message || fallbackMessage);
  nextError.status = error.code === "23505" ? 409 : error.statusCode || error.status || 500;
  nextError.meta = {
    code: error.code,
    details: error.details,
    hint: error.hint,
  };
  return nextError;
}

async function syncProfileRole(clerkUser, role, storeSetup) {
  const supabaseAdmin = getSupabaseAdminClient();

  const { error } = await supabaseAdmin.from("profiles").upsert(
    {
      clerk_user_id: clerkUser.id,
      email: getPrimaryEmail(clerkUser),
      full_name: getDisplayName(clerkUser),
      name: clerkUser.username || getDisplayName(clerkUser),
      role,
      store_setup: storeSetup,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clerk_user_id" },
  );

  const syncError = getSupabaseError(error, "Profile role sync failed.");
  if (syncError) throw syncError;
}

router.post("/become-artisan", requireAuth, async (req, res, next) => {
  try {
    const clerkUser = req.clerkUser || await clerkClient.users.getUser(req.userId);
    const onboarding = req.body?.onboarding || null;
    const supabaseAdmin = getSupabaseAdminClient();
    const now = new Date().toISOString();
    let profilePayload = null;
    let storePayload = null;

    if (onboarding) {
      const fullName = String(onboarding.name || "").trim();
      const phone = normalizePhoneNumber(onboarding.phone);
      const craftType = String(onboarding.craftType || "").trim();
      const region = String(onboarding.region || "").trim();
      const slug = createStoreSlug(onboarding.store_slug || fullName);

      if (!fullName) {
        return res.status(400).json({ code: "invalid_onboarding_name", error: "Name is required." });
      }

      if (phone.length !== 10) {
        return res.status(400).json({ code: "invalid_onboarding_phone", error: "A valid 10-digit WhatsApp number is required." });
      }

      if (!craftType) {
        return res.status(400).json({ code: "invalid_onboarding_craft", error: "Craft type is required." });
      }

      if (!region) {
        return res.status(400).json({ code: "invalid_onboarding_region", error: "State or union territory is required." });
      }

      if (slug.length < 3) {
        return res.status(400).json({ code: "invalid_store_slug", error: "Store name must be at least 3 characters." });
      }

      const { data: existingProfile, error: profileLookupError } = await supabaseAdmin
        .from("profiles")
        .select("clerk_user_id")
        .eq("store_slug", slug)
        .neq("clerk_user_id", clerkUser.id)
        .maybeSingle();

      const profileLookupFailure = getSupabaseError(profileLookupError, "Store slug lookup failed.");
      if (profileLookupFailure) throw profileLookupFailure;

      const { data: existingStore, error: storeLookupError } = await supabaseAdmin
        .from("stores")
        .select("artisan_id")
        .eq("slug", slug)
        .neq("artisan_id", clerkUser.id)
        .maybeSingle();

      const storeLookupFailure = getSupabaseError(storeLookupError, "Store slug lookup failed.");
      if (storeLookupFailure) throw storeLookupFailure;

      if (existingProfile || existingStore) {
        return res.status(409).json({
          code: "store_slug_taken",
          error: "Store name is already taken. Please choose a different name.",
        });
      }

      profilePayload = {
        artisan_status: "pending",
        avatar_url: clerkUser.imageUrl || null,
        clerk_user_id: clerkUser.id,
        craft_type: craftType,
        email: getPrimaryEmail(clerkUser),
        full_name: fullName,
        name: fullName,
        phone,
        profile_photo: onboarding.samplePhoto || null,
        region,
        role: "artisan",
        store_setup: true,
        store_slug: slug,
        updated_at: now,
      };

      storePayload = {
        artisan_id: clerkUser.id,
        description: `${craftType} artisan from ${region}`,
        name: fullName,
        slug,
        status: "pending",
        updated_at: now,
      };
    }

    await clerkClient.users.updateUserMetadata(clerkUser.id, {
      publicMetadata: {
        ...(clerkUser.publicMetadata || {}),
        role: "artisan",
        store_setup: true,
      },
    });

    if (profilePayload) {
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert(profilePayload, { onConflict: "clerk_user_id" });
      const saveProfileError = getSupabaseError(profileError, "Artisan profile save failed.");
      if (saveProfileError) throw saveProfileError;

      const { error: storeError } = await supabaseAdmin
        .from("stores")
        .upsert(storePayload, { onConflict: "artisan_id" });
      const saveStoreError = getSupabaseError(storeError, "Store save failed.");
      if (saveStoreError) throw saveStoreError;
    } else {
      await syncProfileRole(clerkUser, "artisan", true);
    }

    return res.status(200).json({
      ok: true,
      role: "artisan",
      store_setup: true,
      store_slug: profilePayload?.store_slug,
      userId: clerkUser.id,
    });
  } catch (error) {
    return next(error);
  }
});

router.patch("/admin/users/:userId/role", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    if (!APP_ROLES.includes(req.body?.role)) {
      return res.status(400).json({
        code: "invalid_role",
        error: "Role must be one of: user, artisan, admin.",
      });
    }

    const requestedRole = normalizeRole(req.body?.role);
    const targetUser = await clerkClient.users.getUser(req.params.userId);
    const storeSetup = requestedRole === "artisan" ? Boolean(targetUser.publicMetadata?.store_setup) : false;

    await clerkClient.users.updateUserMetadata(targetUser.id, {
      publicMetadata: {
        ...(targetUser.publicMetadata || {}),
        role: requestedRole,
        store_setup: storeSetup,
      },
    });

    await syncProfileRole(targetUser, requestedRole, storeSetup);

    return res.status(200).json({
      ok: true,
      role: requestedRole,
      store_setup: storeSetup,
      userId: targetUser.id,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
