import { Navigate } from "react-router-dom";
import LearningCarousel from "@/components/artisan/LearningCarousel";
import MobileBottomNav from "@/components/artisan/MobileBottomNav";
import { useArtisan } from "@/context/ArtisanContext";
import { pingAnalytics } from "@/utils/analytics";
import { useEffect } from "react";

export default function LearnPage() {
  const { isOnboarded, profile } = useArtisan();

  useEffect(() => {
    if (profile) {
      pingAnalytics("/learn", profile.phone);
    }
  }, [profile]);

  if (!isOnboarded) {
    return <Navigate to="/artisan/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fff9f2,_#ffffff)] px-4 py-4 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <LearningCarousel fullScreen />
      </div>
      <MobileBottomNav />
    </div>
  );
}

