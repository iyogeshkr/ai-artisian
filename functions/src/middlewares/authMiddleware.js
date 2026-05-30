import { authenticateRequest, clerkClient } from "@clerk/express";
import { getClerkAuthenticateOptions } from "../config/env.js";
import { isRoleAllowed, normalizeRole } from "../utils/roles.js";

function hasBearerToken(req) {
  return req.headers.authorization?.startsWith("Bearer ");
}

function redactToken(header) {
  if (!header) return null;
  const token = header.replace(/^Bearer\s+/i, "");
  if (token.length <= 12) return token;
  return `${token.slice(0, 8)}...${token.slice(-4)}`;
}

function getAuthErrorMessage(error) {
  const message = error?.message || "";

  if (/expired/i.test(message)) {
    return "Authentication token has expired.";
  }

  if (/jwt|token|signature|authorized party|audience/i.test(message)) {
    return "Authentication token is invalid.";
  }

  return "Authentication failed.";
}

function getAuthErrorCode(message = "") {
  return /expired/i.test(message) ? "auth_expired_token" : "auth_invalid_token";
}

export async function requireAuth(req, res, next) {
  if (!hasBearerToken(req)) {
    // Log minimal request info for diagnostics (do not log full tokens)
    const redacted = redactToken(req.headers.authorization);
    console.error("Auth middleware: missing Bearer token. origin=", req.headers.origin, "authorization(redacted)=", redacted);
    return res.status(401).json({
      code: "auth_missing_token",
      error: "Missing or invalid authorization header.",
    });
  }

  try {
    // Helpful debug: log that we're attempting to authenticate and which origin/token prefix arrived
    const redacted = redactToken(req.headers.authorization);
    console.debug("Auth middleware: authenticateRequest attempt. origin=", req.headers.origin, "authorization(redacted)=", redacted);
    const requestState = await authenticateRequest({
      clerkClient,
      request: req,
      options: getClerkAuthenticateOptions(),
    });

    if (!requestState.isAuthenticated) {
      const message = requestState.message || requestState.reason || "Authentication token is invalid.";
      return res.status(401).json({
        code: getAuthErrorCode(message),
        error: message,
      });
    }

    const auth = requestState.toAuth();
    const clerkUser = await clerkClient.users.getUser(auth.userId);
    const role = normalizeRole(clerkUser.publicMetadata?.role);

    req.userId = auth.userId;
    req.user = {
      id: auth.userId,
      role,
    };
    req.clerkUser = clerkUser;
    req.authState = {
      isAuthenticated: true,
      role,
      orgId: auth.orgId || null,
      orgRole: auth.orgRole || null,
      orgSlug: auth.orgSlug || null,
      sessionClaims: auth.sessionClaims || null,
      sessionId: auth.sessionId || null,
      status: requestState.status,
      tokenType: requestState.tokenType || "session_token",
      userId: auth.userId,
    };

    return next();
  } catch (error) {
    // Log server-side auth errors for diagnostics (do not expose full errors to clients)
    const redacted = redactToken(req.headers.authorization);
    console.error("Auth middleware error:", error?.message || error, "origin=", req.headers.origin, "authorization(redacted)=", redacted);
    const message = error?.message || "";
    return res.status(401).json({
      code: getAuthErrorCode(message),
      error: getAuthErrorMessage(error),
    });
  }
}

export function requireRole(allowedRoles) {
  return (req, res, next) => {
    const role = req.authState?.role || req.user?.role || "user";

    if (!isRoleAllowed(role, allowedRoles)) {
      return res.status(403).json({
        code: "forbidden_role",
        error: "You do not have permission to access this resource.",
      });
    }

    return next();
  };
}
