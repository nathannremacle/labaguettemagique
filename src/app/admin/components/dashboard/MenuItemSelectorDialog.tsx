"use client";

import { Dialog } from "@/components/ui/dialog";
import { ChevronUp } from "lucide-react";
import { MenuCategory, MenuItem } from "@/components/MenuSection";

interface MenuItemSelectorDialogProps {
  theme: string;
  isOpen: boolean;
  onClose: () => void;
  menuData: MenuCategory[];
  selectedCategory: MenuCategory | null;
  setSelectedCategory: (cat: MenuCategory | null) => void;
  onItemSelect: (item: MenuItem, category: MenuCategory) => void;
  formatPrice: (price: string | undefined) => string;
}

export function MenuItemSelectorDialog({
  theme,
  isOpen,
  onClose,
  menuData,
  selectedCategory,
  setSelectedCategory,
  onItemSelect,
  formatPrice,
}: MenuItemSelectorDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={selectedCategory ? "Sélectionner un élément" : "Sélectionner une catégorie"}
    >
      <div className="space-y-4">
        {!selectedCategory ? (
          // Stage 1: Category Selection
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {menuData.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className={`p-4 rounded-lg border text-left transition-all hover:scale-105 ${
                  theme === "dark"
                    ? "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                    : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <h3 className={`font-semibold mb-1 ${
                  theme === "dark" ? "text-white" : "text-slate-900"
                }`}>
                  {category.label}
                </h3>
                <p className={`text-sm ${
                  theme === "dark" ? "text-white/70" : "text-slate-600"
                }`}>
                  {category.items?.length || 0} élément(s)
                </p>
              </button>
            ))}
          </div>
        ) : (
          // Stage 2: Item Selection
          <div className="space-y-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex items-center gap-2 text-sm mb-4 ${
                theme === "dark" ? "text-white/70 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ChevronUp className="h-4 w-4" />
              Retour aux catégories
            </button>
            <div className="max-h-[60vh] overflow-y-auto space-y-2">
              {selectedCategory?.items?.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onItemSelect(item, selectedCategory);
                    onClose();
                  }}
                  className={`w-full p-4 rounded-lg border text-left transition-all hover:scale-[1.02] ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                      : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-1 ${
                        theme === "dark" ? "text-white" : "text-slate-900"
                      }`}>
                        {item.name}
                      </h4>
                      {item.description && (
                        <p className={`text-sm mb-2 line-clamp-2 ${
                          theme === "dark" ? "text-white/70" : "text-slate-600"
                        }`}>
                          {item.description}
                        </p>
                      )}
                      {item.price && (
                        <p className={`text-sm font-semibold text-right ${
                          theme === "dark" ? "text-amber-300" : "text-amber-600"
                        }`}>
                          {formatPrice(item.price)}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}

