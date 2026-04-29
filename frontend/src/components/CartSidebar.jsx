import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export default function CartSidebar() {
  const { items, removeItem, updateQty, total, count, isOpen, setIsOpen } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || "919999999999").replace(/\D/g, "");
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || "orders@aiartisan.com";

  const buildItemList = () =>
    items
      .map((item) => `• ${item.name} x${item.qty} — ₹${item.priceNum * item.qty}`)
      .join("\n");

  const openWhatsAppOrder = () => {
    if (!user) {
      toast({ title: "Login required", description: "Please login to place an order.", variant: "destructive" });
      return;
    }

    const itemList = buildItemList();
    const nextTotal = items.reduce((sum, item) => sum + item.priceNum * item.qty, 0);
    const message = `Hi! I'd like to order:\n\n${itemList}\n\nTotal: ₹${nextTotal}\n\nPlease confirm my order.`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const requestInvoice = () => {
    if (!user) {
      toast({ title: "Login required", description: "Please login to request an invoice.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const itemList = buildItemList();
    const nextTotal = items.reduce((sum, item) => sum + item.priceNum * item.qty, 0);
    const body = `Hi, I would like to request an invoice for:\n\n${itemList}\n\nTotal: ₹${nextTotal}`;
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
                <div className="border-t p-5 space-y-3 bg-background">
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
                  <Button className="w-full" size="lg" onClick={openWhatsAppOrder}>
                    Order via WhatsApp
                  </Button>
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
