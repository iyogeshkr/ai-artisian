export const APP_ROLES = ["user", "artisan", "admin"];

export function normalizeRole(role) {
  return APP_ROLES.includes(role) ? role : "user";
}

export function isRoleAllowed(role, allowedRoles) {
  if (!allowedRoles) {
    return true;
  }

  const normalizedAllowedRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return normalizedAllowedRoles.includes(normalizeRole(role));
}
