"use client";

import { useRef } from "react";
import { useAuthLogic } from "./useAuthLogic";
import { useMenuOperations } from "./useMenuOperations";
import { useCategoryOperations } from "./useCategoryOperations";
import { useFooterOperations } from "./useFooterOperations";
import { useStatusOperations } from "./useStatusOperations";

export function useAdminDashboard() {
  // Initialize hooks that don't need callbacks first
  const statusOps = useStatusOperations();
  const footerOps = useFooterOperations();

  // Use refs to store refresh functions so callbacks can reference them
  const refreshRef = useRef<() => Promise<void>>(async () => {});

  // Initialize menu and category hooks with callbacks
  const menuOps = useMenuOperations({
    onDataChanged: async () => {
      if (refreshRef.current) {
        await refreshRef.current();
      }
    },
  });

  const categoryOps = useCategoryOperations({
    onDataChanged: async () => {
      if (refreshRef.current) {
        await refreshRef.current();
      }
    },
  });

  // Now define the refresh function and assign to ref
  refreshRef.current = async () => {
    await Promise.all([
      menuOps.loadMenuData(),
      statusOps.loadStatus(),
      footerOps.loadFooterItems(),
    ]);
  };

  // Setup auth with refresh
  const authLogic = useAuthLogic({
    onAuthenticated: async () => {
      if (refreshRef.current) {
        await refreshRef.current();
      }
    },
  });

  return {
    // Auth
    authenticated: authLogic.authenticated,
    loading: authLogic.loading,
    showPasswordModal: authLogic.showPasswordModal,
    setShowPasswordModal: authLogic.setShowPasswordModal,
    currentPassword: authLogic.currentPassword,
    setCurrentPassword: authLogic.setCurrentPassword,
    newPassword: authLogic.newPassword,
    setNewPassword: authLogic.setNewPassword,
    confirmPassword: authLogic.confirmPassword,
    setConfirmPassword: authLogic.setConfirmPassword,
    passwordError: authLogic.passwordError,
    changingPassword: authLogic.changingPassword,
    handleLogout: authLogic.handleLogout,
    handleChangePassword: authLogic.handleChangePassword,
    authAlertComponent: authLogic.AlertComponent,

    // Menu
    menuData: menuOps.menuData,
    newItem: menuOps.newItem,
    setNewItem: menuOps.setNewItem,
    newItemCategoryId: menuOps.newItemCategoryId,
    setNewItemCategoryId: menuOps.setNewItemCategoryId,
    uploadingImage: menuOps.uploadingImage,
    setUploadingImage: menuOps.setUploadingImage,
    imagePreview: menuOps.imagePreview,
    setImagePreview: menuOps.setImagePreview,
    showAllItems: menuOps.showAllItems,
    setShowAllItems: menuOps.setShowAllItems,
    searchQuery: menuOps.searchQuery,
    setSearchQuery: menuOps.setSearchQuery,
    editingItem: menuOps.editingItem,
    setEditingItem: menuOps.setEditingItem,
    formatPrice: menuOps.formatPrice,
    formatPriceInput: menuOps.formatPriceInput,
    getAllItems: menuOps.getAllItems,
    filteredItems: menuOps.filteredItems,
    filterCategoryItems: menuOps.filterCategoryItems,
    handleSaveItem: menuOps.handleSaveItem,
    handleDeleteItem: menuOps.handleDeleteItem,
    handleDragEnd: menuOps.handleDragEnd,
    handleAddItem: menuOps.handleAddItem,
    loadMenuData: menuOps.loadMenuData,
    menuAlertComponent: menuOps.AlertComponent,

    // Category
    newCategory: categoryOps.newCategory,
    setNewCategory: categoryOps.setNewCategory,
    editingCategory: categoryOps.editingCategory,
    editCategoryLabel: categoryOps.editCategoryLabel,
    setEditCategoryLabel: categoryOps.setEditCategoryLabel,
    expandedCategories: categoryOps.expandedCategories,
    handleUpdateCategory: categoryOps.handleUpdateCategory,
    handleStartEditCategory: categoryOps.handleStartEditCategory,
    handleCancelEditCategory: categoryOps.handleCancelEditCategory,
    handleDeleteCategory: categoryOps.handleDeleteCategory,
    handleAddCategory: categoryOps.handleAddCategory,
    toggleCategoryExpand: categoryOps.toggleCategoryExpand,

    // Status
    status: statusOps.status,
    handleToggleStatus: statusOps.handleToggleStatus,
    handleStatusMessageChange: statusOps.handleStatusMessageChange,

    // Footer
    footerItems: footerOps.footerItems,
    setFooterItems: footerOps.setFooterItems,
    newFooterItem: footerOps.newFooterItem,
    setNewFooterItem: footerOps.setNewFooterItem,
    editingFooterItem: footerOps.editingFooterItem,
    setEditingFooterItem: footerOps.setEditingFooterItem,
    showMenuSelectorDialog: footerOps.showMenuSelectorDialog,
    setShowMenuSelectorDialog: footerOps.setShowMenuSelectorDialog,
    selectedCategory: footerOps.selectedCategory,
    setSelectedCategory: footerOps.setSelectedCategory,
    loadFooterItems: footerOps.loadFooterItems,
  };
}
