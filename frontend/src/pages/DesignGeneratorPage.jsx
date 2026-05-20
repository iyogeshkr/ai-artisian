import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Palette, RefreshCw, Share2 } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import MobileBottomNav from "@/components/artisan/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  COLOR_PALETTE_OPTIONS,
  ONBOARDING_CRAFT_TYPES,
  STYLE_OPTIONS,
} from "@/data/artisanData";
import { useArtisan } from "@/context/ArtisanContext";
import { useDesigns } from "@/context/DesignContext";
import { generateDesigns } from "@/services/designService";
import { pingAnalytics } from "@/utils/analytics";
import { shareProduct } from "@/utils/share";

const TOTAL_STEPS = 4;
const EMPTY_PLACEHOLDERS = [0, 1, 2];

function DesignSkeletonTile() {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border bg-card">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-11 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}

export default function DesignGeneratorPage() {
  const navigate = useNavigate();
  const { isOnboarded, profile } = useArtisan();
  const { currentDesigns, selectedDesign, selectDesign, setCurrentDesignBatch } = useDesigns();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    colorPalette: "earthy",
    craftType: profile?.craftType || "pottery",
    description: "",
    style: "fusion",
  });
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [hasRetried503, setHasRetried503] = useState(false);

  useEffect(() => {
    if (profile) {
      pingAnalytics("/design", profile.phone);
    }
  }, [profile]);

  useEffect(() => {
    if (retryCountdown <= 0) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setRetryCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [retryCountdown]);

  if (!isOnboarded) {
    return <Navigate to="/artisan/onboarding" replace />;
  }

  const canGoNext =
    step === 1
      ? Boolean(form.craftType)
      : step === 2
        ? Boolean(form.style)
        : step === 3
          ? Boolean(form.colorPalette)
          : true;

  const canGenerate = useMemo(
    () => form.description.trim().length <= 200,
    [form.description],
  );

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
  };

  const runGeneration = async (allowRetry = true) => {
    setIsGenerating(true);
    setError("");

    try {
      const result = await generateDesigns(form);
      const designs = result.designs.map((design, index) => ({
        ...design,
        id: `${result.generatedAt}-${index}`,
        imageUrl: `data:${design.mimeType};base64,${design.imageBase64}`,
      }));
      setCurrentDesignBatch(designs);

      if (result.hasPartialFailure) {
        setError("à¤•à¥à¤› designs à¤¨à¤¹à¥€à¤‚ à¤¬à¤¨ à¤¸à¤•à¥€à¤‚, à¤²à¥‡à¤•à¤¿à¤¨ à¤œà¥‹ à¤¬à¤¨ à¤—à¤ˆ à¤¹à¥ˆà¤‚ à¤‰à¤¨à¥à¤¹à¥‡à¤‚ à¤†à¤ª à¤…à¤­à¥€ use à¤•à¤° à¤¸à¤•à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤");
      }
    } catch (generationError) {
      if (generationError.status === 503 && allowRetry && !hasRetried503) {
        setHasRetried503(true);
        setRetryCountdown(5);
        window.setTimeout(() => {
          runGeneration(false);
        }, 5000);
        return;
      }

      setError(
        generationError.message || "Design couldn't load, try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const shareSelectedDesign = async (design) => {
    await shareProduct({
      product: {
        description: design.prompt,
        name: "AI Artisan Design",
        price: 0,
      },
      shareUrl: design.imageUrl,
      storefrontUrl: `${window.location.origin}/design`,
    });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fff9f2,_#ffffff)] pb-24">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base text-muted-foreground">Design Generator</p>
              <h1 className="text-3xl font-bold">Generate modern craft designs</h1>
            </div>
            <span className="rounded-full bg-primary/10 px-4 py-2 text-base font-semibold text-primary">
              Step {step}/{TOTAL_STEPS}
            </span>
          </div>
          <div className="mt-6 grid grid-cols-4 gap-2">
            {Array.from({ length: TOTAL_STEPS }, (_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full ${index + 1 <= step ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>

          <div className="mt-6 min-h-[24rem]">
            {step === 1 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {ONBOARDING_CRAFT_TYPES.map((craft) => (
                  <button
                    key={craft.value}
                    type="button"
                    onClick={() => updateField("craftType", craft.value)}
                    className={`rounded-3xl border p-4 text-center ${
                      form.craftType === craft.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="text-3xl">{craft.emoji}</div>
                    <p className="mt-3 text-base font-medium">{craft.label}</p>
                  </button>
                ))}
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {STYLE_OPTIONS.map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => updateField("style", style.value)}
                    className={`rounded-[1.75rem] border p-5 text-left ${
                      form.style === style.value ? "border-primary bg-primary/5" : "bg-card"
                    }`}
                  >
                    <h2 className="text-xl font-semibold">{style.label}</h2>
                    <p className="mt-2 text-base text-muted-foreground">
                      {style.label} styling for artisan products
                    </p>
                  </button>
                ))}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {COLOR_PALETTE_OPTIONS.map((palette) => (
                  <button
                    key={palette.value}
                    type="button"
                    onClick={() => updateField("colorPalette", palette.value)}
                    className={`rounded-[1.75rem] border p-5 text-left ${
                      form.colorPalette === palette.value ? "border-primary bg-primary/5" : "bg-card"
                    }`}
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <span className={`h-11 w-11 rounded-full ${palette.swatch}`} />
                      <div>
                        <h2 className="text-xl font-semibold">{palette.label}</h2>
                        <p className="text-base text-muted-foreground">{palette.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}

            {step === 4 ? (
              <div>
                <label className="mb-2 block text-base font-medium">Optional description</label>
                <Textarea
                  className="min-h-[12rem]"
                  maxLength={200}
                  placeholder="Mention motif, target customer, finish, or product idea..."
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                />
                <div className="mt-2 text-right text-base text-muted-foreground">
                  {form.description.length}/200
                </div>
              </div>
            ) : null}
          </div>

          {error ? <p className="mt-4 text-base font-medium text-destructive">{error}</p> : null}
          {retryCountdown > 0 ? (
            <p className="mt-4 text-base text-muted-foreground">Retrying in {retryCountdown}s...</p>
          ) : null}

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button type="button" variant="outline" onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1 || isGenerating}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {step < TOTAL_STEPS ? (
              <Button type="button" onClick={() => setStep((current) => Math.min(TOTAL_STEPS, current + 1))} disabled={!canGoNext || isGenerating}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={() => runGeneration()} 
                disabled={!canGenerate || isGenerating || retryCountdown > 0}
                className="min-w-[200px]"
              >
                <Palette className="mr-2 h-4 w-4" />
                {isGenerating 
                  ? "Generating..." 
                  : retryCountdown > 0 
                    ? `Retry in ${retryCountdown}s` 
                    : "Generate Designs"}
              </Button>
            )}
          </div>
        </div>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Results</h2>
            <Link className="text-base font-medium text-primary" to="/artisan/dashboard">
              Back to dashboard
            </Link>
          </div>
          {isGenerating ? (
            <div className="grid gap-4 md:grid-cols-3">
              {EMPTY_PLACEHOLDERS.map((item) => (
                <DesignSkeletonTile key={item} />
              ))}
            </div>
          ) : currentDesigns.length === 0 ? (
            <div className="rounded-[2rem] border bg-card p-8 text-center text-base text-muted-foreground">
              No designs yet. Complete the steps above and generate your first set.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {currentDesigns.map((design) => (
                <article key={design.id} className="overflow-hidden rounded-[1.5rem] border bg-card">
                  <img alt="Generated design" className="aspect-square w-full object-cover" src={design.imageUrl} />
                  <div className="space-y-3 p-4">
                    <p className="line-clamp-3 text-base text-muted-foreground">{design.prompt}</p>
                    <div className="flex gap-2">
                      <Button type="button" onClick={() => selectDesign(design)}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Select
                      </Button>
                      <Button type="button" variant="outline" onClick={() => shareSelectedDesign(design)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {selectedDesign ? (
          <section className="mt-6 rounded-[2rem] border bg-card p-5 shadow-sm sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
              <img alt="Selected design" className="w-full rounded-[1.5rem] object-cover" src={selectedDesign.imageUrl} />
              <div>
                <p className="inline-flex min-h-11 items-center rounded-full bg-primary/10 px-4 py-2 text-base font-semibold text-primary">
                  Selected design
                </p>
                <h2 className="mt-4 text-3xl font-bold">Use this design for your product</h2>
                <p className="mt-3 text-base text-muted-foreground">{selectedDesign.prompt}</p>
                <Button className="mt-6" onClick={() => navigate("/products/add")}>
                  Use This Design
                </Button>
              </div>
            </div>
          </section>
        ) : null}
      </div>
      <MobileBottomNav />
    </div>
  );
}

