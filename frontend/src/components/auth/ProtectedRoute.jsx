import { RedirectToSignIn } from "@clerk/react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPath, isRoleAllowed } from "@/lib/auth";

function AuthLoading({ label }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export function ProtectedRoute({ children, roles, requireOnboarded = false }) {
  const location = useLocation();
  const { loading, user } = useAuth();

  if (loading) {
    return <AuthLoading label="Loading your session..." />;
  }

  if (!user) {
    return <RedirectToSignIn redirectUrl={location.pathname} />;
  }

  const role = user.role || "user";

  if (!isRoleAllowed(role, roles)) {
    return <Navigate to={getDashboardPath(role, user.isOnboarded)} replace />;
  }

  if (requireOnboarded && role === "artisan" && !user.isOnboarded) {
    return <Navigate to="/artisan/onboarding" replace />;
  }

  return children;
}

export function DashboardRedirect() {
  const { loading, user } = useAuth();

  if (loading) {
    return <AuthLoading label="Loading your dashboard..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role || "user";

  return <Navigate to={getDashboardPath(role, user.isOnboarded)} replace />;
}
