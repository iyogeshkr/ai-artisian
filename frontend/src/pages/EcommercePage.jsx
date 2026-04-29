import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Search,
  SearchX,
  Shield,
  SlidersHorizontal,
  Star,
  Truck,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ProductCard from "@/components/ecommerce/ProductCard";
import { ALL_PRODUCTS, CATEGORIES, SORT_OPTIONS } from "@/data/products";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const PRODUCTS_PER_PAGE = 12;
const PRICE_PRESETS = [
  { label: "Under ₹500", min: "", max: "500" },
  { label: "₹500-₹2000", min: "500", max: "2000" },
  { label: "₹2000-₹5000", min: "2000", max: "5000" },
  { label: "Above ₹5000", min: "5000", max: "" },
];
const FILTER_TAGS = ["handmade", "eco-friendly", "export-quality", "GI-tagged", "limited-edition"];

function parseDiscount(discount) {
  return parseInt(discount, 10) || 0;
}

function toDateLabel(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function getThumbnailSources(image) {
  const base = image.split("?")[0];
  return [`${base}?w=900&q=80`, `${base}?w=700&q=80`, `${base}?w=500&q=80`];
}

function hasActiveFilters({
  category,
  priceMin,
  priceMax,
  minRating,
  freeDeliveryOnly,
  fastDelivery,
  selectedCrafts,
  selectedTags,
}) {
  return [
    category !== "All",
    priceMin || priceMax,
    minRating > 0,
    freeDeliveryOnly,
    fastDelivery,
    selectedCrafts.length > 0,
    selectedTags.length > 0,
  ].some(Boolean);
}

function FilterSections({
  category,
  setCategory,
  categoryCounts,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  applyPriceRange,
  applyPricePreset,
  minRating,
  setMinRating,
  freeDeliveryOnly,
  setFreeDeliveryOnly,
  fastDelivery,
  setFastDelivery,
  selectedCrafts,
  toggleCraft,
  selectedTags,
  toggleTag,
  clearAllFilters,
  ratingCounts,
  craftOptions,
  showAllCrafts,
  setShowAllCrafts,
  activeFilterCount,
}) {
  const visibleCrafts = showAllCrafts ? craftOptions : craftOptions.slice(0, 6);

  return (
    <div className="space-y-5 p-4">
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Category</h3>
        <div className="mt-2 space-y-1">
          <button
            type="button"
            onClick={() => setCategory("All")}
            className={`block w-full rounded px-2 py-1.5 text-left text-sm transition-colors duration-150 ${
              category === "All"
                ? "border-l-2 border-primary bg-orange-50 font-medium text-primary"
                : "text-gray-700 hover:text-primary"
            }`}
          >
            All <span className="text-gray-400">({ALL_PRODUCTS.length})</span>
          </button>
          {CATEGORIES.filter((item) => item !== "All").map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`block w-full rounded px-2 py-1.5 text-left text-sm transition-colors duration-150 ${
                category === item
                  ? "border-l-2 border-primary bg-orange-50 font-medium text-primary"
                  : "text-gray-700 hover:text-primary"
              }`}
            >
              {item} <span className="text-gray-400">({categoryCounts[item] || 0})</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Price Range</h3>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Input
            type="number"
            value={priceMin}
            placeholder="Min (₹)"
            onChange={(event) => setPriceMin(event.target.value)}
            className="h-11 rounded border-gray-300 text-sm"
          />
          <Input
            type="number"
            value={priceMax}
            placeholder="Max (₹)"
            onChange={(event) => setPriceMax(event.target.value)}
            className="h-11 rounded border-gray-300 text-sm"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={applyPriceRange}
          className="mt-2 h-11 border-primary px-3 text-xs text-primary hover:bg-orange-50"
        >
          Apply
        </Button>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRICE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPricePreset(preset.min, preset.max)}
              className="rounded-full border border-gray-300 px-2.5 py-1 text-xs text-gray-600 transition-colors duration-150 hover:border-primary hover:text-primary"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Customer Rating</h3>
        <div className="mt-2 space-y-1.5">
          {[4, 3, 2, 1].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMinRating(minRating === value ? 0 : value)}
              className={`flex w-full items-center justify-between rounded px-2 py-1 text-sm transition-colors duration-150 ${
                minRating === value ? "font-semibold text-primary" : "text-gray-700 hover:text-primary"
              }`}
            >
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-current" />
                {value}★ & above
              </span>
              <span className="text-xs text-gray-400">({ratingCounts[value] || 0})</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Delivery</h3>
        <div className="mt-2 space-y-2 text-sm text-gray-700">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={freeDeliveryOnly}
              onChange={(event) => setFreeDeliveryOnly(event.target.checked)}
            />
            Free Delivery
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={fastDelivery}
              onChange={(event) => setFastDelivery(event.target.checked)}
            />
            Delivery in 2-3 days
          </label>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Craft Type</h3>
        <div className="mt-2 space-y-1.5 text-sm text-gray-700">
          {visibleCrafts.map((craft) => (
            <label key={craft} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedCrafts.includes(craft)}
                onChange={() => toggleCraft(craft)}
              />
              {craft}
            </label>
          ))}
        </div>
        {craftOptions.length > 6 ? (
          <button
            type="button"
            onClick={() => setShowAllCrafts((value) => !value)}
            className="mt-2 text-xs text-primary hover:underline"
          >
            {showAllCrafts ? "Show less" : "Show more"}
          </button>
        ) : null}
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tags</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {FILTER_TAGS.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors duration-150 ${
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </section>

      {activeFilterCount > 0 ? (
        <button
          type="button"
          onClick={clearAllFilters}
          className="text-sm text-primary underline underline-offset-2"
        >
          Clear All Filters
        </button>
      ) : null}
    </div>
  );
}

export default function EcommercePage() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false);
  const [fastDelivery, setFastDelivery] = useState(false);
  const [selectedCrafts, setSelectedCrafts] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [appliedPriceMin, setAppliedPriceMin] = useState("");
  const [appliedPriceMax, setAppliedPriceMax] = useState("");
  const [showAllCrafts, setShowAllCrafts] = useState(false);
  const [detailImage, setDetailImage] = useState("");
  const [detailQty, setDetailQty] = useState(1);

  const gridRef = useRef(null);

  const clearAllFilters = () => {
    setCategory("All");
    setSearch("");
    setPriceMin("");
    setPriceMax("");
    setAppliedPriceMin("");
    setAppliedPriceMax("");
    setMinRating(0);
    setFreeDeliveryOnly(false);
    setFastDelivery(false);
    setSelectedCrafts([]);
    setSelectedTags([]);
    setCurrentPage(1);
  };

  const activeFilterCount = [
    category !== "All",
    appliedPriceMin || appliedPriceMax,
    minRating > 0,
    freeDeliveryOnly,
    fastDelivery,
    selectedCrafts.length > 0,
    selectedTags.length > 0,
  ].filter(Boolean).length;

  const categoryCounts = useMemo(() => {
    return ALL_PRODUCTS.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});
  }, []);

  const ratingCounts = useMemo(() => {
    return [4, 3, 2, 1].reduce((acc, value) => {
      acc[value] = ALL_PRODUCTS.filter((product) => parseFloat(product.rating) >= value).length;
      return acc;
    }, {});
  }, []);

  const craftOptions = useMemo(() => {
    return [...new Set(ALL_PRODUCTS.map((product) => product.craft))].sort();
  }, []);

  const applyPriceRange = () => {
    setAppliedPriceMin(priceMin.trim());
    setAppliedPriceMax(priceMax.trim());
  };

  const applyPricePreset = (min, max) => {
    setPriceMin(min);
    setPriceMax(max);
    setAppliedPriceMin(min);
    setAppliedPriceMax(max);
  };

  const toggleCraft = (craft) => {
    setSelectedCrafts((current) =>
      current.includes(craft) ? current.filter((item) => item !== craft) : [...current, craft],
    );
  };

  const toggleTag = (tag) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  };

  const filteredProducts = useMemo(() => {
    const min = appliedPriceMin ? Number(appliedPriceMin) : null;
    const max = appliedPriceMax ? Number(appliedPriceMax) : null;

    const withIndex = ALL_PRODUCTS.map((product, index) => ({ ...product, _index: index }));

    let list = withIndex.filter((product) => {
      const query = search.trim().toLowerCase();
      const matchSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.artisan.toLowerCase().includes(query) ||
        product.craft.toLowerCase().includes(query) ||
        product.tags.some((tag) => tag.toLowerCase().includes(query));

      const matchCategory = category === "All" || product.category === category;
      const matchPrice =
        (min === null || product.priceNum >= min) && (max === null || product.priceNum <= max);
      const matchRating = parseFloat(product.rating) >= minRating;
      const matchFree = !freeDeliveryOnly || product.freeDelivery;
      const matchFast = !fastDelivery || product.deliveryDays <= 3;
      const matchCrafts =
        selectedCrafts.length === 0 || selectedCrafts.includes(product.craft);
      const matchTags =
        selectedTags.length === 0 || selectedTags.every((tag) => product.tags.includes(tag));

      return (
        matchSearch &&
        matchCategory &&
        matchPrice &&
        matchRating &&
        matchFree &&
        matchFast &&
        matchCrafts &&
        matchTags
      );
    });

    switch (sort) {
      case "price_asc":
        list = [...list].sort((a, b) => a.priceNum - b.priceNum);
        break;
      case "price_desc":
        list = [...list].sort((a, b) => b.priceNum - a.priceNum);
        break;
      case "rating":
        list = [...list].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      case "discount":
        list = [...list].sort((a, b) => parseDiscount(b.discount) - parseDiscount(a.discount));
        break;
      case "delivery":
        list = [...list].sort((a, b) => a.deliveryDays - b.deliveryDays);
        break;
      case "featured":
      default:
        list = [...list].sort((a, b) => a._index - b._index);
        break;
    }

    return list;
  }, [
    appliedPriceMax,
    appliedPriceMin,
    category,
    fastDelivery,
    freeDeliveryOnly,
    minRating,
    search,
    selectedCrafts,
    selectedTags,
    sort,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [currentPage, filteredProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    category,
    sort,
    appliedPriceMin,
    appliedPriceMax,
    minRating,
    freeDeliveryOnly,
    fastDelivery,
    selectedCrafts,
    selectedTags,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!selectedProduct) {
      return;
    }

    setDetailImage(selectedProduct.image);
    setDetailQty(1);
  }, [selectedProduct]);

  const activeFilterChips = [];

  if (category !== "All") {
    activeFilterChips.push({ label: category, onRemove: () => setCategory("All") });
  }
  if (appliedPriceMin || appliedPriceMax) {
    activeFilterChips.push({
      label: `₹${appliedPriceMin || 0} - ₹${appliedPriceMax || "Any"}`,
      onRemove: () => {
        setPriceMin("");
        setPriceMax("");
        setAppliedPriceMin("");
        setAppliedPriceMax("");
      },
    });
  }
  if (minRating > 0) {
    activeFilterChips.push({ label: `${minRating}★ & above`, onRemove: () => setMinRating(0) });
  }
  if (freeDeliveryOnly) {
    activeFilterChips.push({ label: "Free Delivery", onRemove: () => setFreeDeliveryOnly(false) });
  }
  if (fastDelivery) {
    activeFilterChips.push({ label: "2-3 days", onRemove: () => setFastDelivery(false) });
  }
  selectedCrafts.forEach((craft) => {
    activeFilterChips.push({
      label: craft,
      onRemove: () => toggleCraft(craft),
    });
  });
  selectedTags.forEach((tag) => {
    activeFilterChips.push({
      label: tag,
      onRemove: () => toggleTag(tag),
    });
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filterSectionsProps = {
    category,
    setCategory,
    categoryCounts,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    applyPriceRange,
    applyPricePreset,
    minRating,
    setMinRating,
    freeDeliveryOnly,
    setFreeDeliveryOnly,
    fastDelivery,
    setFastDelivery,
    selectedCrafts,
    toggleCraft,
    selectedTags,
    toggleTag,
    clearAllFilters,
    ratingCounts,
    craftOptions,
    showAllCrafts,
    setShowAllCrafts,
    activeFilterCount,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center gap-3 px-3 py-3">
          <div className="min-w-[190px]">
            <h1 className="text-lg font-medium text-gray-800">Handmade Marketplace</h1>
            <p className="text-sm text-gray-500">Showing {filteredProducts.length} products</p>
          </div>

          <div className="relative w-full flex-1 md:max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search for products, crafts, artisans..."
              className="h-10 rounded-none border-primary pl-9 pr-9"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex w-full items-center gap-2 md:hidden">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDrawerOpen(true)}
              className="h-9 border-gray-300"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-9 flex-1 rounded border border-gray-300 px-2 text-sm"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {user ? (
            <div className="ml-auto hidden text-xs text-gray-500 lg:block">
              Signed in as {user.profile?.name || user.email}
            </div>
          ) : null}
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-4 px-3 py-4">
        <aside className="sticky top-4 hidden h-fit w-[220px] flex-shrink-0 rounded border border-gray-200 bg-white md:block">
          <FilterSections {...filterSectionsProps} />
        </aside>

        <section ref={gridRef} className="min-w-0 flex-1">
          <div className="[scrollbar-width:none] flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition-colors duration-150 ${
                  category === item
                    ? "border-primary bg-primary text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {activeFilterChips.length > 0 ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded border border-gray-200 bg-white p-2">
              <span className="text-xs font-medium text-gray-600">Active filters:</span>
              {activeFilterChips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs text-primary"
                >
                  {chip.label}
                  <button type="button" onClick={chip.onRemove} aria-label={`Remove ${chip.label}`}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={clearAllFilters}
                className="ml-auto text-xs text-primary underline"
              >
                Clear all
              </button>
            </div>
          ) : null}

          <div className="mt-3 flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2">
            <p className="text-sm text-gray-600">{filteredProducts.length} products found</p>
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="rounded border border-gray-300 px-2 py-1 text-sm"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {paginatedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
              <SearchX className="h-16 w-16 text-gray-300" />
              <h2 className="mt-4 text-xl font-semibold text-gray-800">No products found</h2>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search term</p>
              <Button
                type="button"
                variant="outline"
                onClick={clearAllFilters}
                className="mt-4 border-primary text-primary hover:bg-orange-50"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <motion.div
              layout
              className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            >
              <AnimatePresence>
                {paginatedProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {filteredProducts.length > PRODUCTS_PER_PAGE ? (
            <div className="mt-5 flex items-center justify-center gap-2 pb-6">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-40"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => handlePageChange(page)}
                  className={`rounded px-3 py-1 text-sm ${
                    page === currentPage
                      ? "bg-primary text-white"
                      : "border border-gray-300 hover:border-primary"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          ) : null}
        </section>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 md:hidden ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setDrawerOpen(false)}
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[88%] max-w-sm bg-white transition-transform duration-300 md:hidden ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="font-medium text-gray-800">Filters</h2>
          <button type="button" onClick={() => setDrawerOpen(false)}>
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="h-[calc(100%-120px)] overflow-y-auto">
          <FilterSections {...filterSectionsProps} />
        </div>

        <div className="flex gap-2 border-t border-gray-200 p-4">
          <Button type="button" variant="outline" className="flex-1" onClick={clearAllFilters}>
            Clear All
          </Button>
          <Button type="button" className="flex-1" onClick={() => setDrawerOpen(false)}>
            Apply {activeFilterCount} Filters
          </Button>
        </div>
      </aside>

      <Dialog open={Boolean(selectedProduct)} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-3xl p-4 sm:p-6">
          {selectedProduct ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="relative overflow-hidden rounded-lg bg-gray-50">
                  <img
                    src={detailImage || selectedProduct.image}
                    alt={selectedProduct.name}
                    className="aspect-square w-full object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded bg-primary px-2 py-1 text-[10px] text-white">
                    AI Generated Design
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {getThumbnailSources(selectedProduct.image).map((thumb) => (
                    <button
                      type="button"
                      key={thumb}
                      onClick={() => setDetailImage(thumb)}
                      className={`overflow-hidden rounded border ${
                        (detailImage || selectedProduct.image) === thumb
                          ? "border-primary"
                          : "border-gray-200"
                      }`}
                    >
                      <img src={thumb} alt={selectedProduct.name} className="aspect-square w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.badge ? (
                    <span className="rounded bg-orange-100 px-2 py-1 text-xs text-primary">
                      {selectedProduct.badge}
                    </span>
                  ) : null}
                  <span className="rounded border border-orange-200 bg-orange-50 px-2 py-1 text-xs text-primary">
                    {selectedProduct.craft}
                  </span>
                </div>

                <h2 className="mt-2 text-xl font-bold text-gray-900">{selectedProduct.name}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  By {selectedProduct.artisan} · {selectedProduct.artisanLocation}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded bg-green-600 px-2 py-1 text-sm text-white">
                    ★ {selectedProduct.rating}
                  </span>
                  <span className="text-sm text-gray-500">({selectedProduct.reviews} reviews)</span>
                </div>

                <div className="mt-3">
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-gray-900">{selectedProduct.price}</span>
                    <span className="text-sm text-gray-400 line-through">{selectedProduct.originalPrice}</span>
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      {selectedProduct.discount}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Inclusive of all taxes</p>
                </div>

                <div className="mt-4 space-y-2 rounded bg-blue-50 p-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-700" />
                    {selectedProduct.freeDelivery ? "Free delivery" : "Rs. 49 delivery"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-700" />
                    Estimated delivery: {toDateLabel(selectedProduct.deliveryDays)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-700" />
                    7-day returns
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailQty((qty) => Math.max(1, qty - 1))}
                    className="h-9 w-9 rounded border border-gray-300"
                  >
                    -
                  </button>
                  <div className="h-9 min-w-[48px] rounded border border-gray-300 px-3 py-2 text-center text-sm">
                    {detailQty}
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailQty((qty) => Math.min(10, qty + 1))}
                    className="h-9 w-9 rounded border border-gray-300"
                  >
                    +
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-orange-50"
                    onClick={() => {
                      for (let i = 0; i < detailQty; i += 1) {
                        addItem({
                          id: selectedProduct.id,
                          name: selectedProduct.name,
                          price: selectedProduct.priceNum,
                          priceNum: selectedProduct.priceNum,
                          image: selectedProduct.image,
                          artisan: selectedProduct.artisan,
                        });
                      }
                    }}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => {
                      addItem({
                        id: selectedProduct.id,
                        name: selectedProduct.name,
                        price: selectedProduct.priceNum,
                        priceNum: selectedProduct.priceNum,
                        image: selectedProduct.image,
                        artisan: selectedProduct.artisan,
                      });
                      setSelectedProduct(null);
                      navigate("/");
                    }}
                  >
                    Buy Now
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedProduct.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-4 rounded bg-orange-50 p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                      {selectedProduct.artisan
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">By {selectedProduct.artisan}</p>
                      <p className="text-xs text-gray-600">
                        {selectedProduct.artisanLocation} · {selectedProduct.craft}
                      </p>
                      <p className="mt-1 text-xs text-gray-700">
                        Handcrafted with traditional techniques passed down for generations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
