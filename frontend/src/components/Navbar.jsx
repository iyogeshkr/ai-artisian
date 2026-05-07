import React, { useState, useEffect } from "react";
import { Menu, X, ShoppingBag, User, LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
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
  // { name: "AI Design", href: "/design" },
  { name: "For Artisans", href: "/signup?role=artisan" },
  // { name: "Learn", href: "/learn" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { count, setIsOpen: openCart } = useCart();
  const goTo = useHashNav();
  const close = () => setIsOpen(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (isOpen && !e.target.closest('nav')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <button onClick={() => goTo("/")} className="text-2xl font-bold gradient-text bg-transparent border-none p-0 cursor-pointer">
              AI Artisan
            </button>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Desktop nav */}
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => goTo(item.href)}
                    className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors bg-transparent border-none cursor-pointer"
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              {/* Cart button */}
              <button
                onClick={() => openCart(true)}
                className="relative p-2 rounded-md hover:bg-muted transition-colors"
                aria-label="Open cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </button>

              {/* Auth */}
              {user ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-card hover:bg-muted transition-colors text-sm font-medium"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-1 w-48 bg-card border rounded-lg shadow-lg py-1 z-20">
                        <div className="px-3 py-2 border-b">
                          <p className="font-medium text-sm truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors text-destructive"
                        >
                          <LogOut className="h-4 w-4" />Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Button className="hidden md:flex" size="sm" onClick={() => goTo("/login")}>
                  <User className="h-4 w-4 mr-1" />Login
                </Button>
              )}

              {/* Mobile hamburger */}
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(v => !v)}>
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={cn("md:hidden overflow-hidden transition-all duration-300", isOpen ? "max-h-96" : "max-h-0")}>
          <div className="px-4 pt-2 pb-4 space-y-1 bg-background/95 backdrop-blur-md border-t">
            {navItems.map(item => (
              <button key={item.name} onClick={() => goTo(item.href, close)}
                className="block w-full text-left px-3 py-3 rounded-md text-base font-medium hover:text-primary hover:bg-muted transition-colors bg-transparent border-none cursor-pointer min-h-[48px] flex items-center">
                {item.name}
              </button>
            ))}
            {user ? (
              <div className="pt-2 border-t mt-2">
                <p className="px-3 py-1 text-sm font-medium">{user.name}</p>
                <p className="px-3 text-xs text-muted-foreground mb-2">{user.email}</p>
                <button onClick={() => { handleLogout(); close(); }}
                  className="flex items-center gap-2 w-full px-3 py-3 rounded-md text-sm text-destructive hover:bg-muted transition-colors bg-transparent border-none cursor-pointer min-h-[48px]">
                  <LogOut className="h-4 w-4" />Logout
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <Button className="w-full min-h-[48px]" onClick={() => { goTo("/login", close); }}>
                  Login / Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav></>
  );
}

