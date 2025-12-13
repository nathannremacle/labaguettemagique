"use client";

import { useState } from "react";
import { MenuCategory } from "@/components/MenuSection";
import { useAlert } from "@/lib/useAlert";

interface UseCategoryOperationsOptions {
  onDataChanged?: () => void;
}

export function useCategoryOperations(options?: UseCategoryOperationsOptions) {
  const [newCategory, setNewCategory] = useState({ label: "" });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryLabel, setEditCategoryLabel] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { showAlert, AlertComponent } = useAlert();

  const handleUpdateCategory = async (categoryId: string) => {
    if (!editCategoryLabel || editCategoryLabel.trim() === "") {
      await showAlert("Le nom de la catégorie ne peut pas être vide", "error");
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
        options?.onDataChanged?.();
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Failed to update category:", response.status, errorData);
        await showAlert(`Erreur lors de la mise à jour: ${errorData.error || "Erreur inconnue"}`, "error");
      }
    } catch (error: unknown) {
      console.error("Failed to update category:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur de connexion";
      await showAlert(`Erreur lors de la mise à jour: ${errorMessage}`, "error");
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
        options?.onDataChanged?.();
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Failed to delete category:", response.status, errorData);
        await showAlert(`Erreur lors de la suppression: ${errorData.error || "Erreur inconnue"}`, "error");
      }
    } catch (error: unknown) {
      console.error("Failed to delete category:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur de connexion";
      await showAlert(`Erreur lors de la suppression: ${errorMessage}`, "error");
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
        options?.onDataChanged?.();
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
    newCategory,
    setNewCategory,
    editingCategory,
    editCategoryLabel,
    setEditCategoryLabel,
    expandedCategories,
    handleUpdateCategory,
    handleStartEditCategory,
    handleCancelEditCategory,
    handleDeleteCategory,
    handleAddCategory,
    toggleCategoryExpand,
    AlertComponent,
  };
}

