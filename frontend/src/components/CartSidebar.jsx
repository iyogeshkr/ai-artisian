import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/config/supabase";

export default function CartSidebar() {
  const { items, removeItem, updateQty, total, count, isOpen, setIsOpen } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [artisanData, setArtisanData] = useState({});

  const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || "919999999999").replace(/\D/g, "");
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || "orders@aiartisan.com";

  // Fetch artisan phone numbers when cart items change
  useEffect(() => {
    const fetchArtisanData = async () => {
      if (items.length === 0) return;

      const uniqueArtisanIds = [...new Set(items.map(i => i.artisan_id).filter(Boolean))];
      if (uniqueArtisanIds.length === 0) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, phone, name")
          .in("id", uniqueArtisanIds);

        if (error) throw error;

        const dataMap = {};
        data?.forEach(profile => {
          dataMap[profile.id] = { phone: profile.phone, name: profile.name };
        });
        setArtisanData(dataMap);
      } catch (err) {
        console.error("Error fetching artisan data:", err);
      }
    };

    fetchArtisanData();
  }, [items]);

  // Group items by artisan_id
  const groupedByArtisan = items.reduce((acc, item) => {
    const artisanId = item.artisan_id || "unknown";
    if (!acc[artisanId]) {
      acc[artisanId] = [];
    }
    acc[artisanId].push(item);
    return acc;
  }, {});

  // Build item list for a specific artisan group
  const buildItemListForArtisan = (artisanItems) =>
    artisanItems
      .map((item) => `• ${item.name} x${item.qty} — ₹${item.priceNum * item.qty}`)
      .join("\n");

  // Calculate total for artisan group
  const getArtisanTotal = (artisanItems) =>
    artisanItems.reduce((sum, item) => sum + item.priceNum * item.qty, 0);

  // Open WhatsApp order for a specific artisan
  const openWhatsAppOrderForArtisan = (artisanId, artisanItems) => {
    if (!user) {
      toast({ title: "Login required", description: "Please login to place an order.", variant: "destructive" });
      return;
    }

    const artisanInfo = artisanData[artisanId];
    const artisanName = artisanInfo?.name || "Artisan";
    const artisanPhone = artisanInfo?.phone;

    // Use artisan's phone if available, otherwise fallback
    const phoneNumber = artisanPhone 
      ? artisanPhone.replace(/\D/g, "")
      : whatsappNumber;

    const itemList = buildItemListForArtisan(artisanItems);
    const artisanTotal = getArtisanTotal(artisanItems);
    const message = `Hi ${artisanName}! I'd like to order from AI Artisan:\n\n${itemList}\n\nTotal: ₹${artisanTotal}\n\nPlease confirm my order.`;

    const url = `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const requestInvoice = () => {
    if (!user) {
      toast({ title: "Login required", description: "Please login to request an invoice.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const itemList = items
      .map((item) => `• ${item.name} x${item.qty} — ₹${item.priceNum * item.qty}`)
      .join("\n");
    const body = `Hi, I would like to request an invoice for:\n\n${itemList}\n\nTotal: ₹${total}`;
    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent("Order Request")}&body=${encodeURIComponent(body)}`;
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-lg">Your Cart</h2>
                {count > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </div>
              <button onClick={handleClose} className="p-1 rounded-md hover:bg-muted transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="font-medium text-lg mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground text-sm mb-6">Browse our collection and add artisan products.</p>
                <Button onClick={handleClose} variant="outline">Browse Products</Button>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <AnimatePresence>
                    {items.map(item => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        className="flex gap-3 bg-card rounded-xl border p-3 shadow-sm"
                      >
                        <img src={item.image + "?w=120"} alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm leading-tight truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
                          <p className="text-xs text-muted-foreground mb-2">by {item.artisan_name || item.artisan}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <button onClick={() => updateQty(item.id, item.qty - 1)}
                                className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-muted transition-colors">
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                              <button onClick={() => updateQty(item.id, item.qty + 1)}
                                className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-muted transition-colors">
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">₹{(item.priceNum * item.qty).toLocaleString()}</span>
                              <button onClick={() => removeItem(item.id)}
                                className="text-destructive hover:text-destructive/80 transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="border-t p-5 space-y-3 bg-background max-h-96 overflow-y-auto">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal ({count} items)</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-accent font-medium">Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-3">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>

                  {/* Separate WhatsApp buttons for each artisan */}
                  <div className="space-y-2 border-t pt-3">
                    {Object.entries(groupedByArtisan).map(([artisanId, artisanItems]) => {
                      const artisanInfo = artisanData[artisanId];
                      const artisanName = artisanInfo?.name || artisanItems[0]?.artisan_name || artisanItems[0]?.artisan || "Artisan";
                      const artisanTotal = getArtisanTotal(artisanItems);

                      return (
                        <div key={artisanId} className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Order from <span className="text-foreground font-semibold">{artisanName}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {artisanItems.length} item{artisanItems.length > 1 ? "s" : ""} — ₹{artisanTotal.toLocaleString()}
                          </p>
                          <Button 
                            className="w-full text-xs" 
                            size="sm" 
                            onClick={() => openWhatsAppOrderForArtisan(artisanId, artisanItems)}
                          >
                            Order from {artisanName}
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  <Button className="w-full" size="lg" variant="outline" onClick={requestInvoice} disabled={isSubmitting}>
                    Request Invoice
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    We'll confirm your order within 24 hours
                  </p>
                  {!user && (
                    <p className="text-center text-xs text-muted-foreground">
                      You'll need to login to place an order.
                    </p>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
