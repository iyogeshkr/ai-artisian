import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/AuthContext";
import { useArtisan } from "@/context/ArtisanContext";
import { toast } from "@/components/ui/use-toast";
import { logError, logInfo } from "@/utils/logger";
import { uploadProductImage } from "@/utils/storage";

const ProductContext = createContext(null);

function mapProductFromDb(row, storefrontId) {
  return {
    ...row,
    artisanName: row.artisan_name,
    photo: row.image_url,
    storefrontId: storefrontId || "0000",
  };
}

export function ProductProvider({ children }) {
  const { user } = useAuth();
  const { profile: artisanProfile } = useArtisan();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mutationLoading, setMutationLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      if (!user?.id) {
        if (isMounted) {
          setProducts([]);
          setLoading(false);
          setError("");
        }
        return;
      }

      setLoading(true);
      setError("");
      let data = [];
      let fetchError = null;

      try {
        const result = await supabase
          .from("products")
          .select("*")
          .eq("artisan_id", user.id)
          .order("created_at", { ascending: false });
        data = result.data;
        fetchError = result.error;
      } catch (loadError) {
        fetchError = loadError;
      }

      if (!isMounted) {
        return;
      }

      if (fetchError) {
        setProducts([]);
        setError(fetchError.message);
        logError("Products failed to load", fetchError, { artisanId: user.id });
      } else {
        setProducts((data || []).map((row) => mapProductFromDb(row, artisanProfile?.storefrontId)));
      }

      setLoading(false);
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [artisanProfile?.storefrontId, user?.id]);

  const value = useMemo(
    () => ({
      async addProduct(productData) {
        if (!user?.id) {
          return { success: false, error: "You must be logged in to add products." };
        }

        if (mutationLoading) {
          return { success: false, error: "A product save is already in progress." };
        }

        setMutationLoading(true);
        setError("");

        try {
          const imageUrl = await uploadProductImage({
            artisanId: user.id,
            dataUrl: productData.photo || productData.image_url || "",
          });
          const { data, error: insertError } = await supabase
            .from("products")
            .insert({
              ai_generated: Boolean(productData.aiGenerated),
              artisan_id: user.id,
              artisan_name: artisanProfile?.name || "",
              category: productData.category || "General",
              description: productData.description || "",
              image_url: imageUrl,
              name: productData.name,
              price: Number(productData.price || 0),
              region: artisanProfile?.region || "",
              status: "active",
            })
            .select()
            .single();

          if (insertError) {
            throw insertError;
          }

          setProducts((current) => [mapProductFromDb(data, artisanProfile?.storefrontId), ...current]);
          logInfo("Product created", { artisanId: user.id, productId: data?.id });
          toast({
            description: "Your product is now live in your marketplace.",
            title: "Product saved",
          });
          return { success: true, error: null };
        } catch (saveError) {
          const message = saveError.message || "Product could not be saved. Please try again.";
          setError(message);
          logError("Product creation failed", saveError, { artisanId: user.id });
          toast({
            description: message,
            title: "Product save failed",
            variant: "destructive",
          });
          return { success: false, error: message };
        } finally {
          setMutationLoading(false);
        }
      },
      async deleteProduct(productId) {
        if (!user?.id) {
          return { success: false, error: "You must be logged in to delete products." };
        }

        if (mutationLoading) {
          return { success: false, error: "Another product action is already in progress." };
        }

        setMutationLoading(true);
        setError("");
        try {
          const { error: deleteError } = await supabase
            .from("products")
            .delete()
            .eq("id", productId)
            .eq("artisan_id", user.id);

          if (deleteError) {
            throw deleteError;
          }

          setProducts((current) => current.filter((product) => product.id !== productId));
          toast({ description: "The listing was removed.", title: "Product deleted" });
          return { success: true, error: null };
        } catch (deleteError) {
          const message = deleteError.message || "Product could not be deleted.";
          setError(message);
          logError("Product deletion failed", deleteError, { artisanId: user.id, productId });
          toast({
            description: message,
            title: "Delete failed",
            variant: "destructive",
          });
          return { success: false, error: message };
        } finally {
          setMutationLoading(false);
        }
      },
      async updateProduct(productId, updates) {
        if (!user?.id) {
          return { success: false, error: "You must be logged in to update products." };
        }

        if (mutationLoading) {
          return { success: false, error: "Another product action is already in progress." };
        }

        setError("");
        setMutationLoading(true);
        try {
          const dbUpdates = { ...updates };
          if ("photo" in dbUpdates) {
            dbUpdates.image_url = await uploadProductImage({
              artisanId: user.id,
              dataUrl: dbUpdates.photo,
            });
            delete dbUpdates.photo;
          }

          const { error: updateError } = await supabase
            .from("products")
            .update(dbUpdates)
            .eq("id", productId)
            .eq("artisan_id", user.id);

          if (updateError) {
            throw updateError;
          }

          setProducts((current) => {
            return current.map((product) => {
              if (product.id !== productId) {
                return product;
              }

              return {
                ...product,
                ...updates,
                photo: dbUpdates.image_url || updates.photo || updates.image_url || product.photo,
              };
            });
          });
          toast({ description: "Your product changes were saved.", title: "Product updated" });
          return { success: true, error: null };
        } catch (updateError) {
          const message = updateError.message || "Product could not be updated.";
          setError(message);
          logError("Product update failed", updateError, { artisanId: user.id, productId });
          toast({
            description: message,
            title: "Update failed",
            variant: "destructive",
          });
          return { success: false, error: message };
        } finally {
          setMutationLoading(false);
        }
      },
      error,
      loading,
      mutationLoading,
      products,
    }),
    [artisanProfile?.name, artisanProfile?.region, artisanProfile?.storefrontId, error, loading, mutationLoading, products, user?.id],
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

/**
 * Reads product state.
 * @returns {{products: object[], addProduct: Function, deleteProduct: Function}}
 */
export function useProducts() {
  return useContext(ProductContext);
}
