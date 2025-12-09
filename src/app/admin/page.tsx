"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MenuSection, MenuCategory, MenuItem } from "@/components/MenuSection";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { EditableMenuItem } from "@/components/admin/EditableMenuItem";
import { LogOut, Plus, ToggleLeft, ToggleRight, Edit, Save, X, Sun, Moon } from "lucide-react";

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuData, setMenuData] = useState<MenuCategory[]>([]);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({});
  const [newItemCategoryId, setNewItemCategoryId] = useState<string>("");
  const [newCategory, setNewCategory] = useState({ label: "" });
  const [status, setStatus] = useState({ isOpen: true, message: "" });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryLabel, setEditCategoryLabel] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/verify");
      const data = await response.json();
      
      if (data.authenticated) {
        setAuthenticated(true);
        loadMenuData();
        loadStatus();
      } else {
        router.push("/admin/login");
      }
    } catch (error) {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const getToken = () => {
    if (typeof document === "undefined") return "";
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin_token="))
      ?.split("=")[1] || "";
  };

  const loadMenuData = async () => {
    try {
      const response = await fetch("/api/menu", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Loaded menu data:", data);
        console.log("Number of categories:", data?.length || 0);
        
        // Check if data is an array and has content
        if (Array.isArray(data) && data.length > 0) {
          // Ensure all categories have items array
          const normalizedData = data.map((cat: MenuCategory) => ({
            ...cat,
            items: cat.items || [],
          }));
          setMenuData(normalizedData);
        } else {
          console.warn("Menu data is empty or not an array, using default data");
          // Import default menu data as fallback
          const { menuData: defaultMenuData } = await import("@/components/MenuSection");
          const normalizedData = defaultMenuData.map((cat: MenuCategory) => ({
            ...cat,
            items: cat.items || [],
          }));
          setMenuData(normalizedData);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to load menu:", response.status, errorData);
        // Fallback to default data if API fails
        const { menuData: defaultMenuData } = await import("@/components/MenuSection");
        const normalizedData = defaultMenuData.map((cat: MenuCategory) => ({
          ...cat,
          items: cat.items || [],
        }));
        setMenuData(normalizedData);
      }
    } catch (error) {
      console.error("Failed to load menu:", error);
      // Fallback to default data on error
      try {
        const { menuData: defaultMenuData } = await import("@/components/MenuSection");
        const normalizedData = defaultMenuData.map((cat: MenuCategory) => ({
          ...cat,
          items: cat.items || [],
        }));
        setMenuData(normalizedData);
      } catch (importError) {
        console.error("Failed to load default menu data:", importError);
      }
    }
  };

  const loadStatus = async () => {
    try {
      const response = await fetch("/api/status");
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Failed to load status:", error);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = { ...status, isOpen: !status.isOpen };
    try {
      const response = await fetch("/api/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStatus),
      });
      if (response.ok) {
        setStatus(newStatus);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleStatusMessageChange = async (message: string) => {
    const newStatus = { ...status, message };
    try {
      const response = await fetch("/api/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStatus),
      });
      if (response.ok) {
        setStatus(newStatus);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const handleSaveItem = async (
    categoryId: string,
    itemIndex: number,
    item: MenuItem
  ) => {
    try {
      const response = await fetch(
        `/api/menu/categories/${categoryId}/items/${itemIndex}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(item),
        }
      );

      if (response.ok) {
        await loadMenuData();
      } else {
        console.error("Failed to save item:", response.status);
      }
    } catch (error) {
      console.error("Failed to save item:", error);
    }
  };

  const handleDeleteItem = async (categoryId: string, itemIndex: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(
        `/api/menu/categories/${categoryId}/items/${itemIndex}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        await loadMenuData();
      } else {
        console.error("Failed to delete item:", response.status);
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const handleAddItem = async () => {
    if (!newItemCategoryId) {
      alert("Veuillez sélectionner une catégorie");
      return;
    }
    if (!newItem.name || !newItem.price) {
      alert("Veuillez remplir au moins le nom et le prix");
      return;
    }
    
    try {
      const response = await fetch(
        `/api/menu/categories/${newItemCategoryId}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(newItem),
        }
      );

      if (response.ok) {
        setNewItem({});
        setNewItemCategoryId("");
        await loadMenuData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to add item:", response.status, errorData);
        alert("Erreur lors de l'ajout de l'article");
      }
    } catch (error) {
      console.error("Failed to add item:", error);
      alert("Erreur lors de l'ajout de l'article");
    }
  };

  const handleUpdateCategory = async (categoryId: string) => {
    try {
      const response = await fetch(
        `/api/menu/categories/${categoryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ label: editCategoryLabel }),
        }
      );

      if (response.ok) {
        setEditingCategory(null);
        setEditCategoryLabel("");
        await loadMenuData();
      } else {
        console.error("Failed to update category:", response.status);
      }
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  const handleStartEditCategory = (category: MenuCategory) => {
    setEditingCategory(category.id);
    setEditCategoryLabel(category.label);
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryLabel("");
  };

  const handleAddCategory = async () => {
    try {
      const response = await fetch("/api/menu/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        setNewCategory({ label: "" });
        await loadMenuData();
      } else {
        console.error("Failed to add category:", response.status);
      }
    } catch (error) {
      console.error("Failed to add category:", error);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === "dark" ? "bg-slate-950" : "bg-white"
      }`}>
        <p className={theme === "dark" ? "text-white" : "text-slate-900"}>
          Loading...
        </p>
      </div>
    );
  }

  if (!authenticated) {
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
            Admin Panel
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition ${
                theme === "dark"
                  ? "text-white/70 hover:text-white hover:bg-white/10"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
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
                {menuData.length}
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
                {menuData.reduce((sum, cat) => sum + (cat.items?.length || 0), 0)}
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
                status.isOpen 
                  ? theme === "dark" ? "text-green-400" : "text-green-600"
                  : theme === "dark" ? "text-red-400" : "text-red-600"
              }`}>
                {status.isOpen ? "Ouvert" : "Fermé"}
              </p>
            </div>
          </div>
        </div>

        {/* Status Toggle */}
        <div className={`mb-8 p-6 rounded-lg border ${
          theme === "dark"
            ? "border-white/10 bg-slate-900"
            : "border-slate-200 bg-slate-50"
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}>
            Statut du Restaurant
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                status.isOpen
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {status.isOpen ? (
                <ToggleRight className="h-5 w-5" />
              ) : (
                <ToggleLeft className="h-5 w-5" />
              )}
              <span>{status.isOpen ? "Ouvert" : "Fermé"}</span>
            </button>
            {!status.isOpen && (
              <input
                type="text"
                value={status.message || ""}
                onChange={(e) => handleStatusMessageChange(e.target.value)}
                placeholder="Message de fermeture (optionnel)"
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  theme === "dark"
                    ? "border-white/10 bg-white/5 text-white"
                    : "border-slate-300 bg-white text-slate-900"
                }`}
              />
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
              value={newCategory.label || ""}
              onChange={(e) => setNewCategory({ label: e.target.value })}
              placeholder="Category name"
              className={`flex-1 px-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "border-white/10 bg-white/5 text-white"
                  : "border-slate-300 bg-white text-slate-900"
              }`}
            />
            <Button onClick={handleAddCategory} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
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
                value={newItemCategoryId}
                onChange={(e) => setNewItemCategoryId(e.target.value)}
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
                {menuData.map((cat) => (
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
                value={newItem.name || ""}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
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
                  placeholder="Ex: 5,50 € - 6,50 €"
                  value={newItem.price || ""}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
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
                        setUploadingImage(true);
                        try {
                          // Create preview
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImagePreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);

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
                            setNewItem({ ...newItem, image: data.url });
                          } else {
                            const error = await response.json();
                            alert(error.error || "Erreur lors du téléchargement de l'image");
                          }
                        } catch (error) {
                          console.error("Upload error:", error);
                          alert("Erreur lors du téléchargement de l'image");
                        } finally {
                          setUploadingImage(false);
                        }
                      }
                    }}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === "dark"
                        ? "border-white/10 bg-white/5 text-white"
                        : "border-slate-300 bg-white text-slate-900"
                    } focus:outline-none focus:ring-2 focus:ring-green-500`}
                    disabled={uploadingImage}
                  />
                  {imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setNewItem({ ...newItem, image: undefined });
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
                  {newItem.image && !imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <img
                        src={newItem.image}
                        alt="Current"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Ou entrez une URL d'image"
                    value={newItem.image || ""}
                    onChange={(e) => {
                      setNewItem({ ...newItem, image: e.target.value });
                      setImagePreview(null);
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
                value={newItem.description || ""}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === "dark"
                    ? "border-white/10 bg-white/5 text-white placeholder-white/50"
                    : "border-slate-300 bg-white text-slate-900"
                } focus:outline-none focus:ring-2 focus:ring-green-500 resize-y`}
                rows={3}
              />
            </div>
            <Button
              onClick={handleAddItem}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter l'article
            </Button>
          </div>
        </div>

        {/* Menu Categories */}
        {menuData && menuData.length > 0 ? (
          menuData.map((category) => (
          <div
            key={category.id}
            className={`mb-8 p-6 rounded-lg border ${
              theme === "dark"
                ? "border-white/10 bg-slate-900"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              {editingCategory === category.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editCategoryLabel || ""}
                    onChange={(e) => setEditCategoryLabel(e.target.value)}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      theme === "dark"
                        ? "border-white/10 bg-white/5 text-white"
                        : "border-slate-300 bg-white text-slate-900"
                    } focus:outline-none focus:ring-2 focus:ring-green-500`}
                  />
                  <Button
                    onClick={() => handleUpdateCategory(category.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </Button>
                  <Button
                    onClick={handleCancelEditCategory}
                    variant="outline"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className={`text-2xl font-bold ${
                    theme === "dark" ? "text-white" : "text-slate-900"
                  }`}>
                    {category.label} <span className={`text-sm font-normal ${
                      theme === "dark" ? "text-white/50" : "text-slate-500"
                    }`}>
                      ({category.items?.length || 0} articles)
                    </span>
                  </h2>
                  <Button
                    onClick={() => handleStartEditCategory(category)}
                    variant="outline"
                    className="text-sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </>
              )}
            </div>

            {/* Items List */}
            <div className="space-y-2">
              {category.items && category.items.length > 0 ? (
                category.items.map((item, itemIndex) => (
                  <EditableMenuItem
                    key={itemIndex}
                    item={item}
                    categoryId={category.id}
                    itemIndex={itemIndex}
                    onSave={handleSaveItem}
                    onDelete={handleDeleteItem}
                  />
                ))
              ) : (
                <p className={`text-sm italic ${
                  theme === "dark" ? "text-white/50" : "text-slate-500"
                }`}>
                  Aucun article dans cette catégorie
                </p>
              )}
            </div>
          </div>
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
              Aucune catégorie trouvée. Les données seront chargées automatiquement.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

