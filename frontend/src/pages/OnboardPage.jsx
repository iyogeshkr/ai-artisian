import { Navigate } from "react-router-dom";
import OnboardingWizard from "@/components/artisan/OnboardingWizard";
import { useArtisan } from "@/context/ArtisanContext";

export default function OnboardPage() {
  const { isOnboarded, updateProfile } = useArtisan();

  if (isOnboarded) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_35%),linear-gradient(180deg,_#fff8f1,_#fff)] px-4 py-8 sm:px-6">
      <OnboardingWizard onComplete={updateProfile} />
    </div>
  );
}
