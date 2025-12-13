"use client";

import { useState } from "react";
import { MenuCategory } from "@/components/MenuSection";

export function useFooterOperations() {
  const [footerItems, setFooterItems] = useState<Array<{
    id: number;
    title: string;
    description?: string;
    icon?: string;
    link?: string;
    menu_category_id?: string;
    menu_item_name?: string;
    visible: boolean;
  }>>([]);
  const [newFooterItem, setNewFooterItem] = useState({
    title: "",
    description: "",
    icon: "",
    link: "",
    menu_category_id: "",
    menu_item_name: "",
    visible: true,
  });
  const [editingFooterItem, setEditingFooterItem] = useState<number | null>(null);
  const [showMenuSelectorDialog, setShowMenuSelectorDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);

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

  return {
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
    loadFooterItems,
  };
}

