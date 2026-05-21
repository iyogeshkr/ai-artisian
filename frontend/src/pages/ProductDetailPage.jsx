import { ArrowLeft, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/config/supabase";
import { logError } from "@/utils/logger";

export default function ProductDetailPage() {
  const { id = "" } = useParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        const { data, error: productError } = await supabase
          .from("products")
          .select("id, name, description, price, image_url, category, region, artisan_name, store_id, created_at")
          .eq("id", id)
          .eq("status", "active")
          .maybeSingle();

        if (productError) {
          throw productError;
        }

        if (isMounted) {
          setProduct(data || null);
          setError(data ? "" : "This product is not available.");
        }
      } catch (loadError) {
        logError("Public product failed to load", loadError, { productId: id });
        if (isMounted) {
          setProduct(null);
          setError(loadError.message || "Product could not load.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,_#fff8f1,_#ffffff)] px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="h-[34rem] animate-pulse rounded-[2rem] bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#fff9f2,_#ffffff)] px-4">
        <div className="max-w-md rounded-[2rem] border bg-card p-8 text-center shadow-lg">
          <h1 className="text-3xl font-bold">Product unavailable</h1>
          <p className="mt-3 text-base text-muted-foreground">{error || "This product could not be found."}</p>
          <Button asChild className="mt-6">
            <Link to="/e-commerce">Browse marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  const orderText = `Hi, I want to order ${product.name} for Rs. ${product.price}`;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fff8f1,_#ffffff)] px-4 py-8 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-5xl">
        <Button variant="outline" asChild>
          <Link to="/e-commerce">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Marketplace
          </Link>
        </Button>

        <section className="mt-6 grid overflow-hidden rounded-[2rem] border bg-card shadow-sm lg:grid-cols-[1fr_1fr]">
          <img alt={product.name} className="h-full min-h-[24rem] w-full object-cover" src={product.image_url} />
          <div className="p-6 sm:p-8">
            <p className="text-base font-medium text-primary">{product.category || "Handmade"}</p>
            <h1 className="mt-3 text-4xl font-bold">{product.name}</h1>
            <p className="mt-3 text-base text-muted-foreground">{product.description}</p>
            <p className="mt-6 text-3xl font-bold text-primary">Rs. {product.price}</p>
            {product.artisan_name ? (
              <p className="mt-3 text-base text-muted-foreground">By {product.artisan_name}</p>
            ) : null}
            <Button className="mt-8 w-full sm:w-auto" asChild>
              <a href={`https://wa.me/?text=${encodeURIComponent(orderText)}`} rel="noreferrer" target="_blank">
                <MessageCircle className="mr-2 h-4 w-4" />
                Order via WhatsApp
              </a>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
