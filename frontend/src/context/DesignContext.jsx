import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { logError } from "@/utils/logger";

const DesignContext = createContext(null);

function mapRowToDesignBatch(row) {
  const imageUrls = Array.isArray(row?.image_urls) ? row.image_urls : [];
  return imageUrls.map((imageUrl, index) => ({
    craftType: row?.craft_type || "",
    id: `${row.id}-${index}`,
    imageUrl,
    prompt: row?.prompt || "",
    style: row?.style || "",
  }));
}

export function DesignProvider({ children }) {
  const { user } = useAuth();
  const [currentDesigns, setCurrentDesigns] = useState([]);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [generationHistory, setGenerationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDesigns = async () => {
      if (!user?.id) {
        if (isMounted) {
          setCurrentDesigns([]);
          setSelectedDesign(null);
          setGenerationHistory([]);
          setLoading(false);
          setError("");
        }
        return;
      }

      setLoading(true);
      setError("");
      let data = [];
      let loadError = null;

      try {
        const result = await supabase
          .from("designs")
          .select("*")
          .eq("artisan_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);
        data = result.data;
        loadError = result.error;
      } catch (requestError) {
        loadError = requestError;
      }

      if (!isMounted) {
        return;
      }

      if (loadError) {
        setError(loadError.message || "Design history could not load.");
        setCurrentDesigns([]);
        setGenerationHistory([]);
        logError("Design history failed to load", loadError, { artisanId: user.id });
        setLoading(false);
        return;
      }

      const historyBatches = (data || []).map(mapRowToDesignBatch).filter((batch) => batch.length > 0);
      setGenerationHistory(historyBatches);
      setCurrentDesigns(historyBatches[0] || []);
      setSelectedDesign(null);
      setLoading(false);
    };

    loadDesigns();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const saveDesign = async (designData) => {
    if (!user?.id) {
      return;
    }

    const imageUrls = designData.map((design) => design.imageUrl).filter(Boolean);
    const prompt = designData[0]?.prompt || "";
    const craftType = designData[0]?.craftType || "";
    const style = designData[0]?.style || "";

    const { data: inserted, error: insertError } = await supabase
      .from("designs")
      .insert({
        artisan_id: user.id,
        craft_type: craftType,
        image_urls: imageUrls,
        prompt,
        style,
      })
      .select("id")
      .single();

    if (insertError || !inserted?.id) {
      throw insertError || new Error("Design history insert did not return an id.");
    }

    const { data: allDesignRows } = await supabase
      .from("designs")
      .select("id")
      .eq("artisan_id", user.id)
      .order("created_at", { ascending: false });

    if ((allDesignRows || []).length > 10) {
      const extraRows = allDesignRows.slice(10);
      const extraIds = extraRows.map((row) => row.id);
      if (extraIds.length > 0) {
        await supabase.from("designs").delete().in("id", extraIds);
      }
    }
  };

  const value = useMemo(
    () => ({
      currentDesigns,
      error,
      generationHistory,
      loading,
      selectedDesign,
      selectDesign(design) {
        setSelectedDesign(design);
      },
      async setCurrentDesignBatch(designs) {
        setCurrentDesigns(designs);
        setGenerationHistory((current) => [designs, ...current].slice(0, 10));
        try {
          await saveDesign(designs);
        } catch (saveError) {
          logError("Generated designs failed to persist", saveError, { artisanId: user?.id });
          toast({
            description: "The designs are visible now. History save was skipped.",
            title: "Design history not saved",
            variant: "destructive",
          });
        }
      },
    }),
    [
      currentDesigns,
      error,
      generationHistory,
      loading,
      selectedDesign,
      user?.id,
    ],
  );

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
}

/**
 * Reads design generation state.
 * @returns {{currentDesigns: object[], selectedDesign: object | null, generationHistory: object[], selectDesign: Function, setCurrentDesignBatch: Function}}
 */
export function useDesigns() {
  return useContext(DesignContext);
}
