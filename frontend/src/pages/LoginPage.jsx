import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function getFriendlyAuthError(message) {
  if (message === "Invalid login credentials") return "Wrong email or password.";
  if (message === "Email not confirmed") return "Please check your email to confirm your account.";
  return message || "Something went wrong.";
}

function getNextPath(user, fallback = "/dashboard") {
  const role = user?.profile?.role || user?.role || "customer";
  if (role === "admin") return "/admin";
  if (role === "artisan") return user?.profile?.store_setup ? "/artisan/dashboard" : "/artisan/onboarding";
  return fallback;
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.6 12.23c0-.74-.07-1.45-.19-2.13H12v4.03h5.95a5.1 5.1 0 0 1-2.21 3.35v2.73h3.57c2.09-1.93 3.29-4.78 3.29-7.98Z" />
      <path fill="#34A853" d="M12 23c2.98 0 5.48-.98 7.31-2.79l-3.57-2.73c-.99.66-2.25 1.05-3.74 1.05-2.87 0-5.3-1.91-6.17-4.49H2.14v2.82A11.02 11.02 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.83 14.04a6.6 6.6 0 0 1 0-4.08V7.14H2.14a11 11 0 0 0 0 9.72l3.69-2.82Z" />
      <path fill="#EA4335" d="M12 5.47c1.62 0 3.07.55 4.21 1.63l3.17-3.12A10.72 10.72 0 0 0 12 1 11.02 11.02 0 0 0 2.14 7.14l3.69 2.82C6.7 7.38 9.13 5.47 12 5.47Z" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading: authLoading, login, loginWithGoogle, user } = useAuth();
  const { toast } = useToast();
  const [roleIntent, setRoleIntent] = useState("customer");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const from = useMemo(() => location.state?.from?.pathname || "/dashboard", [location.state]);
  const signupPath = roleIntent === "artisan" ? "/signup?role=artisan" : "/signup";

  if (!authLoading && user) {
    return <Navigate to={getNextPath(user, from)} replace />;
  }

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "", form: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!isValidEmail(form.email.trim())) nextErrors.email = "Enter a valid email address.";
    if (!form.password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);

    if (!result.success) {
      const message = getFriendlyAuthError(result.error);
      setErrors({ form: message });
      toast({ title: "Login failed", description: message, variant: "destructive" });
      return;
    }

    navigate(from || "/dashboard", { replace: true });
  };

  const handleGoogle = async () => {
    setErrors({});
    setLoading(true);
    const result = await loginWithGoogle(roleIntent);
    setLoading(false);
    if (!result.success) {
      setErrors({ form: result.error });
      toast({ title: "Google sign-in failed", description: result.error, variant: "destructive" });
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#fffaf4] px-4 py-6 sm:min-h-[calc(100vh-8rem)] sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(249,115,22,0.14),transparent_28%),radial-gradient(circle_at_86%_20%,rgba(20,184,166,0.11),transparent_24%),linear-gradient(135deg,rgba(255,247,237,0.9),rgba(255,255,255,0.86))]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:linear-gradient(45deg,#7c2d12_1px,transparent_1px),linear-gradient(-45deg,#7c2d12_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-md items-center sm:min-h-[calc(100vh-10rem)]">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: "easeOut" }}
          className="w-full rounded-2xl border border-white/80 bg-white/90 p-5 shadow-[0_24px_70px_rgba(124,45,18,0.13)] backdrop-blur sm:p-7"
        >
          <div className="mb-6 text-center">
            <motion.div
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.08 }}
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/20"
            >
              <Sparkles className="h-6 w-6" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Welcome Back 👋</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-500">Access your AI-powered artisan workspace</p>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-zinc-100 p-1">
            {["customer", "artisan"].map((role) => {
              const active = roleIntent === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRoleIntent(role)}
                  className={`relative min-h-11 rounded-xl text-sm font-semibold capitalize transition-all duration-200 active:scale-[0.98] ${active ? "text-zinc-950" : "text-zinc-500 hover:text-zinc-800"}`}
                >
                  {active ? <motion.span layoutId="login-role-pill" className="absolute inset-0 rounded-xl bg-white shadow-sm" transition={{ type: "spring", stiffness: 380, damping: 32 }} /> : null}
                  <span className="relative">{role}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-800">Email address</label>
              <div className="relative">
                <Mail className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${errors.email ? "text-red-500" : "text-zinc-400"}`} />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className={`h-13 rounded-2xl border bg-white pl-12 text-base shadow-sm transition-all duration-200 placeholder:text-zinc-400 focus-visible:ring-4 ${errors.email ? "border-red-400 focus-visible:ring-red-100" : "border-zinc-200 focus-visible:border-orange-400 focus-visible:ring-orange-100"}`}
                />
              </div>
              {errors.email ? <p className="mt-2 text-sm font-medium text-red-600">{errors.email}</p> : null}
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-800">Password</label>
              <div className="relative">
                <Lock className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${errors.password ? "text-red-500" : "text-zinc-400"}`} />
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  className={`h-13 rounded-2xl border bg-white pl-12 pr-12 text-base shadow-sm transition-all duration-200 placeholder:text-zinc-400 focus-visible:ring-4 ${errors.password ? "border-red-400 focus-visible:ring-red-100" : "border-zinc-200 focus-visible:border-orange-400 focus-visible:ring-orange-100"}`}
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPwd((value) => !value)}
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 active:scale-95"
                >
                  {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password ? <p className="mt-2 text-sm font-medium text-red-600">{errors.password}</p> : null}
            </div>

            {errors.form ? <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{errors.form}</p> : null}

            <motion.div whileTap={{ scale: 0.99 }}>
              <Button
                type="submit"
                className="h-13 w-full rounded-2xl bg-gradient-to-r from-orange-600 to-rose-600 text-base font-semibold text-white shadow-lg shadow-orange-600/20 transition-all duration-200 hover:from-orange-500 hover:to-rose-500 hover:shadow-orange-600/30"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </motion.div>

            <Button
              type="button"
              variant="outline"
              className="h-13 w-full rounded-2xl border-zinc-200 bg-white text-base font-semibold text-zinc-800 shadow-sm transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.99]"
              onClick={handleGoogle}
              disabled={loading}
            >
              <GoogleIcon />
              <span className="ml-2">Continue with Google</span>
            </Button>
          </div>

          <div className="mt-6 space-y-3 text-center">
            <p className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" /> Your data is सुरक्षित (secure)
            </p>
            <p className="text-sm text-zinc-500">
              {roleIntent === "artisan" ? "Want to sell? " : "New here? "}
              <Link className="font-semibold text-orange-700 transition-colors hover:text-orange-600 hover:underline" to={signupPath}>
                {roleIntent === "artisan" ? "Apply as Artisan" : "Create account"}
              </Link>
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
