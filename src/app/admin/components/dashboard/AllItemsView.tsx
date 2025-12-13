"use client";

import { Button } from "@/components/ui/button";
import { Eye, Search, Edit, Trash2 } from "lucide-react";
import { MenuCategory, MenuItem } from "@/components/MenuSection";
import { useAlert } from "@/lib/useAlert";

type ExtendedMenuItem = MenuItem & {
  categoryId: string;
  categoryLabel: string;
};

interface AllItemsViewProps {
  theme: string;
  showAllItems: boolean;
  setShowAllItems: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredItems: ExtendedMenuItem[];
  menuData: MenuCategory[];
  formatPrice: (price: string | undefined) => string;
  handleDeleteItem: (categoryId: string, itemId: number) => void;
  getAllItems: () => ExtendedMenuItem[];
  onEditItem: (categoryId: string, itemId: number) => void;
}

export function AllItemsView({
  theme,
  showAllItems,
  setShowAllItems,
  searchQuery,
  setSearchQuery,
  filteredItems,
  menuData,
  formatPrice,
  handleDeleteItem,
  getAllItems,
  onEditItem,
}: AllItemsViewProps) {
  const { showConfirm, AlertComponent } = useAlert();

  return (
    <div className={`mb-8 p-6 rounded-lg border ${
      theme === "dark"
        ? "border-white/10 bg-slate-900"
        : "border-slate-200 bg-slate-50"
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl font-semibold ${
          theme === "dark" ? "text-white" : "text-slate-900"
        }`}>
          Liste de tous les articles ({getAllItems().length})
        </h2>
        <Button
          onClick={() => setShowAllItems(!showAllItems)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          {showAllItems ? "Masquer" : "Afficher"}
        </Button>
      </div>

      {showAllItems && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
              theme === "dark" ? "text-white/50" : "text-slate-400"
            }`} />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "border-white/10 bg-white/5 text-white placeholder-white/50"
                  : "border-slate-300 bg-white text-slate-900"
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>

          {/* Items List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => {
                if (item.id === undefined) return null;
                const category = menuData.find(cat => cat.id === item.categoryId);
                return (
                  <div
                    key={`${item.categoryId}-${item.id}`}
                    className={`p-4 rounded-lg border ${
                      theme === "dark"
                        ? "border-white/10 bg-white/5"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-700">
                        <img
                          src={item.image || `/images/placeholders/${item.categoryId}-${index % 10}.jpg`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.src.includes('/images/placeholders/')) {
                              target.src = `/images/placeholders/${item.categoryId}-${index % 10}.jpg`;
                            } else {
                              target.style.display = 'none';
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-semibold ${
                                theme === "dark" ? "text-white" : "text-slate-900"
                              }`}>
                                {item.name}
                              </h3>
                              <span className={`text-xs px-2 py-1 rounded ${
                                theme === "dark"
                                  ? "bg-white/10 text-white/70"
                                  : "bg-slate-100 text-slate-600"
                              }`}>
                                {item.categoryLabel}
                              </span>
                            </div>
                            <p className={`text-sm mb-2 ${
                              theme === "dark" ? "text-white/70" : "text-slate-600"
                            } line-clamp-2`}>
                              {item.description}
                            </p>
                            <p className={`text-sm font-semibold text-right ${
                              theme === "dark" ? "text-amber-300" : "text-amber-600"
                            }`}>
                              {formatPrice(item.price)}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              onClick={() => {
                                onEditItem(item.categoryId, item.id!);
                              }}
                              variant="outline"
                              className={`text-sm px-3 py-2 ${
                                theme === "dark" 
                                  ? "border-white/20 text-white hover:bg-white/10" 
                                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                if (item.id != null && typeof item.id === 'number') {
                                  showConfirm(
                                    `Êtes-vous sûr de vouloir supprimer "${item.name}" ?`,
                                    () => handleDeleteItem(item.categoryId, item.id!),
                                    undefined,
                                    "Supprimer"
                                  );
                                }
                              }}
                              variant="outline"
                              className={`text-sm px-3 py-2 ${
                                theme === "dark"
                                  ? "text-red-400 hover:text-red-300 border-white/20 hover:bg-red-500/10"
                                  : "text-red-500 hover:text-red-700 border-slate-300 hover:bg-red-50"
                              }`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={`p-8 text-center ${
                theme === "dark" ? "text-white/70" : "text-slate-600"
              }`}>
                {searchQuery ? "Aucun article trouvé" : "Aucun article disponible"}
              </div>
            )}
          </div>
        </div>
      )}
      <AlertComponent />
    </div>
  );
}

