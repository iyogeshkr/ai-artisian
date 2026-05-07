import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Store, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function getFriendlyAuthError(message) {
  if (message === "User already registered") return "An account with this email already exists.";
  return message || "Something went wrong.";
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { loading: authLoading, signupArtisan, signupCustomer, user } = useAuth();
  const { toast } = useToast();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ confirm: "", email: "", name: "", password: "" });
  const role = searchParams.get("role") === "artisan" ? "artisan" : "customer";

  const roleConfig = useMemo(() => {
    if (role === "artisan") {
      return { icon: Store, title: "Artisan signup", cta: "Create artisan account", next: "/artisan/onboarding" };
    }
    return { icon: UserRound, title: "Customer signup", cta: "Create customer account", next: "/e-commerce" };
  }, [role]);

  if (!authLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const setRole = (nextRole) => {
    setSearchParams(nextRole === "artisan" ? { role: "artisan" } : {});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { confirm, email, name, password } = form;

    if (!name.trim() || !email.trim() || !password || !confirm) {
      toast({ title: "Missing fields", description: "Please fill in every field.", variant: "destructive" });
      return;
    }

    if (!isValidEmail(email.trim())) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    if (password.length < 6 || password !== confirm) {
      toast({ title: "Check password", description: "Use at least 6 characters and confirm it correctly.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const result = role === "artisan" ? await signupArtisan(name, email, password) : await signupCustomer(name, email, password);
    setLoading(false);

    if (!result.success) {
      toast({ title: "Signup failed", description: getFriendlyAuthError(result.error), variant: "destructive" });
      return;
    }

    toast({ title: "Account created", description: role === "artisan" ? "Finish your store setup next." : "Welcome to AI Artisan." });
    navigate(roleConfig.next, { replace: true });
  };

  const RoleIcon = roleConfig.icon;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-lg items-center px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full rounded-2xl border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><RoleIcon className="h-5 w-5" /></span>
          <div>
            <h1 className="text-2xl font-bold">{roleConfig.title}</h1>
            <p className="text-sm text-muted-foreground">Separate accounts keep buying and selling permissions clean.</p>
          </div>
        </div>
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
          <button type="button" onClick={() => setRole("customer")} className={`rounded-lg px-3 py-2 text-sm font-medium ${role === "customer" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Customer</button>
          <button type="button" onClick={() => setRole("artisan")} className={`rounded-lg px-3 py-2 text-sm font-medium ${role === "artisan" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Artisan</button>
        </div>
        <div className="space-y-4">
          <div className="space-y-1"><Label htmlFor="name">Full name</Label><Input id="name" autoComplete="name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></div>
          <div className="space-y-1"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={showPwd ? "text" : "password"} autoComplete="new-password" className="pr-10" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
              <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPwd((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </div>
          <div className="space-y-1"><Label htmlFor="confirm">Confirm password</Label><Input id="confirm" type={showPwd ? "text" : "password"} autoComplete="new-password" value={form.confirm} onChange={(event) => setForm((current) => ({ ...current, confirm: event.target.value }))} /></div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating account..." : roleConfig.cta}</Button>
          <p className="text-center text-sm text-muted-foreground">Already have an account? <Link className="text-primary hover:underline" to="/login">Login</Link></p>
        </div>
      </form>
    </div>
  );
}
