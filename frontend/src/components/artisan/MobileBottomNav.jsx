import { Home, Lightbulb, Package2, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const items = [
  { icon: Home, label: "Home", to: "/artisan/dashboard" },
  { icon: Sparkles, label: "Design", to: "/design" },
  { icon: Package2, label: "Products", to: "/products" },
  { icon: Lightbulb, label: "Learn", to: "/learn" },
];

export default function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-3xl grid-cols-4">
        {items.map((item) => {
          const active = location.pathname === item.to;
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              className={`flex flex-col items-center gap-1 px-2 py-3 text-xs font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
              to={item.to}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

