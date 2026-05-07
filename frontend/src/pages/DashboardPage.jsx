import { Lightbulb, Package2, Share2, Sparkles, Store, Wand2 } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import MobileBottomNav from "@/components/artisan/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { useArtisan } from "@/context/ArtisanContext";
import { useProducts } from "@/context/ProductContext";
import { pingAnalytics } from "@/utils/analytics";
import { useEffect } from "react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isOnboarded, profile } = useArtisan();
  const { products } = useProducts();

  useEffect(() => {
    if (profile) {
      pingAnalytics("/artisan/dashboard", profile.phone);
    }
  }, [profile]);

  if (!isOnboarded) {
    return <Navigate to="/artisan/onboarding" replace />;
  }

  const storefrontUrl = `${window.location.origin}/store/${profile.storefrontId}`;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fffaf4,_#fff)] pb-24">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-primary/10 bg-white p-6 shadow-lg shadow-primary/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-base text-muted-foreground">Artisan Dashboard</p>
              <h1 className="mt-1 text-4xl font-bold">Namaste, {profile.name}</h1>
              <span className="mt-3 inline-flex min-h-11 items-center rounded-full bg-primary/10 px-4 py-2 text-base font-semibold capitalize text-primary">
                {profile.craftType}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-muted px-4 py-4">
                <p className="text-base text-muted-foreground">Region</p>
                <p className="text-lg font-semibold">{profile.region}</p>
              </div>
              <div className="rounded-[1.5rem] bg-muted px-4 py-4">
                <p className="text-base text-muted-foreground">Products</p>
                <p className="text-lg font-semibold">{products.length} live items</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-base font-semibold text-emerald-700">
                <Store className="h-4 w-4" />
                Your storefront link
              </p>
              <p className="mt-3 text-xl font-semibold">/store/{profile.storefrontId}</p>
              <p className="mt-1 text-base text-muted-foreground">{storefrontUrl}</p>
            </div>
            <div className="flex gap-3">
              <a
                className="inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-2 text-base font-medium hover:bg-muted"
                href={storefrontUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open Store
              </a>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigator.clipboard?.writeText(storefrontUrl).catch(() => {})}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={() => navigate("/design")}
            className="w-full rounded-[1.75rem] border bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-4 inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl bg-primary/10 p-3 text-primary">
              <Wand2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold">Generate New Design</h2>
            <p className="mt-2 text-base text-muted-foreground">
              Craft, style à¤”à¤° color palette à¤¸à¥‡ 3 new concepts à¤¬à¤¨à¤¾à¤‡à¤à¥¤
            </p>
          </button>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="w-full rounded-[1.75rem] border bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-4 inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl bg-primary/10 p-3 text-primary">
              <Package2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold">My Products</h2>
            <p className="mt-2 text-base text-muted-foreground">
              à¤…à¤ªà¤¨à¥‡ listings à¤¦à¥‡à¤–à¥‡à¤‚, à¤¨à¤ products à¤œà¥‹à¤¡à¤¼à¥‡à¤‚, à¤”à¤° share à¤•à¤°à¥‡à¤‚à¥¤
            </p>
          </button>
          <button
            type="button"
            onClick={() => navigate("/learn")}
            className="w-full rounded-[1.75rem] border bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-4 inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl bg-primary/10 p-3 text-primary">
              <Lightbulb className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold">Learn & Earn</h2>
            <p className="mt-2 text-base text-muted-foreground">
              Pricing, eco packaging, WhatsApp à¤”à¤° Instagram à¤•à¥‡ micro-lessons.
            </p>
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-[2rem] border bg-card p-6 shadow-sm">
            <p className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-base font-semibold text-primary">
              <Sparkles className="h-4 w-4" />
              Quick Start
            </p>
            <h2 className="mt-3 text-3xl font-bold">à¤†à¤œ à¤•à¥à¤¯à¤¾ à¤•à¤°à¤¨à¤¾ à¤¹à¥ˆ?</h2>
            <div className="mt-5 space-y-3 text-base text-muted-foreground">
              <p>1. à¤¨à¤ˆ design generate à¤•à¤°à¥‡à¤‚</p>
              <p>2. à¤•à¤® à¤¸à¥‡ à¤•à¤® 1 product add à¤•à¤°à¥‡à¤‚</p>
              <p>3. Learn section à¤®à¥‡à¤‚ pricing card à¤ªà¤¢à¤¼à¥‡à¤‚</p>
            </div>
          </div>
          <div className="rounded-[2rem] border bg-card p-6 shadow-sm">
            <p className="text-base text-muted-foreground">Next action</p>
            <h3 className="mt-2 text-2xl font-semibold">AI-assisted product listing</h3>
            <p className="mt-3 text-base text-muted-foreground">
              à¤ªà¤¹à¤²à¥‡ design à¤¬à¤¨à¤¾à¤‡à¤, à¤«à¤¿à¤° à¤‰à¤¸à¥€ image à¤•à¥‹ à¤…à¤ªà¤¨à¥‡ product card à¤®à¥‡à¤‚ à¤‡à¤¸à¥à¤¤à¥‡à¤®à¤¾à¤² à¤•à¥€à¤œà¤¿à¤à¥¤
            </p>
            <Button type="button" className="mt-5" onClick={() => navigate("/design")}>
              Start Designing
            </Button>
          </div>
        </div>

        <div className="mt-6 hidden justify-center md:flex">
          <div className="inline-flex rounded-full border bg-white p-2 shadow-sm">
            <Link className="rounded-full bg-primary px-4 py-2 text-base font-medium text-primary-foreground" to="/artisan/dashboard">
              Home
            </Link>
            <Link className="rounded-full px-4 py-2 text-base font-medium text-muted-foreground" to="/design">
              Design
            </Link>
            <Link className="rounded-full px-4 py-2 text-base font-medium text-muted-foreground" to="/products">
              Products
            </Link>
            <Link className="rounded-full px-4 py-2 text-base font-medium text-muted-foreground" to="/learn">
              Learn
            </Link>
          </div>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}

