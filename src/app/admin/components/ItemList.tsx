"use client";

import { MenuItem } from "@/components/MenuSection";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ItemListProps {
  items: MenuItem[];
  theme: string;
  categoryId: string;
  searchQuery: string;
  formatPrice: (price: string | undefined) => string;
  handleDeleteItem: (categoryId: string, itemId: number) => void;
  onToggleExpand: () => void;
  onEditItem: (itemId: number) => void;
}

export function ItemList({
  items,
  theme,
  categoryId,
  searchQuery,
  formatPrice,
  handleDeleteItem,
  onToggleExpand,
  onEditItem,
}: ItemListProps) {
  if (items.length === 0) {
    return (
      <p className={`text-sm italic ${
        theme === "dark" ? "text-white/50" : "text-slate-500"
      }`}>
        {searchQuery ? "Aucun article trouvé dans cette catégorie" : "Vide"}
      </p>
    );
  }

  return (
    <>
      {items.map((item, index) => {
        const itemKey = item.id != null && typeof item.id === 'number' ? item.id : `item-${index}`;
        
        return (
          <div
            key={itemKey}
            data-item-id={item.id}
            className={`p-4 rounded-lg border ${
              theme === "dark"
                ? "border-white/10 bg-white/5"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-start gap-4">
              {item.image && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name || "Image de l'article"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${
                      theme === "dark" ? "text-white" : "text-slate-900"
                    }`}>
                      {item.name || "Article sans nom"}
                    </h3>
                    {item.description && (
                      <p className={`text-sm mb-2 ${
                        theme === "dark" ? "text-white/70" : "text-slate-600"
                      } line-clamp-2`}>
                        {item.description}
                      </p>
                    )}
                    {item.price && (
                      <p className={`text-sm font-semibold ${
                        theme === "dark" ? "text-amber-300" : "text-amber-600"
                      }`}>
                        {formatPrice(item.price)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {item.id != null && typeof item.id === 'number' ? (
                      <>
                        <Button
                          onClick={() => {
                            onToggleExpand();
                            setTimeout(() => {
                              onEditItem(item.id!);
                            }, 100);
                          }}
                          variant="outline"
                          className={`text-sm px-3 py-2 ${
                            theme === "dark" 
                              ? "border-white/20 text-white hover:bg-white/10" 
                              : "border-slate-300 text-slate-700 hover:bg-slate-100"
                          }`}
                          aria-label="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            if (item.id != null && typeof item.id === 'number' && confirm(`Êtes-vous sûr de vouloir supprimer "${item.name || 'cet article'}" ?`)) {
                              handleDeleteItem(categoryId, item.id);
                            }
                          }}
                          variant="outline"
                          className={`text-sm px-3 py-2 ${
                            theme === "dark"
                              ? "text-red-400 hover:text-red-300 border-white/20 hover:bg-red-500/10"
                              : "text-red-500 hover:text-red-700 border-slate-300 hover:bg-red-50"
                          }`}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <span className={`text-xs italic ${
                        theme === "dark" ? "text-white/50" : "text-slate-500"
                      }`}>
                        ID manquant
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}


