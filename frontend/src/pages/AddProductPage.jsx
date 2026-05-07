import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useArtisan } from "@/context/ArtisanContext";
import { useDesigns } from "@/context/DesignContext";
import { useProducts } from "@/context/ProductContext";
import { compressImageFile } from "@/utils/imageProcessing";

export default function AddProductPage() {
  const navigate = useNavigate();
  const { isOnboarded } = useArtisan();
  const { selectedDesign } = useDesigns();
  const { addProduct, products } = useProducts();
  const [form, setForm] = useState({
    description: "",
    name: "",
    photo: selectedDesign?.imageUrl || "",
    price: "",
  });
  const [error, setError] = useState("");

  if (!isOnboarded) {
    return <Navigate to="/artisan/onboarding" replace />;
  }

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
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
      setError("Photo couldn't load, try again.");
    }
  };

  const handleSubmit = () => {
    if (products.length >= 20) {
      setError("Free tier limit reached. You can add up to 20 products.");
      return;
    }

    if (!form.name.trim() || !form.price || !form.description.trim() || !form.photo) {
      setError("Please fill every product field before saving.");
      return;
    }

    addProduct({
      description: form.description.trim(),
      name: form.name.trim(),
      photo: form.photo,
      price: Number(form.price),
    });
    navigate("/products");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fffaf4,_#fff)]">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border bg-card p-6 shadow-sm">
          <h1 className="text-4xl font-bold">Add Product</h1>
          <p className="mt-2 text-base text-muted-foreground">à¤…à¤ªà¤¨à¤¾ product storefront à¤®à¥‡à¤‚ à¤œà¥‹à¤¡à¤¼à¥‡à¤‚</p>
          <div className="mt-6 grid gap-4">
            <div>
              <label className="mb-2 block text-base font-medium">Product name</label>
              <Input value={form.name} onChange={(event) => updateField("name", event.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-base font-medium">Price (â‚¹)</label>
              <Input type="number" value={form.price} onChange={(event) => updateField("price", event.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-base font-medium">Description</label>
              <Textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-base font-medium">Photo</label>
              <label className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-dashed px-4 py-4 text-base font-medium text-primary">
                Upload product photo
                <input accept="image/*" capture="environment" className="sr-only" type="file" onChange={handlePhotoChange} />
              </label>
            </div>
            {form.photo ? (
              <img alt="Product preview" className="h-72 w-full rounded-[1.5rem] object-cover" src={form.photo} />
            ) : null}
            {error ? <p className="text-base font-medium text-destructive">{error}</p> : null}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/products")}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Save Product</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

