import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import CartSidebar from "@/components/CartSidebar";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ArtisanProvider } from "@/context/ArtisanContext";
import { ProductProvider } from "@/context/ProductContext";
import { DesignProvider } from "@/context/DesignContext";
import { DashboardRedirect, ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const HomePage = lazy(() => import("@/pages/HomePage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const SignupPage = lazy(() => import("@/pages/SignupPage"));
const OnboardPage = lazy(() => import("@/pages/OnboardPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const AdminDashboardPage = lazy(() => import("@/pages/AdminDashboardPage"));
const DesignGeneratorPage = lazy(() => import("@/pages/DesignGeneratorPage"));
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const AddProductPage = lazy(() => import("@/pages/AddProductPage"));
const ProductDetailPage = lazy(() => import("@/pages/ProductDetailPage"));
const LearnPage = lazy(() => import("@/pages/LearnPage"));
const StorefrontPage = lazy(() => import("@/pages/StorefrontPage"));
const EcommercePage = lazy(() => import("@/pages/EcommercePage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="w-full max-w-xl space-y-4">
        <div className="h-12 animate-pulse rounded-xl bg-muted" />
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}

function AppShell() {
  const location = useLocation();
  const isArtisanAppRoute =
    location.pathname.startsWith("/artisan") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/design") ||
    location.pathname.startsWith("/products") ||
    location.pathname.startsWith("/learn") ||
    location.pathname.startsWith("/store/");

  return (
    <div className="min-h-screen flex flex-col">
      {isArtisanAppRoute ? null : <Navbar />}
      <ScrollToTop />
      <main className="flex-grow">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/onboard" element={<Navigate to="/artisan/onboarding" replace />} />
            <Route path="/artisan/onboarding" element={<ProtectedRoute roles={["user", "artisan"]}><OnboardPage /></ProtectedRoute>} />
            <Route path="/artisan/dashboard" element={<ProtectedRoute roles="artisan" requireOnboarded><ErrorBoundary><DashboardPage /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles="admin"><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/design" element={<ProtectedRoute roles={["user", "artisan"]}><ErrorBoundary><DesignGeneratorPage /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute roles="artisan" requireOnboarded><ProductsPage /></ProtectedRoute>} />
            <Route path="/products/add" element={<ProtectedRoute roles="artisan" requireOnboarded><AddProductPage /></ProtectedRoute>} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/e-commerce" element={<EcommercePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/store/:id" element={<StorefrontPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      {isArtisanAppRoute ? null : <Footer />}
      {isArtisanAppRoute ? null : <CartSidebar />}
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ArtisanProvider>
        <ProductProvider>
          <DesignProvider>
            <CartProvider>
              <AppShell />
            </CartProvider>
          </DesignProvider>
        </ProductProvider>
      </ArtisanProvider>
    </AuthProvider>
  );
}

export default App;
