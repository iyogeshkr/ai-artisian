import { MessageCircle, Store } from "lucide-react";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useArtisan } from "@/context/ArtisanContext";
import { useProducts } from "@/context/ProductContext";

export default function StorefrontPage() {
  const { id = "" } = useParams();
  const { profile } = useArtisan();
  const { products } = useProducts();
  const storefrontProducts = useMemo(
    () => products.filter((product) => product.storefrontId === id),
    [id, products],
  );

  if (!profile || profile.storefrontId !== id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#fff9f2,_#ffffff)] px-4">
        <div className="max-w-md rounded-[2rem] border bg-card p-8 text-center shadow-lg">
          <h1 className="text-3xl font-bold">Storefront unavailable</h1>
          <p className="mt-3 text-base text-muted-foreground">
            इस browser में इस storefront का data उपलब्ध नहीं है।
          </p>
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
          <h1 className="mt-3 text-4xl font-bold">{profile.name}</h1>
          <div className="mt-4 flex flex-wrap gap-3 text-base">
            <span className="rounded-full bg-muted px-4 py-2 capitalize">{profile.craftType}</span>
            <span className="rounded-full bg-muted px-4 py-2">{profile.region}</span>
          </div>
        </header>

        <section className="mt-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Products</h2>
              <p className="text-base text-muted-foreground">{storefrontProducts.length} handcrafted items</p>
            </div>
          </div>

          {storefrontProducts.length === 0 ? (
            <div className="rounded-[2rem] border bg-card p-8 text-center text-base text-muted-foreground">
              अभी कोई product उपलब्ध नहीं है।
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {storefrontProducts.map((product) => {
                const whatsappLink = `https://wa.me/91${profile.phone}?text=${encodeURIComponent(
                  `Hi, I want to order ${product.name} for ₹${product.price}`,
                )}`;

                return (
                  <article
                    key={product.id}
                    id={`product-${product.id}`}
                    className="overflow-hidden rounded-[1.75rem] border bg-card shadow-sm"
                  >
                    <img alt={product.name} className="h-64 w-full object-cover" src={product.photo} />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold">{product.name}</h3>
                          <p className="mt-2 text-base text-muted-foreground">{product.description}</p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-base font-semibold text-primary">
                          ₹{product.price}
                        </span>
                      </div>
                      <Button className="mt-5 w-full" asChild>
                        <a href={whatsappLink} rel="noreferrer" target="_blank">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Order via WhatsApp
                        </a>
                      </Button>
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
