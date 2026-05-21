import { MessageCircle, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/config/supabase";
import { logError } from "@/utils/logger";

const PAGE_SIZE = 24;

export default function StorefrontPage() {
  const { id = "" } = useParams();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [store, setStore] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadStorefront() {
      setLoading(true);
      setError("");

      try {
        const { data: storeRow, error: storeError } = await supabase
          .from("stores")
          .select("id, artisan_id, name, slug, description, status")
          .eq("slug", id)
          .eq("status", "active")
          .maybeSingle();

        if (storeError) {
          throw storeError;
        }

        if (!storeRow) {
          if (isMounted) {
            setStore(null);
            setProducts([]);
            setError("This storefront is not available yet.");
          }
          return;
        }

        const { data: productRows, error: productsError } = await supabase
          .from("products")
          .select("id, name, description, price, image_url, category, region, artisan_name, created_at")
          .eq("artisan_id", storeRow.artisan_id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .range(0, PAGE_SIZE - 1);

        if (productsError) {
          throw productsError;
        }

        if (isMounted) {
          setStore(storeRow);
          setProducts(productRows || []);
        }
      } catch (loadError) {
        logError("Public storefront failed to load", loadError, { slug: id });
        if (isMounted) {
          setStore(null);
          setProducts([]);
          setError(loadError.message || "Storefront could not load.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadStorefront();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,_#fff8f1,_#ffffff)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="h-40 animate-pulse rounded-[2rem] bg-muted" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-96 animate-pulse rounded-[1.75rem] bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#fff9f2,_#ffffff)] px-4">
        <div className="max-w-md rounded-[2rem] border bg-card p-8 text-center shadow-lg">
          <h1 className="text-3xl font-bold">Storefront unavailable</h1>
          <p className="mt-3 text-base text-muted-foreground">{error || "This store could not be found."}</p>
          <Button asChild className="mt-6">
            <Link to="/e-commerce">Browse marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fff8f1,_#ffffff)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-[2rem] border bg-white p-6 shadow-sm sm:p-8">
          <p className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-base font-semibold text-primary">
            <Store className="h-4 w-4" />
            AI Artisan Store
          </p>
          <h1 className="mt-3 text-4xl font-bold">{store.name}</h1>
          {store.description ? (
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">{store.description}</p>
          ) : null}
        </header>

        <section className="mt-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Products</h2>
              <p className="text-base text-muted-foreground">{products.length} handcrafted items</p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="rounded-[2rem] border bg-card p-8 text-center text-base text-muted-foreground">
              No products are available in this store yet.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const orderText = `Hi, I want to order ${product.name} for Rs. ${product.price}`;
                const whatsappLink = `https://wa.me/?text=${encodeURIComponent(orderText)}`;

                return (
                  <article
                    key={product.id}
                    id={`product-${product.id}`}
                    className="overflow-hidden rounded-[1.75rem] border bg-card shadow-sm"
                  >
                    <img alt={product.name} className="h-64 w-full object-cover" src={product.image_url} />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold">{product.name}</h3>
                          <p className="mt-2 text-base text-muted-foreground">{product.description}</p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-base font-semibold text-primary">
                          Rs. {product.price}
                        </span>
                      </div>
                      <div className="mt-5 flex gap-2">
                        <Button className="flex-1" asChild>
                          <a href={whatsappLink} rel="noreferrer" target="_blank">
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Order
                          </a>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link to={`/product/${product.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
