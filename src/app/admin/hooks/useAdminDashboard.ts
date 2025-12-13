"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MenuCategory, MenuItem } from "@/components/MenuSection";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

export function useAdminDashboard() {
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
  const [showAllItems, setShowAllItems] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [footerItems, setFooterItems] = useState<Array<{id: number; title: string; description?: string; icon?: string; link?: string; menu_category_id?: string; menu_item_name?: string; visible: boolean}>>([]);
  const [newFooterItem, setNewFooterItem] = useState({ title: "", description: "", icon: "", link: "", menu_category_id: "", menu_item_name: "", visible: true });
  const [editingFooterItem, setEditingFooterItem] = useState<number | null>(null);
  const [showMenuSelectorDialog, setShowMenuSelectorDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const router = useRouter();

  // Helper function to format price with euro symbol
  const formatPrice = (price: string | undefined): string => {
    if (!price) return "";
    if (price.includes("€")) return price;
    return `${price} €`;
  };

  // Helper function to format price input (only numbers, comma, dot, dash, space)
  const formatPriceInput = (value: string): string => {
    let cleaned = value.replace(/€/g, '').trim();
    cleaned = cleaned.replace(/[^\d,.\-\s]/g, '');
    if (cleaned) {
      return cleaned + ' €';
    }
    return cleaned;
  };

  // Get all items flattened with category info
  const getAllItems = () => {
    return menuData.flatMap(category =>
      (category.items || []).map(item => ({
        ...item,
        categoryId: category.id,
        categoryLabel: category.label,
      }))
    );
  };

  // Filter items based on search query
  const filteredItems = getAllItems().filter(item => {
    if (searchQuery === "") return true;
    const query = searchQuery.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.categoryLabel && item.categoryLabel.toLowerCase().includes(query)) ||
      (item.price && item.price.toLowerCase().includes(query))
    );
  });

  // Helper function to filter items in a category based on search query
  const filterCategoryItems = (items: MenuItem[]) => {
    if (searchQuery === "") return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      (item.name && item.name.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.price && item.price.toLowerCase().includes(query))
    );
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        credentials: "include",
      });
      const data = await response.json();
      console.log("[Admin] Auth check response:", data);
      
      if (data.authenticated) {
        setAuthenticated(true);
        loadMenuData();
        loadStatus();
        loadFooterItems();
      } else {
        console.log("[Admin] Not authenticated, redirecting to login");
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("[Admin] Auth check error:", error);
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const loadMenuData = async () => {
    try {
      const response = await fetch("/api/menu", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const normalizedData = data.map((cat: MenuCategory) => ({
            ...cat,
            items: (cat.items || []).map((item: any) => {
              if (item.id === undefined || item.id === null) {
                console.warn(`[Admin] Item missing ID:`, {
                  item,
                  itemKeys: Object.keys(item),
                  itemIdType: typeof item.id,
                  itemIdValue: item.id,
                });
              } else {
                const itemId = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id;
                if (isNaN(itemId)) {
                  console.error(`[Admin] Item ID is not a valid number:`, {
                    item,
                    originalId: item.id,
                    parsedId: itemId,
                  });
                }
              }
              const normalizedId = item.id != null 
                ? (typeof item.id === 'string' ? parseInt(item.id, 10) : Number(item.id))
                : undefined;
              
              return {
                ...item,
                id: isNaN(normalizedId as number) ? undefined : normalizedId,
              };
            }),
          }));
          
          const totalItems = normalizedData.reduce((sum, cat) => sum + (cat.items?.length || 0), 0);
          const itemsWithIds = normalizedData.reduce((sum, cat) => 
            sum + (cat.items || []).filter(item => item.id != null).length, 0
          );
          console.log(`[Admin] Loaded ${totalItems} items, ${itemsWithIds} with IDs`);
          
          setMenuData(normalizedData);
        } else {
          setMenuData([]);
        }
      } else {
        setMenuData([]);
      }
    } catch (error) {
      console.error("Failed to load menu:", error);
      setMenuData([]);
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

  const loadFooterItems = async () => {
    try {
      const response = await fetch("/api/footer", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setFooterItems(data);
      }
    } catch (error) {
      console.error("Failed to load footer items:", error);
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

  const handleChangePassword = async () => {
    setPasswordError("");
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Tous les champs sont requis");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowPasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
        alert("Mot de passe modifié avec succès");
      } else {
        setPasswordError(data.error || "Erreur lors de la modification du mot de passe");
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      setPasswordError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveItem = async (
    categoryId: string,
    itemId: number,
    item: MenuItem
  ) => {
    try {
      const response = await fetch(
        `/api/menu/categories/${categoryId}/items/${itemId}`,
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
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to save item:", response.status, errorData);
        alert("Erreur lors de la sauvegarde de l'article");
      }
    } catch (error) {
      console.error("Failed to save item:", error);
      alert("Erreur lors de la sauvegarde de l'article");
    }
  };

  const handleDeleteItem = async (categoryId: string, itemId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;

    try {
      const response = await fetch(
        `/api/menu/categories/${categoryId}/items/${itemId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        await loadMenuData();
      } else {
        console.error("Failed to delete item:", response.status);
        alert("Erreur lors de la suppression de l'article");
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
      alert("Erreur lors de la suppression de l'article");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Check if dragging categories
    const activeCategory = menuData.find((cat) => cat.id === active.id);
    const overCategory = menuData.find((cat) => cat.id === over.id);

    if (activeCategory && overCategory) {
      const oldIndex = menuData.findIndex((cat) => cat.id === active.id);
      const newIndex = menuData.findIndex((cat) => cat.id === over.id);
      const newOrder = arrayMove(menuData, oldIndex, newIndex);
      const categoryIds = newOrder.map((cat) => cat.id);

      try {
        const response = await fetch("/api/menu/reorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            type: "categories",
            ids: categoryIds,
          }),
        });

        if (response.ok) {
          await loadMenuData();
        } else {
          console.error("Failed to reorder categories:", response.status);
        }
      } catch (error) {
        console.error("Failed to reorder categories:", error);
      }
      return;
    }

    // Check if dragging items within a category
    for (const category of menuData) {
      const activeItem = category.items?.find((item) => `item-${item.id}` === active.id);
      const overItem = category.items?.find((item) => `item-${item.id}` === over.id);

      if (activeItem && overItem && activeItem.id && overItem.id) {
        const oldIndex = category.items!.findIndex((item) => item.id === activeItem.id);
        const newIndex = category.items!.findIndex((item) => item.id === overItem.id);
        const newOrder = arrayMove(category.items!, oldIndex, newIndex);
        const itemIds = newOrder.map((item) => item.id!).filter((id): id is number => id !== undefined);

        try {
          const response = await fetch("/api/menu/reorder", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              type: "items",
              categoryId: category.id,
              ids: itemIds,
            }),
          });

          if (response.ok) {
            await loadMenuData();
          } else {
            console.error("Failed to reorder items:", response.status);
          }
        } catch (error) {
          console.error("Failed to reorder items:", error);
        }
        return;
      }
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
    if (!editCategoryLabel || editCategoryLabel.trim() === "") {
      alert("Le nom de la catégorie ne peut pas être vide");
      return;
    }

    try {
      const response = await fetch(
        `/api/menu/categories/${categoryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ label: editCategoryLabel.trim() }),
        }
      );

      if (response.ok) {
        setEditingCategory(null);
        setEditCategoryLabel("");
        await loadMenuData();
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Failed to update category:", response.status, errorData);
        alert(`Erreur lors de la mise à jour: ${errorData.error || "Erreur inconnue"}`);
      }
    } catch (error: any) {
      console.error("Failed to update category:", error);
      alert(`Erreur lors de la mise à jour: ${error.message || "Erreur de connexion"}`);
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

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(
        `/api/menu/categories/${categoryId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        await loadMenuData();
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Failed to delete category:", response.status, errorData);
        alert(`Erreur lors de la suppression: ${errorData.error || "Erreur inconnue"}`);
      }
    } catch (error: any) {
      console.error("Failed to delete category:", error);
      alert(`Erreur lors de la suppression: ${error.message || "Erreur de connexion"}`);
    }
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

  const toggleCategoryExpand = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  return {
    // State
    authenticated,
    loading,
    menuData,
    newItem,
    setNewItem,
    newItemCategoryId,
    setNewItemCategoryId,
    newCategory,
    setNewCategory,
    status,
    editingCategory,
    editCategoryLabel,
    setEditCategoryLabel,
    uploadingImage,
    setUploadingImage,
    imagePreview,
    setImagePreview,
    showAllItems,
    setShowAllItems,
    searchQuery,
    setSearchQuery,
    expandedCategories,
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
    showPasswordModal,
    setShowPasswordModal,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordError,
    changingPassword,
    // Helpers
    formatPrice,
    formatPriceInput,
    getAllItems,
    filteredItems,
    filterCategoryItems,
    // Handlers
    handleToggleStatus,
    handleStatusMessageChange,
    handleLogout,
    handleChangePassword,
    handleSaveItem,
    handleDeleteItem,
    handleDragEnd,
    handleAddItem,
    handleUpdateCategory,
    handleStartEditCategory,
    handleCancelEditCategory,
    handleDeleteCategory,
    handleAddCategory,
    toggleCategoryExpand,
    loadMenuData,
    loadFooterItems,
  };
}


