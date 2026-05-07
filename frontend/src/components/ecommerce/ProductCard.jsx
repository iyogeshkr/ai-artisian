import { useEffect, useMemo, useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

const WISHLIST_KEY = "artisan_wishlist";

function readWishlist() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(WISHLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWishlist(list) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
}

function badgeClasses(badge) {
  if (badge === "Bestseller") {
    return "bg-yellow-400 text-yellow-900";
  }

  if (badge === "New") {
    return "bg-green-500 text-white";
  }

  if (badge === "Limited") {
    return "bg-red-500 text-white";
  }

  return "bg-primary text-white";
}

function ratingPillClasses(rating) {
  const value = parseFloat(rating);
  if (value >= 4) {
    return "bg-green-600 text-white";
  }

  if (value >= 3) {
    return "bg-yellow-500 text-white";
  }

  return "bg-gray-400 text-white";
}

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const list = readWishlist();
    setWishlisted(list.includes(product.id));
  }, [product.id]);

  const wishlistLabel = useMemo(() => (wishlisted ? "Remove from wishlist" : "Add to wishlist"), [wishlisted]);

  const toggleWishlist = (event) => {
    event.stopPropagation();
    const list = readWishlist();
    const next = list.includes(product.id) ? list.filter((id) => id !== product.id) : [...list, product.id];
    writeWishlist(next);
    setWishlisted(next.includes(product.id));
  };

  const handleAddToCart = (event) => {
    event.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.priceNum,
      priceNum: product.priceNum,
      image: product.image,
      artisan: product.artisan,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article className="group cursor-pointer overflow-hidden rounded bg-white transition-shadow duration-150 hover:shadow-md border border-transparent hover:border-gray-100">
      <div className="relative">
        <div className="aspect-square w-full overflow-hidden bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        </div>

        {product.badge ? (
          <span className={`absolute left-2 top-2 rounded px-2 py-0.5 text-[11px] font-semibold ${badgeClasses(product.badge)}`}>
            {product.badge}
          </span>
        ) : null}

        <button
          type="button"
          aria-label={wishlistLabel}
          onClick={toggleWishlist}
          className="absolute right-2 top-2 rounded-full bg-white p-1 shadow-sm text-gray-400 hover:text-red-500"
        >
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
        </button>
      </div>

      <div className="px-2 pb-2 pt-3">
        <h3 className="text-sm font-medium text-gray-800 leading-tight line-clamp-2">{product.name}</h3>

        <div className="mt-1 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-900">{product.price}</div>
            {product.discount && <div className="text-xs text-green-600 font-medium">{product.discount}</div>}
          </div>

          <div className="flex flex-col items-end text-right">
            <div className="text-xs text-gray-500">★ {product.rating}</div>
            <div className="text-xs text-gray-400">({product.reviews})</div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs text-gray-500 truncate">{product.artisan} · {product.artisanLocation}</div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`ml-2 inline-flex items-center gap-2 rounded px-2 py-1 text-xs font-medium text-white transition-colors ${
              added ? "bg-green-600" : "bg-primary hover:bg-primary/90"
            }`}
          >
            {added ? "✓" : <ShoppingCart className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </article>
  );
}
