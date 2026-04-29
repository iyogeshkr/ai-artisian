import { useState } from "react";
import { Camera, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ONBOARDING_CRAFT_TYPES, INDIAN_STATES_AND_UTS } from "@/data/artisanData";
import { compressImageFile } from "@/utils/imageProcessing";

const TOTAL_STEPS = 4;

function normalizePhoneNumber(phoneNumber = "") {
  return phoneNumber.replace(/\D/g, "").slice(-10);
}

export default function OnboardingWizard({ onComplete }) {
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
        return "अपना नाम भरें।";
      }

      if (normalizePhoneNumber(form.phone).length !== 10) {
        return "10 अंकों का WhatsApp नंबर दर्ज करें।";
      }
    }

    if (step === 2 && !form.craftType) {
      return "अपना craft चुनें।";
    }

    if (step === 3 && !form.region) {
      return "अपना राज्य या केंद्र शासित प्रदेश चुनें।";
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
      setError("फोटो अपलोड नहीं हो सकी। कृपया फिर से कोशिश करें।");
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
      const profile = {
        craftType: form.craftType,
        name: form.name.trim(),
        phone: form.phone,
        region: form.region,
        samplePhoto: form.samplePhoto || "",
      };

      onComplete?.(profile);
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
          <h1 className="text-3xl font-bold text-foreground">AI Artisan में स्वागत है</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            बस 4 छोटे कदम. फिर आपका dashboard, design tools और storefront तैयार।
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
            <label className="mb-2 block text-sm font-medium">आपका नाम</label>
            <Input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="जैसे: Sita Devi"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">WhatsApp नंबर</label>
            <Input
              inputMode="numeric"
              maxLength={10}
              pattern="[0-9]*"
              placeholder="10 अंकों का नंबर"
              value={form.phone}
              onChange={(event) =>
                updateField("phone", event.target.value.replace(/\D/g, "").slice(0, 10))
              }
            />
          </div>
          <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
            यही नंबर आपकी पहचान और WhatsApp orders के लिए इस्तेमाल होगा।
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">आप किस craft में काम करते हैं?</h2>
            <p className="text-sm text-muted-foreground">मोबाइल पर बड़े icon tiles से चुनें।</p>
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
            <h2 className="text-lg font-semibold">आप किस राज्य से हैं?</h2>
            <p className="text-sm text-muted-foreground">इससे storefront और सीखने की सामग्री बेहतर होगी।</p>
          </div>
          <Select value={form.region} onValueChange={(value) => updateField("region", value)}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="राज्य / UT चुनें" />
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
            <h2 className="text-lg font-semibold">अपने मौजूदा प्रोडक्ट की फोटो जोड़ें</h2>
            <p className="text-sm text-muted-foreground">यह वैकल्पिक है. कैमरा capture मोबाइल पर प्राथमिक रहेगा।</p>
          </div>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-primary/30 bg-primary/5 px-6 py-10 text-center">
            <Camera className="mb-3 h-10 w-10 text-primary" />
            <span className="font-medium">फोटो अपलोड करें</span>
            <span className="mt-1 text-sm text-muted-foreground">Tap करके कैमरा या gallery खोलें</span>
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
              value="फोटो अभी न जोड़ें तो भी चलेगा. आप बाद में dashboard से भी products जोड़ सकते हैं।"
            />
          )}
        </div>
      ) : null}

      {error ? <p className="mt-6 text-sm font-medium text-destructive">{error}</p> : null}

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={handleBack} disabled={step === 1 || isSaving}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          पिछला
        </Button>

        {step < TOTAL_STEPS ? (
          <Button type="button" onClick={handleNext}>
            अगला
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={isSaving}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {isSaving ? "सेव हो रहा है..." : "Dashboard खोलें"}
          </Button>
        )}
      </div>
    </div>
  );
}
