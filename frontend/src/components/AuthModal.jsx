import React, { useState } from "react";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function getFriendlyAuthError(message) {
  if (message === "Invalid login credentials") {
    return "Wrong email or password.";
  }

  if (message === "User already registered") {
    return "An account with this email already exists.";
  }

  if (message === "Email not confirmed") {
    return "Please check your email to confirm your account.";
  }

  return message;
}

export default function AuthModal({ open, onOpenChange }) {
  const { login, signup, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState("login");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    confirm: "",
    email: "",
    name: "",
    password: "",
  });

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(loginForm.email.trim())) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const result = await login(loginForm.email, loginForm.password);
    setLoading(false);

    if (result.success) {
      toast({ title: "Welcome back!", description: "You've successfully logged in." });
      onOpenChange(false);
      setLoginForm({ email: "", password: "" });
      return;
    }

    toast({
      title: "Login failed",
      description: getFriendlyAuthError(result.error || "Something went wrong."),
      variant: "destructive",
    });
  };

  const handleSignup = async (event) => {
    event.preventDefault();

    const { confirm, email, name, password } = signupForm;
    if (!name || !email || !password || !confirm) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(email.trim())) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirm) {
      toast({
        title: "Passwords don't match",
        description: "Please re-enter your password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const result = await signup(name, email, password);
    setLoading(false);

    if (result.success) {
      toast({ title: "Account created!", description: `Welcome to AI Artisan, ${name}!` });
      onOpenChange(false);
      setSignupForm({ confirm: "", email: "", name: "", password: "" });
      return;
    }

    toast({
      title: "Signup failed",
      description: getFriendlyAuthError(result.error || "Something went wrong."),
      variant: "destructive",
    });
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await loginWithGoogle();
    setLoading(false);

    if (!result.success) {
      toast({
        title: "Google sign-in failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle className="gradient-text text-xl">AI Artisan</DialogTitle>
          </div>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="l-email">Email</Label>
                <Input
                  id="l-email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((form) => ({ ...form, email: event.target.value }))
                  }
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="l-password">Password</Label>
                <div className="relative">
                  <Input
                    id="l-password"
                    type={showPwd ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((form) => ({ ...form, password: event.target.value }))
                    }
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-2 text-xs text-muted-foreground">or</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogle}
                disabled={loading}
              >
                Continue with Google
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                No account?{" "}
                <button
                  type="button"
                  onClick={() => setTab("signup")}
                  className="font-medium text-primary hover:underline"
                >
                  Sign up free
                </button>
              </p>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="s-name">Full Name</Label>
                <Input
                  id="s-name"
                  placeholder="Rajesh Kumar"
                  value={signupForm.name}
                  onChange={(event) =>
                    setSignupForm((form) => ({ ...form, name: event.target.value }))
                  }
                  autoComplete="name"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="s-email">Email</Label>
                <Input
                  id="s-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signupForm.email}
                  onChange={(event) =>
                    setSignupForm((form) => ({ ...form, email: event.target.value }))
                  }
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="s-password">Password</Label>
                <div className="relative">
                  <Input
                    id="s-password"
                    type={showPwd ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={signupForm.password}
                    onChange={(event) =>
                      setSignupForm((form) => ({ ...form, password: event.target.value }))
                    }
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="s-confirm">Confirm Password</Label>
                <Input
                  id="s-confirm"
                  type={showPwd ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={signupForm.confirm}
                  onChange={(event) =>
                    setSignupForm((form) => ({ ...form, confirm: event.target.value }))
                  }
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-2 text-xs text-muted-foreground">or</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogle}
                disabled={loading}
              >
                Continue with Google
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className="font-medium text-primary hover:underline"
                >
                  Login
                </button>
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
