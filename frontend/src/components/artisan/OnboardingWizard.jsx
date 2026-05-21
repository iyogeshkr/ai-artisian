import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/config/supabase";
import { ONBOARDING_CRAFT_TYPES, INDIAN_STATES_AND_UTS } from "@/data/artisanData";
import { apiRequest } from "@/services/apiClient";
import { compressImageFile } from "@/utils/imageProcessing";

const TOTAL_STEPS = 4;

function normalizePhoneNumber(phoneNumber = "") {
  return phoneNumber.replace(/\D/g, "").slice(-10);
}

export default function OnboardingWizard({ onComplete }) {
  const navigate = useNavigate();
  const { refreshUser, user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    craftType: "",
    name: "",
    phone: "",
    region: "",
    samplePhoto: "",
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim()) {
        return "Please enter your name.";
      }

      if (normalizePhoneNumber(form.phone).length !== 10) {
        return "Please enter a valid 10-digit WhatsApp number.";
      }
    }

    if (step === 2 && !form.craftType) {
      return "Please choose your craft type.";
    }

    if (step === 3 && !form.region) {
      return "Please choose your state or union territory.";
    }

    return "";
  };

  const handleNext = () => {
    const nextError = validateStep();

    if (nextError) {
      setError(nextError);
      return;
    }

    setStep((current) => Math.min(current + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setError("");
    setStep((current) => Math.max(current - 1, 1));
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const compressedPhoto = await compressImageFile(file, {
        maxHeight: 900,
        maxWidth: 900,
      });
      updateField("samplePhoto", compressedPhoto);
    } catch {
      setError("Photo upload failed. Please try again.");
    }
  };

  const handleSubmit = async () => {
    const nextError = validateStep();

    if (nextError) {
      setError(nextError);
      return;
    }

    setIsSaving(true);

    try {
      if (!user?.id) {
        throw new Error("You must be logged in to complete onboarding.");
      }

      // Generate store slug
      const slug = form.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      if (slug.length < 3) {
        toast({
          title: "Store name too short",
          description: "Minimum 3 characters",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Check slug uniqueness
      const { data: existing } = await supabase
        .from("profiles")
        .select("clerk_user_id")
        .eq("store_slug", slug)
        .neq("clerk_user_id", user.id)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Store name taken",
          description: "Please choose a different name",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      await apiRequest("/auth/become-artisan", { method: "POST" });

      // Refresh Clerk before any Supabase writes so the session picks up the new artisan role.
      await refreshUser?.();

      // Save onboarding details after Clerk role metadata is synced by the backend.
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: form.name.trim(),
          name: form.name.trim(),
          phone: normalizePhoneNumber(form.phone),
          craft_type: form.craftType,
          region: form.region,
          artisan_status: "pending",
          store_slug: slug,
          store_setup: true,
          profile_photo: form.samplePhoto || null,
          updated_at: new Date().toISOString(),
        })
        .eq("clerk_user_id", user.id);

      if (updateError) throw updateError;

      const { error: storeError } = await supabase.from("stores").upsert({
        artisan_id: user.id,
        name: form.name.trim(),
        slug,
        description: `${form.craftType} artisan from ${form.region}`,
        status: "pending",
      }, { onConflict: "artisan_id" });

      if (storeError && storeError.code !== "42P01") {
        throw storeError;
      }

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete({
          craftType: form.craftType,
          name: form.name.trim(),
          phone: form.phone,
          region: form.region,
          samplePhoto: form.samplePhoto || "",
          store_slug: slug,
          store_setup: true,
        });
      }

      toast({
        title: "ðŸŽ‰ Store created!",
        description: "Welcome to AI Artisan",
      });

      navigate("/artisan/dashboard");
    } catch (err) {
      toast({
        title: "Failed to save",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-[2rem] border border-primary/10 bg-white/95 p-6 shadow-xl shadow-primary/10 sm:p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Artisan Onboarding
          </p>
          <h1 className="text-3xl font-bold text-foreground">Welcome to AI Artisan</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Just 4 short steps. Then your dashboard, design tools, and storefront are ready.
          </p>
        </div>
        <div className="rounded-2xl bg-muted px-4 py-3 text-right">
          <p className="text-xs text-muted-foreground">Step</p>
          <p className="text-lg font-semibold">
            {step}/{TOTAL_STEPS}
          </p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-4 gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, index) => {
          const itemStep = index + 1;
          const isActive = itemStep === step;
          const isComplete = itemStep < step;

          return (
            <div
              key={itemStep}
              className={`h-2 rounded-full transition-colors ${
                isComplete || isActive ? "bg-primary" : "bg-muted"
              }`}
            />
          );
        })}
      </div>

      {step === 1 ? (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Your name</label>
            <Input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Example: Sita Devi"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">WhatsApp number</label>
            <Input
              inputMode="numeric"
              maxLength={10}
              pattern="[0-9]*"
              placeholder="10-digit number"
              value={form.phone}
              onChange={(event) =>
                updateField("phone", event.target.value.replace(/\D/g, "").slice(0, 10))
              }
            />
          </div>
          <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
            We use this number for identity verification and WhatsApp orders.
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">What craft do you work in?</h2>
            <p className="text-sm text-muted-foreground">Choose from the large icon tiles below.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ONBOARDING_CRAFT_TYPES.map((craft) => {
              const selected = form.craftType === craft.value;

              return (
                <button
                  key={craft.value}
                  type="button"
                  onClick={() => updateField("craftType", craft.value)}
                  className={`rounded-3xl border p-4 text-center transition-all ${
                    selected
                      ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  <div className="text-3xl">{craft.emoji}</div>
                  <p className="mt-3 text-sm font-medium">{craft.label}</p>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Which state are you from?</h2>
            <p className="text-sm text-muted-foreground">This helps tailor your storefront and learning content.</p>
          </div>
          <Select value={form.region} onValueChange={(value) => updateField("region", value)}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Choose your state / UT" />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_STATES_AND_UTS.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold">Add a photo of one of your products</h2>
            <p className="text-sm text-muted-foreground">Optional. Camera capture is enabled for mobile.</p>
          </div>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-primary/30 bg-primary/5 px-6 py-10 text-center">
            <Camera className="mb-3 h-10 w-10 text-primary" />
            <span className="font-medium">Upload a photo</span>
            <span className="mt-1 text-sm text-muted-foreground">Tap to open your camera or gallery</span>
            <input
              accept="image/*"
              capture="environment"
              className="sr-only"
              type="file"
              onChange={handlePhotoChange}
            />
          </label>
          {form.samplePhoto ? (
            <div className="overflow-hidden rounded-[1.5rem] border">
              <img
                alt="Uploaded artisan sample"
                className="h-64 w-full object-cover"
                src={form.samplePhoto}
              />
            </div>
          ) : (
            <Textarea
              disabled
              value="You can skip this for now. You can add products later from the dashboard."
            />
          )}
        </div>
      ) : null}

      {error ? <p className="mt-6 text-sm font-medium text-destructive">{error}</p> : null}

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={handleBack} disabled={step === 1 || isSaving} className="min-h-[48px]">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {step < TOTAL_STEPS ? (
          <Button type="button" onClick={handleNext} className="min-h-[48px]">
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={isSaving} className="min-h-[48px] w-full sm:w-auto">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Launch My Store"}
          </Button>
        )}
      </div>
    </div>
  );
}

