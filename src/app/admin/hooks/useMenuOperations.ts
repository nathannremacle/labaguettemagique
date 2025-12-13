"use client";

import { useState } from "react";
import { MenuCategory, MenuItem } from "@/components/MenuSection";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { normalizeItemId, getAllItems, filterCategoryItems, formatPrice, formatPriceInput } from "./utils/menuUtils";
import { useAlert } from "@/lib/useAlert";

interface UseMenuOperationsOptions {
  onDataChanged?: () => void;
}

export function useMenuOperations(options?: UseMenuOperationsOptions) {
  const [menuData, setMenuData] = useState<MenuCategory[]>([]);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({});
  const [newItemCategoryId, setNewItemCategoryId] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showAllItems, setShowAllItems] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<{ categoryId: string; itemId: number } | null>(null);
  const { showAlert, showConfirm, AlertComponent } = useAlert();

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
            items: (cat.items || []).map((item: MenuItem) => {
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
              const normalizedId = normalizeItemId(item.id);
              
              return {
                ...item,
                id: normalizedId,
              };
            }),
          }));
          
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

  // Filter items based on search query
  const filteredItems = getAllItems(menuData).filter(item => {
    if (searchQuery === "") return true;
    const query = searchQuery.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.categoryLabel && item.categoryLabel.toLowerCase().includes(query)) ||
      (item.price && item.price.toLowerCase().includes(query))
    );
  });

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
        options?.onDataChanged?.();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to save item:", response.status, errorData);
        await showAlert("Erreur lors de la sauvegarde de l'article", "error");
      }
    } catch (error) {
      console.error("Failed to save item:", error);
      await showAlert("Erreur lors de la sauvegarde de l'article", "error");
    }
  };

  const handleDeleteItem = async (categoryId: string, itemId: number) => {
    return new Promise<void>((resolve) => {
      showConfirm(
        "Êtes-vous sûr de vouloir supprimer cet article ?",
        async () => {
          try {
      const response = await fetch(
        `/api/menu/categories/${categoryId}/items/${itemId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

            if (response.ok) {
              options?.onDataChanged?.();
              resolve();
            } else {
              console.error("Failed to delete item:", response.status);
              await showAlert("Erreur lors de la suppression de l'article", "error");
              resolve();
            }
          } catch (error) {
            console.error("Failed to delete item:", error);
            await showAlert("Erreur lors de la suppression de l'article", "error");
            resolve();
          }
        },
        () => resolve(),
        "Supprimer"
      );
    });
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
          options?.onDataChanged?.();
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
            options?.onDataChanged?.();
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
      await showAlert("Veuillez sélectionner une catégorie", "error");
      return;
    }
    if (!newItem.name || !newItem.price) {
      await showAlert("Veuillez remplir au moins le nom et le prix", "error");
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
        options?.onDataChanged?.();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to add item:", response.status, errorData);
        await showAlert("Erreur lors de l'ajout de l'article", "error");
      }
    } catch (error) {
      console.error("Failed to add item:", error);
      await showAlert("Erreur lors de l'ajout de l'article", "error");
    }
  };

  return {
    menuData,
    newItem,
    setNewItem,
    newItemCategoryId,
    setNewItemCategoryId,
    uploadingImage,
    setUploadingImage,
    imagePreview,
    setImagePreview,
    showAllItems,
    setShowAllItems,
    searchQuery,
    setSearchQuery,
    editingItem,
    setEditingItem,
    loadMenuData,
    getAllItems: () => getAllItems(menuData),
    filteredItems,
    filterCategoryItems: (items: MenuItem[]) => filterCategoryItems(items, searchQuery),
    formatPrice,
    formatPriceInput,
    handleSaveItem,
    handleDeleteItem,
    handleDragEnd,
    handleAddItem,
    AlertComponent,
  };
}

