import React, { useEffect, useState } from "react";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { Show, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

function useHashNav() {
  const navigate = useNavigate();
  return (href, closeFn) => {
    if (closeFn) closeFn();
    if (href.startsWith("/#")) {
      const id = href.slice(2);
      if (window.location.pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 350);
      }
    } else {
      navigate(href);
    }
  };
}

const navItems = [
  { name: "Home", href: "/" },
  { name: "Marketplace", href: "/e-commerce" },
  { name: "About", href: "/about" },
  { name: "For Artisans", href: "/signup?role=artisan" },
];

function DesktopAuthActions() {
  const { isLoaded, isSignedIn } = useUser();

  if (isLoaded && isSignedIn) {
    return null;
  }

  return (
    <div className="hidden items-center gap-2 md:flex">
      <SignInButton mode="modal">
        <Button size="sm" variant="outline">
          <User className="mr-1 h-4 w-4" />Login
        </Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button size="sm">Sign Up</Button>
      </SignUpButton>
    </div>
  );
}

function MobileAuthActions() {
  const { isLoaded, isSignedIn } = useUser();

  if (isLoaded && isSignedIn) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-2 pt-2">
      <SignInButton mode="modal">
        <Button variant="outline" className="min-h-[48px]">Login</Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button className="min-h-[48px]">Sign Up</Button>
      </SignUpButton>
    </div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { count, setIsOpen: openCart } = useCart();
  const goTo = useHashNav();
  const close = () => setIsOpen(false);

  useEffect(() => {
    const handler = (event) => {
      if (isOpen && !event.target.closest("nav")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [isOpen]);

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <button onClick={() => goTo("/")} className="border-none bg-transparent p-0 text-2xl font-bold gradient-text cursor-pointer">
            AI Artisan
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden items-center space-x-1 md:flex">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => goTo(item.href)}
                  className="rounded-md border-none bg-transparent px-3 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary cursor-pointer"
                >
                  {item.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => openCart(true)}
              className="relative rounded-md p-2 transition-colors hover:bg-muted"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>

            <Show when="signed-in">
              <div className="hidden md:flex">
                <UserButton afterSignOutUrl="/" />
              </div>
            </Show>
            <DesktopAuthActions />

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen((value) => !value)}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      <div className={cn("overflow-hidden transition-all duration-300 md:hidden", isOpen ? "max-h-96" : "max-h-0")}>
        <div className="space-y-1 border-t bg-background/95 px-4 pb-4 pt-2 backdrop-blur-md">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => goTo(item.href, close)}
              className="flex min-h-[48px] w-full cursor-pointer items-center rounded-md border-none bg-transparent px-3 py-3 text-left text-base font-medium transition-colors hover:bg-muted hover:text-primary"
            >
              {item.name}
            </button>
          ))}
          <Show when="signed-in">
            <div className="flex items-center gap-3 border-t pt-4">
              <UserButton afterSignOutUrl="/" />
              <Button variant="outline" className="flex-1" onClick={() => goTo("/dashboard", close)}>
                Dashboard
              </Button>
            </div>
          </Show>
          <MobileAuthActions />
        </div>
      </div>
    </nav>
  );
}
