"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import React from "react";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { menuCategories, getWhatsAppUrl } from "@/lib/website-data";
import { useTheme } from "@/components/ThemeProvider";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { useCart } from "@/contexts/CartContext";
import { MenuCategory, MenuItem } from "@/components/MenuSection";
import { ShoppingCart, Plus, Minus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Toast } from "@/components/ui/toast";

// Import default menu data as fallback
import { menuData as defaultMenuData } from "@/components/MenuSection";

// Helper function to get local placeholder image based on category and item index
function getItemImage(itemName: string, category: string, itemIndex: number): string {
  // Use local placeholder images from the placeholders folder
  // Format: /images/placeholders/{category}-{index}.jpg
  return `/images/placeholders/${category}-${itemIndex}.jpg`;
}

export default function MenuPage() {
  const [menuData, setMenuData] = useState<MenuCategory[]>(defaultMenuData);
  const [loading, setLoading] = useState(true);
  const tabs = menuData.map((category) => ({ value: category.id, label: category.label }));
  const [activeCategory, setActiveCategory] = useState(tabs[0]?.value ?? "");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [cartButtonPulse, setCartButtonPulse] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const cartButtonRef = React.useRef<HTMLButtonElement>(null);
  const { theme } = useTheme();
  const cart = useCart();

  // Load menu data from API
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        const response = await fetch("/api/menu", {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            // Ensure all categories have items array
            const normalizedData = data.map((cat: MenuCategory) => ({
              ...cat,
              items: cat.items || [],
            }));
            setMenuData(normalizedData);
            if (!activeCategory && normalizedData.length > 0) {
              setActiveCategory(normalizedData[0].id);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load menu:", error);
        // Use default data on error
        setMenuData(defaultMenuData);
      } finally {
        setLoading(false);
      }
    };

    loadMenuData();
  }, []);

  const currentItems = useMemo(
    () => menuData.find((category) => category.id === activeCategory)?.items ?? [],
    [activeCategory, menuData]
  );

  // Extract size options from price string (e.g., "5,50 € - 6,50 €" means Petit/Grand)
  const getSizeOptions = (price: string): string[] => {
    if (price.includes(" - ")) {
      return ["Petit", "Grand"];
    }
    return [];
  };

  const handleAddToCart = (item: MenuItem, categoryId: string, qty: number = 1, size: string = "") => {
    // Add item multiple times based on quantity
    for (let i = 0; i < qty; i++) {
      const itemWithSize = size 
        ? { ...item, name: `${item.name} (${size})` }
        : item;
      cart.addItem(itemWithSize, categoryId);
    }
    
    // Show toast notification
    const sizeText = size ? ` - ${size}` : "";
    const qtyText = qty > 1 ? ` x${qty}` : "";
    setToastMessage(`${item.name}${sizeText}${qtyText} ajouté${qty > 1 ? "s" : ""} au panier !`);
    setToastVisible(true);
    
    // Animate cart button
    setCartButtonPulse(true);
    setTimeout(() => setCartButtonPulse(false), 500);
    
    // Focus on cart button
    setTimeout(() => {
      cartButtonRef.current?.focus();
    }, 100);
  };

  const handleSendOrder = () => {
    const message = cart.formatWhatsAppMessage();
    const url = getWhatsAppUrl(message);
    window.open(url, "_blank");
  };

  if (!tabs.length) {
    return null;
  }

  return (
    <div className={`min-h-screen ${
      theme === "dark" ? "bg-slate-950" : "bg-white"
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-20 border-b backdrop-blur ${
        theme === "dark"
          ? "border-white/10 bg-slate-950/70"
          : "border-slate-200 bg-white/70"
      }`}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className={`text-xl font-bold ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}>
            ← Retour
          </Link>
          <button
            ref={cartButtonRef}
            onClick={() => setCartOpen(true)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              cartButtonPulse ? "scale-110" : "scale-100"
            } ${
              theme === "dark"
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-900"
            }`}
          >
            <ShoppingCart className={`h-5 w-5 transition-transform ${
              cartButtonPulse ? "rotate-12" : "rotate-0"
            }`} />
            <span className="font-medium">Panier</span>
            {cart.getTotalItems() > 0 && (
              <span className={`absolute -top-2 -right-2 min-w-[24px] h-6 px-2 rounded-full flex items-center justify-center text-xs font-bold animate-bounce-in ${
                theme === "dark" ? "bg-green-500 text-white" : "bg-green-600 text-white"
              } shadow-lg`}>
                {cart.getTotalItems()}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4 text-center sm:text-left">
            <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${
              theme === "dark" ? "text-amber-300" : "text-amber-600"
            }`}>Menu Signature</p>
            <h1 className={`text-3xl font-bold sm:text-4xl ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}>Croquez dans le Sart-Tilman</h1>
            <p className={theme === "dark" ? "text-white/70" : "text-slate-600"}>
              Sélectionnez une catégorie pour découvrir nos créations craquantes
            </p>
          </div>

          {loading ? (
            <div className={`text-center py-8 ${
              theme === "dark" ? "text-white/70" : "text-slate-600"
            }`}>
              Chargement du menu...
            </div>
          ) : (
            <>
              <Tabs
                tabs={tabs}
                value={activeCategory}
                onValueChange={setActiveCategory}
                className="w-full"
              />

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentItems.map((item, index) => {
              const imageUrl = item.image || getItemImage(item.name, activeCategory, index);
              return (
              <Card
                key={`${activeCategory}-${index}-${item.name}`}
                className={item.highlight ? "border-amber-400/40 bg-white/10" : undefined}
                onClick={() => setSelectedItem(item)}
              >
                <div className="relative w-full h-48 overflow-hidden rounded-t-lg bg-slate-200 dark:bg-slate-800">
                  <Image
                    src={imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized
                    onError={(e) => {
                      // Fallback to a default placeholder if the original fails
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('/images/placeholders/')) {
                        target.src = `/images/placeholders/${activeCategory}-${index % 10}.jpg`;
                      }
                    }}
                  />
                </div>
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className={`text-2xl font-bold whitespace-nowrap ${
                      theme === "dark" ? "text-amber-300" : "text-amber-600"
                    }`}>
                      {item.price}
                    </span>
                    {item.highlight && (
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                        theme === "dark"
                          ? "bg-amber-400/20 text-amber-200"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        Coup de cœur
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      // If item has size options, open dialog. Otherwise add directly
                      const sizeOptions = getSizeOptions(item.price);
                      if (sizeOptions.length > 0) {
                        setSelectedItem(item);
                        setSelectedSize("");
                        setQuantity(1);
                      } else {
                        handleAddToCart(item, activeCategory, 1, "");
                      }
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter au panier
                  </Button>
                </CardContent>
              </Card>
            );
            }            )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Cart Sidebar */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/50"
            onClick={() => setCartOpen(false)}
          />
          <div className={`w-full max-w-md flex flex-col ${
            theme === "dark" ? "bg-slate-900" : "bg-white"
          } shadow-xl`}>
            <div className={`flex items-center justify-between p-4 border-b ${
              theme === "dark" ? "border-white/10" : "border-slate-200"
            }`}>
              <h2 className={`text-xl font-bold ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}>
                Panier ({cart.getTotalItems()})
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className={`p-2 rounded-lg ${
                  theme === "dark" ? "hover:bg-white/10" : "hover:bg-slate-100"
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.items.length === 0 ? (
                <p className={`text-center ${
                  theme === "dark" ? "text-white/70" : "text-slate-600"
                }`}>
                  Votre panier est vide
                </p>
              ) : (
                cart.items.map((item, index) => (
                  <div
                    key={index}
                    className={`flex gap-4 p-4 rounded-lg border ${
                      theme === "dark"
                        ? "border-white/10 bg-white/5"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image || getItemImage(item.name, item.categoryId || activeCategory, index)}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold ${
                        theme === "dark" ? "text-white" : "text-slate-900"
                      }`}>
                        {item.name}
                      </h3>
                      <p className={`text-sm ${
                        theme === "dark" ? "text-white/70" : "text-slate-600"
                      }`}>
                        {item.price}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => cart.updateQuantity(item.name, item.categoryId, item.quantity - 1)}
                          className={`p-1 rounded transition-all hover:scale-110 active:scale-95 ${
                            theme === "dark" ? "hover:bg-white/10" : "hover:bg-slate-200"
                          }`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className={`min-w-[32px] text-center font-semibold ${
                          theme === "dark" ? "text-white" : "text-slate-900"
                        }`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            cart.updateQuantity(item.name, item.categoryId, item.quantity + 1);
                            setToastMessage(`${item.name} (x${item.quantity + 1}) ajouté !`);
                            setToastVisible(true);
                          }}
                          className={`p-1 rounded transition-all hover:scale-110 active:scale-95 ${
                            theme === "dark" ? "hover:bg-white/10" : "hover:bg-slate-200"
                          }`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => cart.removeItem(item.name, item.categoryId)}
                      className={`p-2 rounded-lg ${
                        theme === "dark" ? "hover:bg-white/10 text-red-400" : "hover:bg-slate-200 text-red-600"
                      }`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.items.length > 0 && (
              <div className={`p-4 border-t space-y-4 ${
                theme === "dark" ? "border-white/10" : "border-slate-200"
              }`}>
                <div className="flex justify-between items-center">
                  <span className={`text-lg font-semibold ${
                    theme === "dark" ? "text-white" : "text-slate-900"
                  }`}>
                    Total:
                  </span>
                  <span className={`text-2xl font-bold ${
                    theme === "dark" ? "text-amber-300" : "text-amber-600"
                  }`}>
                    {cart.getTotalPrice()}
                  </span>
                </div>
                <Button
                  onClick={handleSendOrder}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
                >
                  <WhatsAppIcon size={24} className="mr-2" />
                  Commander sur WhatsApp
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Item Details Dialog */}
      {selectedItem && (
        <Dialog
          isOpen={!!selectedItem}
          onClose={() => {
            setSelectedItem(null);
            setQuantity(1);
            setSelectedSize("");
          }}
          title={selectedItem.name}
        >
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="relative w-full h-96 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800">
              <Image
                src={selectedItem.image || getItemImage(selectedItem.name, activeCategory, currentItems.findIndex(i => i.name === selectedItem.name))}
                alt={selectedItem.name}
                fill
                className="object-cover"
                sizes="100vw"
                unoptimized
                onError={(e) => {
                  // Fallback to a default placeholder if the original fails
                  const target = e.target as HTMLImageElement;
                  const itemIndex = currentItems.findIndex(i => i.name === selectedItem.name);
                  if (!target.src.includes('/images/placeholders/')) {
                    target.src = `/images/placeholders/${activeCategory}-${itemIndex % 10}.jpg`;
                  }
                }}
              />
            </div>
            
            <div className="space-y-4">
              <p className={`text-xl leading-relaxed ${
                theme === "dark" ? "text-white/90" : "text-slate-700"
              }`}>{selectedItem.description}</p>
              
              <div className="flex items-center gap-2">
                <span className={`text-4xl font-bold ${
                  theme === "dark" ? "text-amber-300" : "text-amber-600"
                }`}>{selectedItem.price}</span>
              </div>

              {/* Size Selection */}
              {getSizeOptions(selectedItem.price).length > 0 && (
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${
                    theme === "dark" ? "text-white" : "text-slate-900"
                  }`}>
                    Taille
                  </label>
                  <div className="flex gap-3">
                    {getSizeOptions(selectedItem.price).map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`flex-1 px-6 py-4 rounded-lg border-2 transition-all ${
                          selectedSize === size
                            ? theme === "dark"
                              ? "border-green-500 bg-green-500/20 text-green-400"
                              : "border-green-600 bg-green-50 text-green-700"
                            : theme === "dark"
                              ? "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                              : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                        } font-semibold`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${
                  theme === "dark" ? "text-white" : "text-slate-900"
                }`}>
                  Quantité
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                      theme === "dark"
                        ? "border-white/20 bg-white/5 text-white hover:bg-white/10"
                        : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className={`text-3xl font-bold min-w-[60px] text-center ${
                    theme === "dark" ? "text-white" : "text-slate-900"
                  }`}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                      theme === "dark"
                        ? "border-white/20 bg-white/5 text-white hover:bg-white/10"
                        : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <Button
                onClick={() => {
                  if (getSizeOptions(selectedItem.price).length > 0 && !selectedSize) {
                    alert("Veuillez sélectionner une taille");
                    return;
                  }
                  handleAddToCart(selectedItem, activeCategory, quantity, selectedSize);
                  setSelectedItem(null);
                  setQuantity(1);
                  setSelectedSize("");
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="h-5 w-5 mr-2" />
                Ajouter au panier {quantity > 1 && `(${quantity})`}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}

