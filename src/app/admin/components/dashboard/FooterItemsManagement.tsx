"use client";

import { Button } from "@/components/ui/button";
import { Plus, X, Edit, Trash2 } from "lucide-react";
import { MenuCategory } from "@/components/MenuSection";
import { useAlert } from "@/lib/useAlert";

type FooterItemData = {
  id: number;
  title: string;
  description?: string;
  icon?: string;
  link?: string;
  menu_category_id?: string;
  menu_item_name?: string;
  visible: boolean;
};

type NewFooterItemData = {
  title: string;
  description: string;
  icon: string;
  link: string;
  menu_category_id: string;
  menu_item_name: string;
  visible: boolean;
};

// Helper function to get visibility status color
function getVisibilityStatusColor(visible: boolean, theme: string): string {
  if (visible) {
    return theme === "dark" ? "text-green-400" : "text-green-600";
  }
  return theme === "dark" ? "text-red-400" : "text-red-600";
}

interface FooterItemsManagementProps {
  theme: string;
  footerItems: FooterItemData[];
  setFooterItems: (items: FooterItemData[]) => void;
  newFooterItem: NewFooterItemData;
  setNewFooterItem: (item: NewFooterItemData) => void;
  editingFooterItem: number | null;
  setEditingFooterItem: (id: number | null) => void;
  showMenuSelectorDialog: boolean;
  setShowMenuSelectorDialog: (show: boolean) => void;
  selectedCategory: MenuCategory | null;
  setSelectedCategory: (cat: MenuCategory | null) => void;
  menuData: MenuCategory[];
  formatPrice: (price: string | undefined) => string;
  loadFooterItems: () => Promise<void>;
}

export function FooterItemsManagement({
  theme,
  footerItems,
  setFooterItems,
  newFooterItem,
  setNewFooterItem,
  editingFooterItem,
  setEditingFooterItem,
  showMenuSelectorDialog,
  setShowMenuSelectorDialog,
  selectedCategory,
  setSelectedCategory,
  menuData,
  formatPrice,
  loadFooterItems,
}: FooterItemsManagementProps) {
  const { showAlert, showConfirm, AlertComponent } = useAlert();

  return (
    <div className={`mb-8 p-6 rounded-lg border ${
      theme === "dark"
        ? "border-white/10 bg-slate-900"
        : "border-slate-200 bg-slate-50"
    }`}>
      <h2 className={`text-xl font-semibold mb-4 ${
        theme === "dark" ? "text-white" : "text-slate-900"
      }`}>
        Éléments du Footer
      </h2>
      <p className={`text-sm mb-4 ${
        theme === "dark" ? "text-white/70" : "text-slate-600"
      }`}>
        Gérez les éléments affichés dans la section footer de la page d'accueil (au-dessus du bouton "Voir le menu complet").
      </p>

      {/* Existing Footer Items */}
      <div className="space-y-3 mb-6">
        {footerItems.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-lg border ${
              theme === "dark"
                ? "border-white/10 bg-white/5"
                : "border-slate-200 bg-white"
            }`}
          >
            {editingFooterItem === item.id ? (
              <div className="space-y-3">
                {(item.menu_category_id && item.menu_item_name) && (
                  <div className={`p-2 rounded border text-sm ${
                    theme === "dark"
                      ? "border-green-500/50 bg-green-500/10 text-green-400"
                      : "border-green-500 bg-green-50 text-green-700"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span>✓ Lié à un élément du menu: {item.menu_item_name}</span>
                      <Button
                        onClick={() => {
                          setFooterItems(footerItems.map(i => i.id === item.id ? {
                            ...i,
                            menu_category_id: undefined,
                            menu_item_name: undefined,
                            link: "",
                          } : i));
                        }}
                        variant="outline"
                        className="h-6 px-2 text-xs"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => setFooterItems(footerItems.map(i => i.id === item.id ? {...i, title: e.target.value} : i))}
                  placeholder="Titre"
                  className={`w-full px-3 py-2 rounded border text-sm ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5 text-white"
                      : "border-slate-300 bg-white text-slate-900"
                  }`}
                />
                <textarea
                  value={item.description || ""}
                  onChange={(e) => setFooterItems(footerItems.map(i => i.id === item.id ? {...i, description: e.target.value} : i))}
                  placeholder="Description (optionnel)"
                  rows={2}
                  className={`w-full px-3 py-2 rounded border text-sm ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5 text-white"
                      : "border-slate-300 bg-white text-slate-900"
                  }`}
                />
                <input
                  type="text"
                  value={item.icon || ""}
                  onChange={(e) => setFooterItems(footerItems.map(i => i.id === item.id ? {...i, icon: e.target.value} : i))}
                  placeholder="Icône (emoji, ex: 🍟)"
                  className={`w-full px-3 py-2 rounded border text-sm ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5 text-white"
                      : "border-slate-300 bg-white text-slate-900"
                  }`}
                />
                {!(item.menu_category_id && item.menu_item_name) && (
                  <input
                    type="text"
                    value={item.link || ""}
                    onChange={(e) => setFooterItems(footerItems.map(i => i.id === item.id ? {...i, link: e.target.value} : i))}
                    placeholder="Lien (optionnel, ex: /menu, https://..., tel:..., mailto:...)"
                    className={`w-full px-3 py-2 rounded border text-sm ${
                      theme === "dark"
                        ? "border-white/10 bg-white/5 text-white"
                        : "border-slate-300 bg-white text-slate-900"
                    }`}
                  />
                )}
                <div className="flex items-center gap-2">
                  <label className={`text-sm flex items-center gap-2 ${
                    theme === "dark" ? "text-white/90" : "text-slate-700"
                  }`}>
                    <input
                      type="checkbox"
                      checked={item.visible}
                      onChange={(e) => setFooterItems(footerItems.map(i => i.id === item.id ? {...i, visible: e.target.checked} : i))}
                      className="rounded"
                    />
                    Visible
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      const updated = footerItems.find(i => i.id === item.id);
                      if (updated) {
                        const response = await fetch(`/api/footer/${item.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify(updated),
                        });
                        if (response.ok) {
                          setEditingFooterItem(null);
                          await loadFooterItems();
                        }
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-sm"
                  >
                    Enregistrer
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingFooterItem(null);
                      loadFooterItems();
                    }}
                    variant="outline"
                    className="text-sm"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.icon && <span className="text-2xl">{item.icon}</span>}
                  <div>
                    <p className={`font-semibold ${
                      theme === "dark" ? "text-white" : "text-slate-900"
                    }`}>
                      {item.title}
                    </p>
                    {item.description && (
                      <p className={`text-sm ${
                        theme === "dark" ? "text-white/70" : "text-slate-600"
                      }`}>
                        {item.description}
                      </p>
                    )}
                    {item.menu_category_id && item.menu_item_name ? (
                      <p className={`text-xs ${
                        theme === "dark" ? "text-green-400" : "text-green-600"
                      }`}>
                        ✓ Lié au menu: {item.menu_item_name}
                      </p>
                    ) : item.link && (
                      <p className={`text-xs ${
                        theme === "dark" ? "text-white/50" : "text-slate-500"
                      }`}>
                        Lien: {item.link}
                      </p>
                    )}
                    <span className={`text-xs ${getVisibilityStatusColor(item.visible, theme)}`}>
                      {item.visible ? "Visible" : "Masqué"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setEditingFooterItem(item.id)}
                    variant="outline"
                    className="text-sm px-3 py-2"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={async () => {
                      showConfirm(
                        `Supprimer "${item.title}" ?`,
                        async () => {
                          const response = await fetch(`/api/footer/${item.id}`, {
                            method: "DELETE",
                            credentials: "include",
                          });
                          if (response.ok) {
                            await loadFooterItems();
                          }
                        },
                        undefined,
                        "Supprimer"
                      );
                    }}
                    variant="outline"
                    className="text-red-500 hover:text-red-700 text-sm px-3 py-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Footer Item */}
      <div className={`p-4 rounded-lg border ${
        theme === "dark"
          ? "border-white/10 bg-white/5"
          : "border-slate-200 bg-slate-50"
      }`}>
        <h3 className={`text-lg font-semibold mb-3 ${
          theme === "dark" ? "text-white" : "text-slate-900"
        }`}>
          Ajouter un élément
        </h3>
        <Button
          onClick={() => {
            setShowMenuSelectorDialog(true);
            setSelectedCategory(null);
          }}
          className="bg-green-600 hover:bg-green-700 mb-3 w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un élément du menu
        </Button>
        {(newFooterItem.title || newFooterItem.menu_category_id) && (
          <div className="space-y-3 mt-3">
            {newFooterItem.menu_category_id && newFooterItem.menu_item_name && (
              <div className={`p-2 rounded border text-sm ${
                theme === "dark"
                  ? "border-green-500/50 bg-green-500/10 text-green-400"
                  : "border-green-500 bg-green-50 text-green-700"
              }`}>
                <div className="flex items-center justify-between">
                  <span>✓ Lié à un élément du menu</span>
                  <Button
                    onClick={() => {
                      setNewFooterItem({
                        ...newFooterItem,
                        menu_category_id: "",
                        menu_item_name: "",
                        link: "",
                      });
                    }}
                    variant="outline"
                    className="h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            <input
              type="text"
              value={newFooterItem.title || ""}
              onChange={(e) => setNewFooterItem({...newFooterItem, title: e.target.value})}
              placeholder="Titre *"
              className={`w-full px-3 py-2 rounded border text-sm ${
                theme === "dark"
                  ? "border-white/10 bg-white/5 text-white"
                  : "border-slate-300 bg-white text-slate-900"
              }`}
            />
            <textarea
              value={newFooterItem.description || ""}
              onChange={(e) => setNewFooterItem({...newFooterItem, description: e.target.value})}
              placeholder="Description (optionnel)"
              rows={2}
              className={`w-full px-3 py-2 rounded border text-sm ${
                theme === "dark"
                  ? "border-white/10 bg-white/5 text-white"
                  : "border-slate-300 bg-white text-slate-900"
              }`}
            />
            <input
              type="text"
              value={newFooterItem.icon || ""}
              onChange={(e) => setNewFooterItem({...newFooterItem, icon: e.target.value})}
              placeholder="Icône (emoji, ex: 🍟, 📞, 📍)"
              className={`w-full px-3 py-2 rounded border text-sm ${
                theme === "dark"
                  ? "border-white/10 bg-white/5 text-white"
                  : "border-slate-300 bg-white text-slate-900"
              }`}
            />
            {!newFooterItem.menu_category_id && (
              <input
                type="text"
                value={newFooterItem.link || ""}
                onChange={(e) => setNewFooterItem({...newFooterItem, link: e.target.value})}
                placeholder="Lien (optionnel, ex: /menu, https://..., tel:+32..., mailto:...)"
                className={`w-full px-3 py-2 rounded border text-sm ${
                  theme === "dark"
                    ? "border-white/10 bg-white/5 text-white"
                    : "border-slate-300 bg-white text-slate-900"
                }`}
              />
            )}
            <div className="flex items-center gap-2">
              <label className={`text-sm flex items-center gap-2 ${
                theme === "dark" ? "text-white/90" : "text-slate-700"
              }`}>
                <input
                  type="checkbox"
                  checked={newFooterItem.visible !== false}
                  onChange={(e) => setNewFooterItem({...newFooterItem, visible: e.target.checked})}
                  className="rounded"
                />
                Visible
              </label>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  if (!newFooterItem.title?.trim()) {
                    await showAlert("Le titre est requis", "error");
                    return;
                  }
                  const response = await fetch("/api/footer", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(newFooterItem),
                  });
                  if (response.ok) {
                    setNewFooterItem({ title: "", description: "", icon: "", link: "", menu_category_id: "", menu_item_name: "", visible: true });
                    await loadFooterItems();
                  } else {
                    const error = await response.json().catch(() => ({}));
                    await showAlert(error.error || "Erreur lors de l'ajout", "error");
                  }
                }}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
              <Button
                onClick={() => {
                  setNewFooterItem({ title: "", description: "", icon: "", link: "", menu_category_id: "", menu_item_name: "", visible: true });
                }}
                variant="outline"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
      <AlertComponent />
    </div>
  );
}

