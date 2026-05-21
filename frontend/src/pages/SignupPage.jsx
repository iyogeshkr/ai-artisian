import { useMemo } from "react";
import { Show, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/react";
import { Navigate, useSearchParams } from "react-router-dom";
import { Store, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPath } from "@/lib/auth";

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const { loading, user } = useAuth();
  const { isLoaded, isSignedIn } = useUser();
  const intent = searchParams.get("role") === "artisan" ? "artisan" : "user";

  const roleConfig = useMemo(() => {
    if (intent === "artisan") {
      return {
        description: "Start as a user, then complete artisan onboarding after signup.",
        icon: Store,
        title: "Artisan onboarding",
        next: "/artisan/onboarding",
      };
    }
    return {
      description: "Create a standard account and browse the marketplace.",
      icon: UserCircle2,
      title: "User signup",
      next: "/e-commerce",
    };
  }, [intent]);

  const signedInRedirectPath = useMemo(() => {
    if (!user) {
      return null;
    }

    if (intent === "artisan" && user.role === "user") {
      return "/artisan/onboarding";
    }

    return getDashboardPath(user.role || "user", user.isOnboarded);
  }, [intent, user]);

  if (!loading && signedInRedirectPath) {
    return <Navigate to={signedInRedirectPath} replace />;
  }

  const RoleIcon = roleConfig.icon;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-lg items-center px-4 py-10">
      <section className="w-full rounded-2xl border bg-card p-6 text-center shadow-sm">
        <div className="mb-5 flex items-center gap-3 text-left">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <RoleIcon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold">{roleConfig.title}</h1>
            <p className="text-sm text-muted-foreground">{roleConfig.description}</p>
          </div>
        </div>

        {intent === "artisan" ? (
          <div className="mb-5 rounded-xl border border-primary/10 bg-primary/5 p-4 text-left text-sm text-muted-foreground">
            New accounts always start as <span className="font-semibold text-foreground">user</span>. After signup, complete onboarding to upgrade securely to artisan.
          </div>
        ) : null}

        <div className="space-y-3">
          {(!isLoaded || !isSignedIn) ? (
            <>
              <SignUpButton mode="modal" forceRedirectUrl={roleConfig.next}>
                <Button className="w-full">{intent === "artisan" ? "Create account and continue" : "Create account"}</Button>
              </SignUpButton>
              <SignInButton mode="modal" forceRedirectUrl={roleConfig.next}>
                <Button variant="outline" className="w-full">Already have an account</Button>
              </SignInButton>
            </>
          ) : null}
          <Show when="signed-in">
            <div className="flex items-center justify-center gap-3 rounded-xl border bg-background p-4">
              <UserButton afterSignOutUrl="/" />
              <span className="text-sm font-medium">You are signed in</span>
            </div>
          </Show>
        </div>
      </section>
    </div>
  );
}
