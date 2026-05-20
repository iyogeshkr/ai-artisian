export const APP_ROLES = ["user", "artisan", "admin"];

export function normalizeRole(role) {
  return APP_ROLES.includes(role) ? role : "user";
}

export function getClerkRole(clerkUser) {
  return normalizeRole(clerkUser?.publicMetadata?.role);
}

export function isOnboarded(clerkUser) {
  return clerkUser?.publicMetadata?.store_setup === true;
}

export function isRoleAllowed(role, allowedRoles) {
  if (!allowedRoles) {
    return true;
  }

  const normalizedAllowedRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return normalizedAllowedRoles.includes(normalizeRole(role));
}

export function getDashboardPath(role, onboarded = false) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "admin") {
    return "/admin";
  }

  if (normalizedRole === "artisan") {
    return onboarded ? "/artisan/dashboard" : "/artisan/onboarding";
  }

  return "/e-commerce";
}
