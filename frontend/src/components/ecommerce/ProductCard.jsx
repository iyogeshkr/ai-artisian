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

  const wishlistLabel = useMemo(() => {
    return wishlisted ? "Remove from wishlist" : "Add to wishlist";
  }, [wishlisted]);

  const toggleWishlist = (event) => {
    event.stopPropagation();
    const list = readWishlist();
    const next = list.includes(product.id)
      ? list.filter((id) => id !== product.id)
      : [...list, product.id];
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
    window.setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  return (
    <article className="group cursor-pointer overflow-hidden rounded border border-gray-200 bg-white transition-shadow duration-200 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />

        {product.badge ? (
          <span
            className={`absolute left-2 top-2 rounded px-2 py-0.5 text-[10px] font-bold ${badgeClasses(
              product.badge,
            )}`}
          >
            {product.badge}
          </span>
        ) : null}

        <button
          type="button"
          aria-label={wishlistLabel}
          onClick={toggleWishlist}
          className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-gray-400 shadow-sm transition-colors duration-150 hover:text-red-500"
        >
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
        </button>
      </div>

      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-gray-800">{product.name}</h3>

        <div className="mt-1 text-xs text-gray-500">
          By {product.artisan} · {product.artisanLocation}
        </div>
        <span className="mt-1 inline-block rounded border border-orange-200 bg-orange-50 px-1.5 text-[10px] text-primary">
          {product.craft}
        </span>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-gray-900">{product.price}</span>
          <span className="text-xs text-gray-400 line-through">{product.originalPrice}</span>
          <span className="text-xs font-medium text-green-600">{product.discount}</span>
        </div>

        <div className="mt-1 flex items-center gap-2">
          <span className={`rounded px-1.5 py-0.5 text-xs ${ratingPillClasses(product.rating)}`}>
            ★ {product.rating}
          </span>
          <span className="text-xs text-gray-400">({product.reviews})</span>
        </div>

        <div className="mt-1.5 text-xs">
          <span className={product.freeDelivery ? "text-green-600" : "text-gray-600"}>
            {product.freeDelivery ? "Free delivery" : "Delivery: Rs. 49"}
          </span>
          <span className="px-1 text-gray-300">·</span>
          <span className="text-gray-500">Arrives in {product.deliveryDays} days</span>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className={`mt-3 flex w-full items-center justify-center rounded py-2 text-sm font-medium text-white transition-colors duration-150 ${
            added ? "bg-green-600" : "bg-primary hover:bg-primary/90"
          }`}
        >
          {added ? (
            "✓ Added"
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </article>
  );
}
