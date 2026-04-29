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
import { ErrorBoundary } from "@/components/ErrorBoundary";

const HomePage = lazy(() => import("@/pages/HomePage"));
const OnboardPage = lazy(() => import("@/pages/OnboardPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const DesignGeneratorPage = lazy(() => import("@/pages/DesignGeneratorPage"));
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const AddProductPage = lazy(() => import("@/pages/AddProductPage"));
const LearnPage = lazy(() => import("@/pages/LearnPage"));
const StorefrontPage = lazy(() => import("@/pages/StorefrontPage"));
const EcommercePage = lazy(() => import("@/pages/EcommercePage"));

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="w-full max-w-xl space-y-4">
        <div className="h-12 animate-pulse rounded-2xl bg-muted" />
        <div className="h-48 animate-pulse rounded-[2rem] bg-muted" />
        <div className="h-48 animate-pulse rounded-[2rem] bg-muted" />
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();
  const isArtisanAppRoute =
    location.pathname.startsWith("/onboard") ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/design") ||
    location.pathname.startsWith("/products") ||
    location.pathname.startsWith("/learn") ||
    location.pathname.startsWith("/store/");

  return (
    <AuthProvider>
      <ArtisanProvider>
        <ProductProvider>
          <DesignProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col">
                {isArtisanAppRoute ? null : <Navbar />}
                <ScrollToTop />
                <main className="flex-grow">
                  <Suspense fallback={<RouteFallback />}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/onboard" element={<OnboardPage />} />
                      <Route
                        path="/dashboard"
                        element={
                          <ErrorBoundary>
                            <DashboardPage />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/design"
                        element={
                          <ErrorBoundary>
                            <DesignGeneratorPage />
                          </ErrorBoundary>
                        }
                      />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/products/add" element={<AddProductPage />} />
                      <Route path="/e-commerce" element={<EcommercePage />} />
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
            </CartProvider>
          </DesignProvider>
        </ProductProvider>
      </ArtisanProvider>
    </AuthProvider>
  );
}

export default App;
