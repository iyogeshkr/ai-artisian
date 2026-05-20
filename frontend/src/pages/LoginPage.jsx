import { Show, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/react";
import { Navigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPath } from "@/lib/auth";

function getNextPath(user, fallback = "/dashboard") {
  return getDashboardPath(user?.role || "user", user?.isOnboarded) || fallback;
}

export default function LoginPage() {
  const location = useLocation();
  const { loading, user } = useAuth();
  const { isLoaded, isSignedIn } = useUser();
  const from = location.state?.from?.pathname || "/dashboard";

  if (!loading && user) {
    return <Navigate to={getNextPath(user, from)} replace />;
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#fffaf4] px-4 py-6 sm:min-h-[calc(100vh-8rem)] sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(249,115,22,0.14),transparent_28%),radial-gradient(circle_at_86%_20%,rgba(20,184,166,0.11),transparent_24%),linear-gradient(135deg,rgba(255,247,237,0.9),rgba(255,255,255,0.86))]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:linear-gradient(45deg,#7c2d12_1px,transparent_1px),linear-gradient(-45deg,#7c2d12_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-md items-center sm:min-h-[calc(100vh-10rem)]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: "easeOut" }}
          className="w-full rounded-2xl border border-white/80 bg-white/90 p-5 text-center shadow-[0_24px_70px_rgba(124,45,18,0.13)] backdrop-blur sm:p-7"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Welcome Back</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">Access your AI-powered artisan workspace</p>

          <div className="mt-7 space-y-3">
            {(!isLoaded || !isSignedIn) ? (
              <>
                <SignInButton mode="modal" forceRedirectUrl={from}>
                  <Button className="h-13 w-full rounded-2xl bg-gradient-to-r from-orange-600 to-rose-600 text-base font-semibold text-white shadow-lg shadow-orange-600/20 transition-all duration-200 hover:from-orange-500 hover:to-rose-500">
                    Login
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal" forceRedirectUrl={from}>
                  <Button variant="outline" className="h-13 w-full rounded-2xl border-zinc-200 bg-white text-base font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50">
                    Create account
                  </Button>
                </SignUpButton>
              </>
            ) : null}
            <Show when="signed-in">
              <div className="flex items-center justify-center gap-3 rounded-2xl border bg-white p-4">
                <UserButton afterSignOutUrl="/" />
                <span className="text-sm font-medium text-zinc-700">You are signed in</span>
              </div>
            </Show>
          </div>

          <p className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Your data is secure
          </p>
        </motion.section>
      </div>
    </div>
  );
}
