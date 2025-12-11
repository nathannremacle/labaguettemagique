"use client";

import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from "react";
import { MenuItem } from "@/components/MenuSection";

export type CartItem = MenuItem & {
  quantity: number;
  categoryId: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: MenuItem, categoryId: string) => void;
  removeItem: (itemName: string, categoryId: string) => void;
  updateQuantity: (itemName: string, categoryId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => string;
  getTotalItems: () => number;
  formatWhatsAppMessage: () => string;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: MenuItem, categoryId: string) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.name === item.name && i.categoryId === categoryId
      );
      if (existing) {
        return prev.map((i) =>
          i.name === item.name && i.categoryId === categoryId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1, categoryId }];
    });
  }, []);

  const removeItem = useCallback((itemName: string, categoryId: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.name === itemName && i.categoryId === categoryId))
    );
  }, []);

  const updateQuantity = useCallback((itemName: string, categoryId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemName, categoryId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.name === itemName && i.categoryId === categoryId
          ? { ...i, quantity }
          : i
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotalItems = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const getTotalPrice = useCallback(() => {
    // Extract numeric price from price string (e.g., "5,50 €" -> 5.50)
    const extractPrice = (priceStr: string): number => {
      // Handle ranges like "5,50 € - 6,50 €" by taking the first price
      const firstPrice = priceStr.split(" - ")[0];
      const numericStr = firstPrice.replace(/[^\d,]/g, "").replace(",", ".");
      return parseFloat(numericStr) || 0;
    };

    const total = items.reduce((sum, item) => {
      return sum + extractPrice(item.price) * item.quantity;
    }, 0);

    return total.toFixed(2).replace(".", ",") + " €";
  }, [items]);

  const formatWhatsAppMessage = useCallback(() => {
    if (items.length === 0) return "";

    let message = "Bonjour, je souhaite passer une commande :\n\n";
    
    items.forEach((item) => {
      message += `• ${item.name}`;
      if (item.quantity > 1) {
        message += ` (x${item.quantity})`;
      }
      message += ` - ${item.price}\n`;
    });

    message += `\nTotal : ${getTotalPrice()}`;
    message += "\n\nMerci !";

    return message;
  }, [items, getTotalPrice]);

  const contextValue = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems,
      formatWhatsAppMessage,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems, formatWhatsAppMessage]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

