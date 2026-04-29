import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/AuthContext";
import { useArtisan } from "@/context/ArtisanContext";

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
      const { data, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("artisan_id", user.id)
        .order("created_at", { ascending: false });

      if (!isMounted) {
        return;
      }

      if (fetchError) {
        setProducts([]);
        setError(fetchError.message);
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

        setError("");
        const { data, error: insertError } = await supabase
          .from("products")
          .insert({
            artisan_id: user.id,
            artisan_name: artisanProfile?.name || "",
            category: productData.category || "General",
            description: productData.description || "",
            image_url: productData.photo || productData.image_url || "",
            name: productData.name,
            price: Number(productData.price || 0),
            region: artisanProfile?.region || "",
            status: "active",
          })
          .select()
          .single();

        if (insertError) {
          setError(insertError.message);
          return { success: false, error: insertError.message };
        }

        setProducts((current) => [mapProductFromDb(data, artisanProfile?.storefrontId), ...current]);
        return { success: true, error: null };
      },
      async deleteProduct(productId) {
        if (!user?.id) {
          return { success: false, error: "You must be logged in to delete products." };
        }

        setError("");
        const { error: deleteError } = await supabase.from("products").delete().eq("id", productId);

        if (deleteError) {
          setError(deleteError.message);
          return { success: false, error: deleteError.message };
        }

        setProducts((current) => current.filter((product) => product.id !== productId));
        return { success: true, error: null };
      },
      async updateProduct(productId, updates) {
        if (!user?.id) {
          return { success: false, error: "You must be logged in to update products." };
        }

        const dbUpdates = { ...updates };
        if ("photo" in dbUpdates) {
          dbUpdates.image_url = dbUpdates.photo;
          delete dbUpdates.photo;
        }

        setError("");
        const { error: updateError } = await supabase
          .from("products")
          .update(dbUpdates)
          .eq("id", productId);

        if (updateError) {
          setError(updateError.message);
          return { success: false, error: updateError.message };
        }

        setProducts((current) => {
          return current.map((product) => {
            if (product.id !== productId) {
              return product;
            }

            return {
              ...product,
              ...updates,
              photo: updates.photo || updates.image_url || product.photo,
            };
          });
        });
        return { success: true, error: null };
      },
      error,
      loading,
      products,
    }),
    [artisanProfile?.name, artisanProfile?.region, artisanProfile?.storefrontId, error, loading, products, user?.id],
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
