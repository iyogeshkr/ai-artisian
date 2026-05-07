import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children, roles, requireOnboarded = false }) {
  const location = useLocation();
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading your session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = user.profile?.role || user.role || "customer";
  const allowedRoles = roles ? (Array.isArray(roles) ? roles : [roles]) : null;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireOnboarded && role === "artisan" && !user.profile?.store_setup) {
    return <Navigate to="/artisan/onboarding" replace />;
  }

  return children;
}

export function DashboardRedirect() {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading your dashboard...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.profile?.role || user.role || "customer";

  if (role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (role === "artisan") {
    return user.profile?.store_setup ? <Navigate to="/artisan/dashboard" replace /> : <Navigate to="/artisan/onboarding" replace />;
  }

  return <Navigate to="/e-commerce" replace />;
}
