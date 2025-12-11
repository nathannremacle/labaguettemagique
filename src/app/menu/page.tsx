"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { getWhatsAppUrl } from "@/lib/website-data";
import { useTheme } from "@/components/ThemeProvider";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { useCart } from "@/contexts/CartContext";
import { MenuCategory, MenuItem } from "@/components/MenuSection";
import { ShoppingCart, Plus, Minus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Toast } from "@/components/ui/toast";
import { cn, createSlug } from "@/lib/utils";

// Helper function to get local placeholder image based on category and item index
function getItemImage(itemName: string, category: string, itemIndex: number): string {
  // Use local placeholder images from the placeholders folder
  // Format: /images/placeholders/{category}-{index}.jpg
  return `/images/placeholders/${category}-${itemIndex}.jpg`;
}

// Helper function to format price with euro symbol
function formatPrice(price: string | undefined): string {
  if (!price) return "";
  if (price.includes("€")) return price;
  return `${price} €`;
}

export default function MenuPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [menuData, setMenuData] = useState<MenuCategory[]>([]);
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
  const [highlightedItem, setHighlightedItem] = useState<string | null>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const cartButtonRef = useRef<HTMLButtonElement>(null);
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
        // Log error but don't expose details to user
        console.error("Failed to load menu:", error);
        // Keep empty state on error - user will see empty menu
        setMenuData([]);
      } finally {
        setLoading(false);
      }
    };

    loadMenuData();
  }, []);

  // Helper function to find item by slug
  const findItemBySlug = (categorySlug: string, itemSlug: string): { category: MenuCategory | null; item: MenuItem | null } => {
    // First try to find category by matching slug
    let category = menuData.find(cat => createSlug(cat.id) === categorySlug);
    
    // If not found, try matching by id directly
    if (!category) {
      category = menuData.find(cat => cat.id === categorySlug);
    }
    
    if (!category) {
      return { category: null, item: null };
    }
    
    // Find item by matching slug of name
    let item = category.items?.find(i => createSlug(i.name) === itemSlug);
    
    // If not found, try case-insensitive name match
    if (!item) {
      item = category.items?.find(i => i.name.toLowerCase() === itemSlug.toLowerCase());
    }
    
    return { category, item: item || null };
  };

  // Handle deep linking from URL path or query parameters
  useEffect(() => {
    if (!loading && menuData.length > 0) {
      let categoryParam: string | null = null;
      let itemParam: string | null = null;
      
      // Check if we're on a path-based route like /menu/[category]/[item]
      const pathParts = pathname.split("/").filter(Boolean);
      if (pathParts.length >= 3 && pathParts[0] === "menu") {
        // Extract category and item from path
        categoryParam = pathParts[1];
        itemParam = pathParts[2];
      } else {
        // Fall back to query parameters for backward compatibility
        itemParam = searchParams.get("item");
        categoryParam = searchParams.get("category");
      }
      
      if (itemParam && categoryParam) {
        const { category, item } = findItemBySlug(categoryParam, itemParam);
        
        if (category && item) {
          // Switch to the category
          setActiveCategory(category.id);
          
          // Small delay to ensure category switch and rendering
          setTimeout(() => {
            // Scroll to item
            const itemKey = `${category.id}-${item.name}`;
            const itemElement = itemRefs.current.get(itemKey);
            if (itemElement) {
              itemElement.scrollIntoView({ 
                behavior: "smooth", 
                block: "center" 
              });
              
              // Highlight the item
              setHighlightedItem(itemKey);
              setTimeout(() => setHighlightedItem(null), 2000);
            }
            
            // Open the item dialog (focus mode)
            setSelectedItem(item);
            setQuantity(1);
            setSelectedSize("");
          }, 300);
        }
      }
    }
  }, [loading, menuData, searchParams, pathname]);

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
          ) : menuData.length === 0 ? (
            <div className={`text-center py-16 ${
              theme === "dark" ? "text-white/70" : "text-slate-600"
            }`}>
              <p className="text-lg mb-2">Aucun menu disponible</p>
              <p className="text-sm">Le menu sera bientôt disponible.</p>
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
              const itemKey = `${activeCategory}-${item.name}`;
              const isHighlighted = highlightedItem === itemKey;
              return (
              <div
                key={itemKey}
                ref={(el) => {
                  if (el) {
                    itemRefs.current.set(itemKey, el);
                  } else {
                    itemRefs.current.delete(itemKey);
                  }
                }}
                className={isHighlighted ? "ring-2 ring-amber-400 ring-offset-2 rounded-2xl transition-all" : ""}
              >
              <Card
                className={cn(
                  item.highlight ? "border-amber-400/40 bg-white/10" : undefined,
                  "cursor-pointer"
                )}
                onClick={() => {
                  // Navigate to the item URL and open dialog
                  const categorySlug = createSlug(activeCategory);
                  const itemSlug = createSlug(item.name);
                  router.push(`/menu/${categorySlug}/${itemSlug}`);
                  setSelectedItem(item);
                  setQuantity(1);
                  setSelectedSize("");
                }}
              >
                <div className="relative w-full h-48 overflow-hidden rounded-t-lg bg-slate-200 dark:bg-slate-800">
                  <Image
                    src={imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized={true}
                    priority={false}
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
                      {formatPrice(item.price)}
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
                  <button
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
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 text-sm font-semibold transition-all hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter au panier
                  </button>
                </CardContent>
              </Card>
              </div>
            );
            }            )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Cart Dialog */}
      <Dialog
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        title={`Panier (${cart.getTotalItems()})`}
      >
        <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
          {/* Cart Items */}
          <div className="space-y-4">
            {cart.items.length === 0 ? (
              <div className={`text-center py-12 ${
                theme === "dark" ? "text-white/70" : "text-slate-600"
              }`}>
                <ShoppingCart className={`h-16 w-16 mx-auto mb-4 ${
                  theme === "dark" ? "text-white/20" : "text-slate-300"
                }`} />
                <p className="text-lg font-semibold mb-2">Votre panier est vide</p>
                <p className="text-sm">Ajoutez des articles pour commencer votre commande</p>
              </div>
            ) : (
              cart.items.map((item, index) => (
                <div
                  key={index}
                  className={`flex gap-4 p-4 sm:p-5 rounded-xl border ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image || getItemImage(item.name, item.categoryId || activeCategory, index)}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-base sm:text-lg mb-1 ${
                      theme === "dark" ? "text-white" : "text-slate-900"
                    }`}>
                      {item.name}
                    </h3>
                    <p className={`text-sm sm:text-base mb-3 ${
                      theme === "dark" ? "text-white/70" : "text-slate-600"
                    }`}>
                      {formatPrice(item.price)}
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => cart.updateQuantity(item.name, item.categoryId, item.quantity - 1)}
                        className={cn(
                          "w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 flex items-center justify-center transition-all",
                          "touch-manipulation active:scale-90",
                          theme === "dark"
                            ? "border-white/20 bg-white/5 text-white hover:bg-white/10 active:bg-white/20"
                            : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50 active:bg-slate-100"
                        )}
                        aria-label="Diminuer la quantité"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                      <span className={`min-w-[40px] text-center font-bold text-lg sm:text-xl ${
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
                        className={cn(
                          "w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 flex items-center justify-center transition-all",
                          "touch-manipulation active:scale-90",
                          theme === "dark"
                            ? "border-white/20 bg-white/5 text-white hover:bg-white/10 active:bg-white/20"
                            : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50 active:bg-slate-100"
                        )}
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => cart.removeItem(item.name, item.categoryId)}
                    className={cn(
                      "p-2 sm:p-3 rounded-xl transition-all",
                      "touch-manipulation active:scale-90",
                      theme === "dark" 
                        ? "hover:bg-white/10 text-red-400 active:bg-white/20" 
                        : "hover:bg-slate-200 text-red-600 active:bg-slate-300"
                    )}
                    aria-label="Retirer du panier"
                  >
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {cart.items.length > 0 && (
            <div className={`pt-6 border-t space-y-4 sm:space-y-6 ${
              theme === "dark" ? "border-white/10" : "border-slate-200"
            }`}>
              <div className="flex justify-between items-center">
                <span className={`text-lg sm:text-xl font-semibold ${
                  theme === "dark" ? "text-white" : "text-slate-900"
                }`}>
                  Total:
                </span>
                <span className={`text-2xl sm:text-3xl font-bold ${
                  theme === "dark" ? "text-amber-300" : "text-amber-600"
                }`}>
                  {cart.getTotalPrice()}
                </span>
              </div>
              <Button
                onClick={handleSendOrder}
                className={cn(
                  "w-full bg-green-600 hover:bg-green-700 text-white",
                  "text-base sm:text-lg font-semibold py-4 sm:py-6",
                  "transition-all hover:scale-[1.02] active:scale-95",
                  "touch-manipulation min-h-[56px]",
                  "shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40",
                  "flex items-center justify-center gap-2"
                )}
              >
                <WhatsAppIcon size={24} />
                Commander sur WhatsApp
              </Button>
            </div>
          )}
        </div>
      </Dialog>

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
          <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
            {/* Image */}
            <div className="relative w-full h-64 sm:h-96 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-lg">
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
            
            <div className="space-y-4 sm:space-y-5">
              {/* Description */}
              {selectedItem.description && (
                <p className={`text-base sm:text-lg leading-relaxed ${
                  theme === "dark" ? "text-white/90" : "text-slate-700"
                }`}>
                  {selectedItem.description}
                </p>
              )}
              
              {/* Price */}
              <div className="flex items-center gap-2 pb-2">
                <span className={`text-3xl sm:text-4xl font-bold ${
                  theme === "dark" ? "text-amber-300" : "text-amber-600"
                }`}>
                  {formatPrice(selectedItem.price)}
                </span>
              </div>

              {/* Size Selection */}
              {getSizeOptions(selectedItem.price).length > 0 && (
                <div>
                  <label className={`block text-sm sm:text-base font-semibold mb-3 ${
                    theme === "dark" ? "text-white" : "text-slate-900"
                  }`}>
                    Taille
                  </label>
                  <div className="flex gap-2 sm:gap-3">
                    {getSizeOptions(selectedItem.price).map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 transition-all",
                          "min-h-[48px] touch-manipulation",
                          "active:scale-95",
                          selectedSize === size
                            ? theme === "dark"
                              ? "border-green-500 bg-green-500/20 text-green-400 shadow-lg shadow-green-500/20"
                              : "border-green-600 bg-green-50 text-green-700 shadow-lg shadow-green-600/20"
                            : theme === "dark"
                              ? "border-white/20 bg-white/5 text-white/70 hover:border-white/40 active:bg-white/10"
                              : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 active:bg-slate-50",
                          "font-semibold text-sm sm:text-base"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div>
                <label className={`block text-sm sm:text-base font-semibold mb-3 ${
                  theme === "dark" ? "text-white" : "text-slate-900"
                }`}>
                  Quantité
                </label>
                <div className="flex items-center gap-4 sm:gap-6">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={cn(
                      "w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 flex items-center justify-center transition-all",
                      "touch-manipulation active:scale-90",
                      theme === "dark"
                        ? "border-white/20 bg-white/5 text-white hover:bg-white/10 active:bg-white/20"
                        : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50 active:bg-slate-100"
                    )}
                    aria-label="Diminuer la quantité"
                  >
                    <Minus className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                  <span className={`text-2xl sm:text-3xl font-bold min-w-[60px] sm:min-w-[80px] text-center ${
                    theme === "dark" ? "text-white" : "text-slate-900"
                  }`}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className={cn(
                      "w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 flex items-center justify-center transition-all",
                      "touch-manipulation active:scale-90",
                      theme === "dark"
                        ? "border-white/20 bg-white/5 text-white hover:bg-white/10 active:bg-white/20"
                        : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50 active:bg-slate-100"
                    )}
                    aria-label="Augmenter la quantité"
                  >
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
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
                className={cn(
                  "w-full inline-flex items-center justify-center gap-2 rounded-full",
                  "bg-green-600 hover:bg-green-700 text-white",
                  "px-6 py-4 sm:py-5 text-base sm:text-lg font-semibold",
                  "transition-all hover:scale-[1.02] active:scale-95",
                  "touch-manipulation min-h-[56px]",
                  "shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
                )}
              >
                <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                <span>Ajouter au panier {quantity > 1 && `(${quantity})`}</span>
              </button>
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

