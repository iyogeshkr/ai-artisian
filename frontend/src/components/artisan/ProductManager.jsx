// Not routed — connect to /products route when ready
import { useEffect, useMemo, useState } from "react";
import { ImagePlus, PackagePlus, Share2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  buildStorefrontUrl,
  clearSelectedDesign,
  getArtisanProducts,
  getSelectedDesign,
  saveArtisanProducts,
} from "@/utils/artisanStorage";
import { compressImageFile } from "@/utils/imageProcessing";
import { shareProduct } from "@/utils/share";

const FREE_TIER_LIMIT = 20;

export default function ProductManager({ profile, onProductsChange }) {
  const [products, setProducts] = useState([]);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [form, setForm] = useState({
    description: "",
    name: "",
    photo: "",
    price: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const savedProducts = getArtisanProducts();
    setProducts(savedProducts);
    onProductsChange?.(savedProducts);
    setSelectedDesign(getSelectedDesign());
  }, [onProductsChange]);

  const storefrontUrl = useMemo(
    () => buildStorefrontUrl(profile.storefrontId),
    [profile.storefrontId],
  );

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
  };

  const persistProducts = (nextProducts) => {
    setProducts(nextProducts);
    saveArtisanProducts(nextProducts);
    onProductsChange?.(nextProducts);
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const compressedPhoto = await compressImageFile(file, {
        maxHeight: 1200,
        maxWidth: 1200,
      });
      updateField("photo", compressedPhoto);
    } catch {
      setError("प्रोडक्ट फोटो पढ़ी नहीं जा सकी।");
    }
  };

  const handleAddProduct = () => {
    if (products.length >= FREE_TIER_LIMIT) {
      setError("फ्री प्लान में 20 प्रोडक्ट तक जोड़े जा सकते हैं।");
      return;
    }

    if (!form.name.trim() || !form.price.trim() || !form.description.trim() || !form.photo) {
      setError("नाम, कीमत, विवरण और फोटो भरना जरूरी है।");
      return;
    }

    const nextProducts = [
      {
        artisanName: profile.name,
        craftType: profile.craftType,
        description: form.description.trim(),
        id: `${Date.now()}`,
        name: form.name.trim(),
        phone: profile.phone,
        photo: form.photo,
        price: Number(form.price),
        storefrontId: profile.storefrontId,
      },
      ...products,
    ];

    persistProducts(nextProducts);
    setForm({
      description: "",
      name: "",
      photo: "",
      price: "",
    });
    setError("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <PackagePlus className="h-3.5 w-3.5" />
              Product Listing
            </p>
            <h2 className="mt-2 text-2xl font-bold">अपने प्रोडक्ट जोड़ें</h2>
          </div>
          <div className="rounded-2xl bg-muted px-4 py-3 text-sm">
            <p className="text-muted-foreground">Free tier limit</p>
            <p className="font-semibold">
              {products.length}/{FREE_TIER_LIMIT}
            </p>
          </div>
        </div>

        {selectedDesign ? (
          <div className="mt-5 flex flex-col gap-4 rounded-[1.5rem] border border-primary/15 bg-primary/5 p-4 sm:flex-row sm:items-center">
            <img
              alt="Selected AI design"
              className="h-28 w-full rounded-2xl object-cover sm:w-28"
              src={selectedDesign.imageUrl}
            />
            <div className="flex-1">
              <p className="font-semibold">Selected design तैयार है</p>
              <p className="text-sm text-muted-foreground">{selectedDesign.description}</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => updateField("photo", selectedDesign.imageUrl)}>
                Use Design
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  clearSelectedDesign();
                  setSelectedDesign(null);
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          <Input
            placeholder="प्रोडक्ट का नाम"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
          <Input
            inputMode="decimal"
            min="0"
            placeholder="कीमत (₹)"
            type="number"
            value={form.price}
            onChange={(event) => updateField("price", event.target.value)}
          />
          <Textarea
            placeholder="प्रोडक्ट का छोटा विवरण"
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
          />
          <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-5 text-sm font-medium text-primary">
            <ImagePlus className="h-4 w-4" />
            फोटो अपलोड करें
            <input
              accept="image/*"
              capture="environment"
              className="sr-only"
              type="file"
              onChange={handlePhotoChange}
            />
          </label>
          {form.photo ? (
            <img
              alt="Product preview"
              className="h-56 w-full rounded-[1.5rem] object-cover"
              src={form.photo}
            />
          ) : null}
          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          <Button type="button" onClick={handleAddProduct} disabled={products.length >= FREE_TIER_LIMIT}>
            <PackagePlus className="mr-2 h-4 w-4" />
            प्रोडक्ट सेव करें
          </Button>
        </div>
      </div>

      <div className="rounded-[2rem] border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold">My Products</h3>
            <p className="text-sm text-muted-foreground">Storefront पर दिखने वाले products</p>
          </div>
          <a
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium hover:bg-muted"
            href={storefrontUrl}
            rel="noreferrer"
            target="_blank"
          >
            <Store className="h-4 w-4" />
            Open Store
          </a>
        </div>

        {products.length === 0 ? (
          <div className="rounded-[1.5rem] bg-muted/60 p-8 text-center text-sm text-muted-foreground">
            अभी तक कोई प्रोडक्ट नहीं जोड़ा गया है।
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {products.map((product) => (
              <article key={product.id} className="overflow-hidden rounded-[1.5rem] border">
                <img alt={product.name} className="h-56 w-full object-cover" src={product.photo} />
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                      ₹{product.price}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      shareProduct({
                        product,
                        shareUrl: `${storefrontUrl}#product-${product.id}`,
                        storefrontUrl,
                      })
                    }
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
