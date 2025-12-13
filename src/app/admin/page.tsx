"use client";

import { useTheme } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { LogOut, Plus, Eye, Search, ExternalLink, Lock, X, Edit, Trash2, ChevronUp } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useAdminDashboard } from "./hooks/useAdminDashboard";
import { SortableCategory } from "./components/SortableCategory";
import { StatusManagement } from "./components/StatusManagement";
import { PasswordChangeModal } from "./components/PasswordChangeModal";

// Old component definitions removed - now in ./components/

export default function AdminDashboard() {
  const { theme } = useTheme();
  const dashboard = useAdminDashboard();

  // All helper functions and handlers are now in useAdminDashboard hook
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (dashboard.loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === "dark" ? "bg-slate-950" : "bg-white"
      }`}>
        <p className={theme === "dark" ? "text-white" : "text-slate-900"}>
          Chargement...
        </p>
      </div>
    );
  }

  if (!dashboard.authenticated) {
    return null;
  }

  return (
    <div className={`min-h-screen ${
      theme === "dark" ? "bg-slate-950" : "bg-white"
    }`}>
      <header className={`sticky top-0 z-20 border-b ${
        theme === "dark"
          ? "border-white/10 bg-slate-950/70"
          : "border-slate-200 bg-white/70"
      } backdrop-blur`}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <h1 className={`text-2xl font-bold ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}>
            Panneau d'administration
          </h1>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-4 py-2 text-sm font-semibold transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                theme === "dark"
                  ? "text-white border-white/20 hover:bg-white/10"
                  : "text-slate-700 border-slate-300 hover:bg-slate-100"
              }`}
            >
              <ExternalLink className="h-4 w-4" />
              Voir le site web
            </a>
            <ThemeToggle ariaLabel="Changer le thème" />
            <button
              onClick={() => dashboard.setShowPasswordModal(true)}
              className={`inline-flex items-center gap-2 rounded-full border bg-transparent px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                theme === "dark"
                  ? "text-white border-white/20 hover:bg-white/10 focus-visible:outline-white"
                  : "text-slate-700 border-slate-300 hover:bg-slate-100 focus-visible:outline-slate-500"
              }`}
            >
              <Lock className="h-4 w-4" />
              Modifier le mot de passe
            </button>
            <button
              onClick={dashboard.handleLogout}
              className={`inline-flex items-center gap-2 rounded-full border bg-transparent px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                theme === "dark"
                  ? "text-white border-white/20 hover:bg-white/10 focus-visible:outline-white"
                  : "text-slate-700 border-slate-300 hover:bg-slate-100 focus-visible:outline-slate-500"
              }`}
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Summary Stats */}
        <div className={`mb-8 p-6 rounded-lg border ${
          theme === "dark"
            ? "border-white/10 bg-slate-900"
            : "border-slate-200 bg-slate-50"
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}>
            Vue d'ensemble
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-white/5" : "bg-white"
            }`}>
              <p className={`text-sm ${
                theme === "dark" ? "text-white/70" : "text-slate-600"
              }`}>
                Catégories
              </p>
              <p className={`text-3xl font-bold ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}>
                {dashboard.menuData.length}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-white/5" : "bg-white"
            }`}>
              <p className={`text-sm ${
                theme === "dark" ? "text-white/70" : "text-slate-600"
              }`}>
                Articles totaux
              </p>
              <p className={`text-3xl font-bold ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}>
                {dashboard.menuData.reduce((sum, cat) => sum + (cat.items?.length || 0), 0)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-white/5" : "bg-white"
            }`}>
              <p className={`text-sm ${
                theme === "dark" ? "text-white/70" : "text-slate-600"
              }`}>
                Statut
              </p>
              <p className={`text-2xl font-bold ${
                dashboard.status.isOpen 
                  ? (theme === "dark" ? "text-green-400" : "text-green-600")
                  : (theme === "dark" ? "text-red-400" : "text-red-600")
              }`}>
                {dashboard.status.isOpen ? "Ouvert" : "Fermé"}
              </p>
            </div>
          </div>
        </div>

        {/* Status Toggle */}
        <StatusManagement
          theme={theme}
          status={dashboard.status}
          onToggleStatus={dashboard.handleToggleStatus}
          onStatusMessageChange={dashboard.handleStatusMessageChange}
        />

        {/* Footer Items Management */}
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
            {dashboard.footerItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border ${
                  theme === "dark"
                    ? "border-white/10 bg-white/5"
                    : "border-slate-200 bg-white"
                }`}
              >
                {dashboard.editingFooterItem === item.id ? (
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
                              dashboard.setFooterItems(dashboard.footerItems.map(i => i.id === item.id ? {
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
                      onChange={(e) => dashboard.setFooterItems(dashboard.footerItems.map(i => i.id === item.id ? {...i, title: e.target.value} : i))}
                      placeholder="Titre"
                      className={`w-full px-3 py-2 rounded border text-sm ${
                        theme === "dark"
                          ? "border-white/10 bg-white/5 text-white"
                          : "border-slate-300 bg-white text-slate-900"
                      }`}
                    />
                    <textarea
                      value={item.description || ""}
                      onChange={(e) => dashboard.setFooterItems(dashboard.footerItems.map(i => i.id === item.id ? {...i, description: e.target.value} : i))}
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
                      onChange={(e) => dashboard.setFooterItems(dashboard.footerItems.map(i => i.id === item.id ? {...i, icon: e.target.value} : i))}
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
                        onChange={(e) => dashboard.setFooterItems(dashboard.footerItems.map(i => i.id === item.id ? {...i, link: e.target.value} : i))}
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
                          onChange={(e) => dashboard.setFooterItems(dashboard.footerItems.map(i => i.id === item.id ? {...i, visible: e.target.checked} : i))}
                          className="rounded"
                        />
                        Visible
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={async () => {
                          const updated = dashboard.footerItems.find(i => i.id === item.id);
                          if (updated) {
                            const response = await fetch(`/api/footer/${item.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              credentials: "include",
                              body: JSON.stringify(updated),
                            });
                            if (response.ok) {
                              dashboard.setEditingFooterItem(null);
                              await dashboard.loadFooterItems();
                            }
                          }
                        }}
                        className="bg-green-600 hover:bg-green-700 text-sm"
                      >
                        Enregistrer
                      </Button>
                      <Button
                        onClick={() => {
                          dashboard.setEditingFooterItem(null);
                          dashboard.loadFooterItems();
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
                        <span className={`text-xs ${
                          item.visible
                            ? theme === "dark" ? "text-green-400" : "text-green-600"
                            : theme === "dark" ? "text-red-400" : "text-red-600"
                        }`}>
                          {item.visible ? "Visible" : "Masqué"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => dashboard.setEditingFooterItem(item.id)}
                        variant="outline"
                        className="text-sm px-3 py-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={async () => {
                          if (confirm(`Supprimer "${item.title}" ?`)) {
                            const response = await fetch(`/api/footer/${item.id}`, {
                              method: "DELETE",
                              credentials: "include",
                            });
                            if (response.ok) {
                              await dashboard.loadFooterItems();
                            }
                          }
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
                dashboard.setShowMenuSelectorDialog(true);
                dashboard.setSelectedCategory(null);
              }}
              className="bg-green-600 hover:bg-green-700 mb-3 w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un élément du menu
            </Button>
            {(dashboard.newFooterItem.title || dashboard.newFooterItem.menu_category_id) && (
              <div className="space-y-3 mt-3">
                {dashboard.newFooterItem.menu_category_id && dashboard.newFooterItem.menu_item_name && (
                  <div className={`p-2 rounded border text-sm ${
                    theme === "dark"
                      ? "border-green-500/50 bg-green-500/10 text-green-400"
                      : "border-green-500 bg-green-50 text-green-700"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span>✓ Lié à un élément du menu</span>
                      <Button
                        onClick={() => {
                          dashboard.setNewFooterItem({
                            ...dashboard.newFooterItem,
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
                  value={dashboard.newFooterItem.title}
                  onChange={(e) => dashboard.setNewFooterItem({...dashboard.newFooterItem, title: e.target.value})}
                  placeholder="Titre *"
                  className={`w-full px-3 py-2 rounded border text-sm ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5 text-white"
                      : "border-slate-300 bg-white text-slate-900"
                  }`}
                />
                <textarea
                  value={dashboard.newFooterItem.description}
                  onChange={(e) => dashboard.setNewFooterItem({...dashboard.newFooterItem, description: e.target.value})}
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
                  value={dashboard.newFooterItem.icon}
                  onChange={(e) => dashboard.setNewFooterItem({...dashboard.newFooterItem, icon: e.target.value})}
                  placeholder="Icône (emoji, ex: 🍟, 📞, 📍)"
                  className={`w-full px-3 py-2 rounded border text-sm ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5 text-white"
                      : "border-slate-300 bg-white text-slate-900"
                  }`}
                />
                {!dashboard.newFooterItem.menu_category_id && (
                  <input
                    type="text"
                    value={dashboard.newFooterItem.link}
                    onChange={(e) => dashboard.setNewFooterItem({...dashboard.newFooterItem, link: e.target.value})}
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
                      checked={dashboard.newFooterItem.visible}
                      onChange={(e) => dashboard.setNewFooterItem({...dashboard.newFooterItem, visible: e.target.checked})}
                      className="rounded"
                    />
                    Visible
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      if (!dashboard.newFooterItem.title.trim()) {
                        alert("Le titre est requis");
                        return;
                      }
                      const response = await fetch("/api/footer", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify(dashboard.newFooterItem),
                      });
                      if (response.ok) {
                        dashboard.setNewFooterItem({ title: "", description: "", icon: "", link: "", menu_category_id: "", menu_item_name: "", visible: true });
                        await dashboard.loadFooterItems();
                      } else {
                        const error = await response.json().catch(() => ({}));
                        alert(error.error || "Erreur lors de l'ajout");
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                  <Button
                    onClick={() => {
                      dashboard.setNewFooterItem({ title: "", description: "", icon: "", link: "", menu_category_id: "", menu_item_name: "", visible: true });
                    }}
                    variant="outline"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add New Category */}
        <div className={`mb-8 p-6 rounded-lg border ${
          theme === "dark"
            ? "border-white/10 bg-slate-900"
            : "border-slate-200 bg-slate-50"
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}>
            Add New Category
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={dashboard.newCategory.label || ""}
              onChange={(e) => dashboard.setNewCategory({ label: e.target.value })}
              placeholder="Nom de la catégorie"
              className={`flex-1 px-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "border-white/10 bg-white/5 text-white"
                  : "border-slate-300 bg-white text-slate-900"
              }`}
            />
            <Button onClick={dashboard.handleAddCategory} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une catégorie
            </Button>
          </div>
        </div>

        {/* Add New Item (Global) */}
        <div className={`mb-8 p-6 rounded-lg border ${
          theme === "dark"
            ? "border-white/10 bg-slate-900"
            : "border-slate-200 bg-slate-50"
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}>
            Ajouter un nouvel article
          </h2>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === "dark" ? "text-white/90" : "text-slate-700"
              }`}>
                Catégorie *
              </label>
              <select
                value={dashboard.newItemCategoryId}
                onChange={(e) => dashboard.setNewItemCategoryId(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === "dark"
                    ? "border-white/10 bg-slate-800 text-white"
                    : "border-slate-300 bg-white text-slate-900"
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
                style={theme === "dark" ? {
                  colorScheme: "dark"
                } : undefined}
              >
                <option value="" className={theme === "dark" ? "bg-slate-800 text-white" : ""}>
                  Sélectionner une catégorie
                </option>
                {dashboard.menuData.map((cat) => (
                  <option 
                    key={cat.id} 
                    value={cat.id}
                    className={theme === "dark" ? "bg-slate-800 text-white" : ""}
                  >
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === "dark" ? "text-white/90" : "text-slate-700"
              }`}>
                Nom de l'article *
              </label>
              <input
                type="text"
                placeholder="Ex: Roi Dagobert"
                value={dashboard.newItem.name || ""}
                onChange={(e) => dashboard.setNewItem({ ...dashboard.newItem, name: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === "dark"
                    ? "border-white/10 bg-white/5 text-white placeholder-white/50"
                    : "border-slate-300 bg-white text-slate-900"
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-white/90" : "text-slate-700"
                }`}>
                  Prix *
                </label>
                <input
                  type="text"
                  placeholder="Ex: 5,50 - 6,50"
                  value={dashboard.newItem.price || ""}
                  onChange={(e) => {
                    const formatted = dashboard.formatPriceInput(e.target.value);
                    dashboard.setNewItem({ ...dashboard.newItem, price: formatted });
                  }}
                  onBlur={(e) => {
                    // Ensure euro symbol is present on blur
                    let value = e.target.value.trim();
                    if (value && !value.includes('€')) {
                      value = value + ' €';
                      dashboard.setNewItem({ ...dashboard.newItem, price: value });
                    }
                  }}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5 text-white placeholder-white/50"
                      : "border-slate-300 bg-white text-slate-900"
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-white/90" : "text-slate-700"
                }`}>
                  Image (optionnel)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        dashboard.setUploadingImage(true);
                        try {
                          // Create preview
                          const reader = new FileReader();
                          const previewPromise = new Promise<string>((resolve, reject) => {
                            reader.onloadend = () => {
                              if (reader.result) {
                                resolve(reader.result as string);
                              } else {
                                reject(new Error('Failed to read file'));
                              }
                            };
                            reader.onerror = () => reject(new Error('Failed to read file'));
                          });
                          reader.readAsDataURL(file);
                          const preview = await previewPromise;
                          dashboard.setImagePreview(preview);

                          // Upload file
                          const formData = new FormData();
                          formData.append("file", file);
                          
                          const response = await fetch("/api/upload", {
                            method: "POST",
                            credentials: "include",
                            body: formData,
                          });

                          if (response.ok) {
                            const data = await response.json();
                            dashboard.setNewItem({ ...dashboard.newItem, image: data.url });
                          } else {
                            const error = await response.json();
                            alert(error.error || "Erreur lors du téléchargement de l'image");
                          }
                        } catch (error) {
                          console.error("Upload error:", error);
                          alert("Erreur lors du téléchargement de l'image");
                        } finally {
                          dashboard.setUploadingImage(false);
                        }
                      }
                    }}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === "dark"
                        ? "border-white/10 bg-white/5 text-white"
                        : "border-slate-300 bg-white text-slate-900"
                    } focus:outline-none focus:ring-2 focus:ring-green-500`}
                    disabled={dashboard.uploadingImage}
                  />
                  {dashboard.imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <img
                        src={dashboard.imagePreview}
                        alt="Aperçu"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          dashboard.setImagePreview(null);
                          dashboard.setNewItem({ ...dashboard.newItem, image: undefined });
                        }}
                        className={`absolute top-2 right-2 p-2 rounded-full ${
                          theme === "dark"
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {dashboard.newItem.image && !dashboard.imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <img
                        src={dashboard.newItem.image}
                        alt="Image actuelle"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Ou entrez une URL d'image"
                    value={dashboard.newItem.image || ""}
                    onChange={(e) => {
                      dashboard.setNewItem({ ...dashboard.newItem, image: e.target.value });
                      dashboard.setImagePreview(null);
                    }}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === "dark"
                        ? "border-white/10 bg-white/5 text-white placeholder-white/50"
                        : "border-slate-300 bg-white text-slate-900"
                    } focus:outline-none focus:ring-2 focus:ring-green-500`}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === "dark" ? "text-white/90" : "text-slate-700"
              }`}>
                Description
              </label>
              <textarea
                placeholder="Description détaillée de l'article..."
                value={dashboard.newItem.description || ""}
                onChange={(e) => dashboard.setNewItem({ ...dashboard.newItem, description: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === "dark"
                    ? "border-white/10 bg-white/5 text-white placeholder-white/50"
                    : "border-slate-300 bg-white text-slate-900"
                } focus:outline-none focus:ring-2 focus:ring-green-500 resize-y`}
                rows={3}
              />
            </div>
            <Button
              onClick={dashboard.handleAddItem}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter l'article
            </Button>
          </div>
        </div>

        {/* All Items Sublist View */}
        <div className={`mb-8 p-6 rounded-lg border ${
          theme === "dark"
            ? "border-white/10 bg-slate-900"
            : "border-slate-200 bg-slate-50"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}>
              Liste de tous les articles ({dashboard.getAllItems().length})
            </h2>
            <Button
              onClick={() => dashboard.setShowAllItems(!dashboard.showAllItems)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {dashboard.showAllItems ? "Masquer" : "Afficher"}
            </Button>
          </div>

          {dashboard.showAllItems && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  theme === "dark" ? "text-white/50" : "text-slate-400"
                }`} />
                <input
                  type="text"
                  placeholder="Rechercher un article..."
                  value={dashboard.searchQuery}
                  onChange={(e) => dashboard.setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5 text-white placeholder-white/50"
                      : "border-slate-300 bg-white text-slate-900"
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {dashboard.filteredItems.length > 0 ? (
                  dashboard.filteredItems.map((item) => {
                    if (item.id === undefined) return null;
                    const category = dashboard.menuData.find(cat => cat.id === item.categoryId);
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
                          {item.image && (
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
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
                                <p className={`text-sm font-semibold ${
                                  theme === "dark" ? "text-amber-300" : "text-amber-600"
                                }`}>
                                  {dashboard.formatPrice(item.price)}
                                </p>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <Button
                                  onClick={() => {
                                    // Find the category and scroll to it, then trigger edit
                                    const categoryElement = document.querySelector(
                                      `[data-category-id="${item.categoryId}"]`
                                    );
                                    if (categoryElement) {
                                      categoryElement.scrollIntoView({ behavior: "smooth", block: "center" });
                                      // Trigger edit mode for this item
                                      setTimeout(() => {
                                        const itemElement = document.querySelector(
                                          `[data-item-id="${item.id}"]`
                                        );
                                        if (itemElement) {
                                          const editButton = itemElement.querySelector('button[aria-label="Edit"]') as HTMLButtonElement;
                                          editButton?.click();
                                        }
                                      }, 500);
                                    }
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
                                    if (item.id != null && typeof item.id === 'number' && confirm(`Êtes-vous sûr de vouloir supprimer "${item.name}" ?`)) {
                                      dashboard.handleDeleteItem(item.categoryId, item.id);
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
                    {dashboard.searchQuery ? "Aucun article trouvé" : "Aucun article disponible"}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Menu Categories */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={dashboard.handleDragEnd}>
          <SortableContext items={dashboard.menuData.map((cat) => cat.id)} strategy={verticalListSortingStrategy}>
            {dashboard.menuData && dashboard.menuData.length > 0 ? (
              dashboard.menuData.map((category) => (
                <SortableCategory
                  key={category.id}
                  category={category}
                  theme={theme}
                  editingState={{
                    editingCategory: dashboard.editingCategory,
                    editCategoryLabel: dashboard.editCategoryLabel,
                    setEditCategoryLabel: dashboard.setEditCategoryLabel,
                  }}
                  handlers={{
                    handleUpdateCategory: dashboard.handleUpdateCategory,
                    handleCancelEditCategory: dashboard.handleCancelEditCategory,
                    handleStartEditCategory: dashboard.handleStartEditCategory,
                    handleDeleteCategory: dashboard.handleDeleteCategory,
                    handleSaveItem: dashboard.handleSaveItem,
                    handleDeleteItem: dashboard.handleDeleteItem,
                  }}
                  uiState={{
                    isExpanded: dashboard.expandedCategories.has(category.id),
                    searchQuery: dashboard.searchQuery,
                    onToggleExpand: () => dashboard.toggleCategoryExpand(category.id),
                  }}
                  formatters={{
                    formatPrice: dashboard.formatPrice,
                  }}
                  filters={{
                    filterCategoryItems: dashboard.filterCategoryItems,
                  }}
                />
              ))
            ) : (
              <div className={`p-8 rounded-lg border text-center ${
                theme === "dark"
                  ? "border-white/10 bg-slate-900"
                  : "border-slate-200 bg-slate-50"
              }`}>
                <p className={`text-lg ${
                  theme === "dark" ? "text-white/70" : "text-slate-600"
                }`}>
                  Aucune catégorie. Ajoutez-en une pour commencer.
                </p>
              </div>
            )}
          </SortableContext>
        </DndContext>
      </main>

      {/* Password Change Modal */}
      <PasswordChangeModal
        theme={theme}
        isOpen={dashboard.showPasswordModal}
        currentPassword={dashboard.currentPassword}
        newPassword={dashboard.newPassword}
        confirmPassword={dashboard.confirmPassword}
        passwordError={dashboard.passwordError}
        changingPassword={dashboard.changingPassword}
        onCurrentPasswordChange={dashboard.setCurrentPassword}
        onNewPasswordChange={dashboard.setNewPassword}
        onConfirmPasswordChange={dashboard.setConfirmPassword}
        onChangePassword={dashboard.handleChangePassword}
        onClose={() => {
          dashboard.setShowPasswordModal(false);
          dashboard.setCurrentPassword("");
          dashboard.setNewPassword("");
          dashboard.setConfirmPassword("");
        }}
      />

      {/* Menu Item Selector Dialog */}
      <Dialog
        isOpen={dashboard.showMenuSelectorDialog}
        onClose={() => {
          dashboard.setShowMenuSelectorDialog(false);
          dashboard.setSelectedCategory(null);
        }}
        title={dashboard.selectedCategory ? "Sélectionner un élément" : "Sélectionner une catégorie"}
      >
        <div className="space-y-4">
          {!dashboard.selectedCategory ? (
            // Stage 1: Category Selection
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dashboard.menuData.map((category) => (
                <button
                  key={category.id}
                  onClick={() => dashboard.setSelectedCategory(category)}
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
                onClick={() => dashboard.setSelectedCategory(null)}
                className={`flex items-center gap-2 text-sm mb-4 ${
                  theme === "dark" ? "text-white/70 hover:text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ChevronUp className="h-4 w-4" />
                Retour aux catégories
              </button>
              <div className="max-h-[60vh] overflow-y-auto space-y-2">
                {dashboard.selectedCategory?.items?.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      // Auto-fill footer item form
                      dashboard.setNewFooterItem({
                        title: item.name,
                        description: item.description || "",
                        icon: "",
                        link: "",
                        menu_category_id: dashboard.selectedCategory!.id,
                        menu_item_name: item.name,
                        visible: true,
                      });
                      dashboard.setShowMenuSelectorDialog(false);
                      dashboard.setSelectedCategory(null);
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
                          <p className={`text-sm font-semibold ${
                            theme === "dark" ? "text-amber-300" : "text-amber-600"
                          }`}>
                            {dashboard.formatPrice(item.price)}
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
    </div>
  );
}

