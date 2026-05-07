import { Navigate, useNavigate } from "react-router-dom";
import MobileBottomNav from "@/components/artisan/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { useArtisan } from "@/context/ArtisanContext";
import { useProducts } from "@/context/ProductContext";
import { shareProduct } from "@/utils/share";

export default function ProductsPage() {
  const navigate = useNavigate();
  const { isOnboarded, profile } = useArtisan();
  const { deleteProduct, products } = useProducts();

  if (!isOnboarded) {
    return <Navigate to="/artisan/onboarding" replace />;
  }

  const storefrontUrl = `${window.location.origin}/store/${profile.storefrontId}`;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fffaf4,_#fff)] pb-24">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-bold">My Products</h1>
            <p className="mt-2 text-base text-muted-foreground">à¤…à¤ªà¤¨à¥€ product listings à¤¸à¤‚à¤­à¤¾à¤²à¥‡à¤‚</p>
          </div>
          <Button onClick={() => navigate("/products/add")}>Add Product</Button>
        </div>

        {products.length === 0 ? (
          <div className="mt-6 rounded-[2rem] border bg-card p-8 text-center text-base text-muted-foreground">
            à¤…à¤­à¥€ à¤•à¥‹à¤ˆ product à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {products.map((product) => (
              <article key={product.id} className="overflow-hidden rounded-[1.5rem] border bg-card">
                <img alt={product.name} className="h-64 w-full object-cover" src={product.photo} />
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold">{product.name}</h2>
                      <p className="text-base text-muted-foreground">{product.description}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-base font-semibold text-primary">
                      â‚¹{product.price}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        shareProduct({
                          product,
                          shareUrl: `${storefrontUrl}#product-${product.id}`,
                          storefrontUrl,
                        })
                      }
                    >
                      Share
                    </Button>
                    <Button variant="outline" onClick={() => deleteProduct(product.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <MobileBottomNav />
    </div>
  );
}

