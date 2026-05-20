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

async function syncProfileRole(clerkUser, role, storeSetup) {
  const supabaseAdmin = getSupabaseAdminClient();

  await supabaseAdmin.from("profiles").upsert(
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
}

router.post("/become-artisan", requireAuth, async (req, res, next) => {
  try {
    const clerkUser = req.clerkUser || await clerkClient.users.getUser(req.userId);

    await clerkClient.users.updateUserMetadata(clerkUser.id, {
      publicMetadata: {
        ...(clerkUser.publicMetadata || {}),
        role: "artisan",
        store_setup: true,
      },
    });

    await syncProfileRole(clerkUser, "artisan", true);

    return res.status(200).json({
      ok: true,
      role: "artisan",
      store_setup: true,
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