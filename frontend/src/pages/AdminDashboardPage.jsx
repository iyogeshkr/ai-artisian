import { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, Store, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/config/supabase";

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [artisans, setArtisans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    const [{ data: artisanRows, error: artisanError }, { data: productRows, error: productError }] = await Promise.all([
      supabase
        .from("profiles")
        .select("clerk_user_id, full_name, name, email, role, artisan_status, store_setup, created_at, stores(id, name, slug, status)")
        .eq("role", "artisan")
        .order("created_at", { ascending: false }),
      supabase
        .from("products")
        .select("id, name, price, status, created_at, artisan_id, profiles(full_name, name, email)")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    if (artisanError || productError) {
      toast({ title: "Could not load admin data", description: artisanError?.message || productError?.message, variant: "destructive" });
    }

    setArtisans(artisanRows || []);
    setProducts(productRows || []);
    setLoading(false);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const updateArtisanStatus = async (artisanId, status) => {
    const { error } = await supabase
      .from("profiles")
      .update({ artisan_status: status })
      .eq("clerk_user_id", artisanId)
      .eq("role", "artisan");

    if (error) {
      toast({ title: "Status update failed", description: error.message, variant: "destructive" });
      return;
    }

    await supabase.from("stores").update({ status: status === "approved" ? "active" : status }).eq("artisan_id", artisanId);
    setArtisans((current) => current.map((artisan) => (artisan.clerk_user_id === artisanId ? { ...artisan, artisan_status: status } : artisan)));
    toast({ title: "Artisan updated", description: `Status changed to ${status}.` });
  };

  const updateProductStatus = async (productId, status) => {
    const { error } = await supabase.from("products").update({ status }).eq("id", productId);
    if (error) {
      toast({ title: "Product update failed", description: error.message, variant: "destructive" });
      return;
    }
    setProducts((current) => current.map((product) => (product.id === productId ? { ...product, status } : product)));
  };

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-primary"><ShieldCheck className="h-4 w-4" /> Admin</p>
            <h1 className="text-3xl font-bold">Platform dashboard</h1>
          </div>
          <Button variant="outline" onClick={loadAdminData} disabled={loading}>{loading ? "Refreshing..." : "Refresh"}</Button>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">Artisans</p><p className="mt-1 text-3xl font-bold">{artisans.length}</p></div>
          <div className="rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">Pending artisans</p><p className="mt-1 text-3xl font-bold">{artisans.filter((item) => item.artisan_status === "pending").length}</p></div>
          <div className="rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">Products</p><p className="mt-1 text-3xl font-bold">{products.length}</p></div>
        </section>

        <section className="rounded-xl border bg-card">
          <div className="border-b p-4"><h2 className="flex items-center gap-2 text-xl font-semibold"><Store className="h-5 w-5" /> Artisan approvals</h2></div>
          <div className="divide-y">
            {artisans.map((artisan) => (
              <div key={artisan.clerk_user_id || artisan.id} className="grid gap-3 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="font-semibold">{artisan.full_name || artisan.name || "Unnamed artisan"}</p>
                  <p className="text-sm text-muted-foreground">{artisan.email}</p>
                  <p className="mt-1 text-sm">Status: <span className="font-medium capitalize">{artisan.artisan_status || "pending"}</span></p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateArtisanStatus(artisan.clerk_user_id || artisan.id, "approved")}><CheckCircle2 className="mr-2 h-4 w-4" />Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => updateArtisanStatus(artisan.clerk_user_id || artisan.id, "rejected")}><XCircle className="mr-2 h-4 w-4" />Reject</Button>
                </div>
              </div>
            ))}
            {!loading && artisans.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No artisans yet.</p> : null}
          </div>
        </section>

        <section className="rounded-xl border bg-card">
          <div className="border-b p-4"><h2 className="text-xl font-semibold">Product moderation</h2></div>
          <div className="divide-y">
            {products.map((product) => (
              <div key={product.id} className="grid gap-3 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-muted-foreground">By {product.profiles?.full_name || product.profiles?.name || product.profiles?.email || "Unknown"} · Rs. {product.price}</p>
                  <p className="mt-1 text-sm">Status: <span className="font-medium capitalize">{product.status}</span></p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => updateProductStatus(product.id, "active")}>Publish</Button>
                  <Button size="sm" variant="outline" onClick={() => updateProductStatus(product.id, "rejected")}>Reject</Button>
                </div>
              </div>
            ))}
            {!loading && products.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No products yet.</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
