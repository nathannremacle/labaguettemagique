"use client";

import { useTheme } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, Eye, Search, ExternalLink, Lock, X, Edit, Trash2 } from "lucide-react";
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
import { DashboardHeader } from "./components/dashboard/DashboardHeader";
import { DashboardStats } from "./components/dashboard/DashboardStats";
import { AddCategorySection } from "./components/dashboard/AddCategorySection";
import { FooterItemsManagement } from "./components/dashboard/FooterItemsManagement";
import { AddItemSection } from "./components/dashboard/AddItemSection";
import { AllItemsView } from "./components/dashboard/AllItemsView";
import { MenuItemSelectorDialog } from "./components/dashboard/MenuItemSelectorDialog";
import { EditItemDialog } from "./components/dashboard/EditItemDialog";

// Old component definitions removed - now in ./components/

// Helper function to get visibility status color
function getVisibilityStatusColor(visible: boolean, theme: string): string {
  if (visible) {
    return theme === "dark" ? "text-green-400" : "text-green-600";
  }
  return theme === "dark" ? "text-red-400" : "text-red-600";
}

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
      <DashboardHeader
        theme={theme}
        onShowPasswordModal={() => dashboard.setShowPasswordModal(true)}
        onLogout={dashboard.handleLogout}
      />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <DashboardStats
          theme={theme}
          menuData={dashboard.menuData}
          status={dashboard.status}
        />

        {/* Status Toggle */}
        <StatusManagement
          theme={theme}
          status={dashboard.status}
          onToggleStatus={dashboard.handleToggleStatus}
          onStatusMessageChange={dashboard.handleStatusMessageChange}
        />

        {/* Footer Items Management */}
        <FooterItemsManagement
          theme={theme}
          footerItems={dashboard.footerItems}
          setFooterItems={dashboard.setFooterItems}
          newFooterItem={dashboard.newFooterItem}
          setNewFooterItem={dashboard.setNewFooterItem}
          editingFooterItem={dashboard.editingFooterItem}
          setEditingFooterItem={dashboard.setEditingFooterItem}
          showMenuSelectorDialog={dashboard.showMenuSelectorDialog}
          setShowMenuSelectorDialog={dashboard.setShowMenuSelectorDialog}
          selectedCategory={dashboard.selectedCategory}
          setSelectedCategory={dashboard.setSelectedCategory}
          menuData={dashboard.menuData}
          formatPrice={dashboard.formatPrice}
          loadFooterItems={dashboard.loadFooterItems}
        />

        <AddCategorySection
          theme={theme}
          newCategory={dashboard.newCategory}
          onNewCategoryChange={(label) => dashboard.setNewCategory({ label })}
          onAddCategory={dashboard.handleAddCategory}
        />

        {/* Add New Item (Global) */}
        <AddItemSection
          theme={theme}
          menuData={dashboard.menuData}
          newItem={dashboard.newItem}
          setNewItem={dashboard.setNewItem}
          newItemCategoryId={dashboard.newItemCategoryId}
          setNewItemCategoryId={dashboard.setNewItemCategoryId}
          uploadingImage={dashboard.uploadingImage}
          setUploadingImage={dashboard.setUploadingImage}
          imagePreview={dashboard.imagePreview}
          setImagePreview={dashboard.setImagePreview}
          formatPriceInput={dashboard.formatPriceInput}
          handleAddItem={dashboard.handleAddItem}
        />

        {/* All Items Sublist View */}
        <AllItemsView
          theme={theme}
          showAllItems={dashboard.showAllItems}
          setShowAllItems={dashboard.setShowAllItems}
          searchQuery={dashboard.searchQuery}
          setSearchQuery={dashboard.setSearchQuery}
          filteredItems={dashboard.filteredItems}
          menuData={dashboard.menuData}
          formatPrice={dashboard.formatPrice}
          handleDeleteItem={dashboard.handleDeleteItem}
          getAllItems={dashboard.getAllItems}
          onEditItem={(categoryId, itemId) => dashboard.setEditingItem({ categoryId, itemId })}
        />

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
                    setEditingItem: dashboard.setEditingItem,
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
        passwordState={{
          currentPassword: dashboard.currentPassword,
          newPassword: dashboard.newPassword,
          confirmPassword: dashboard.confirmPassword,
          passwordError: dashboard.passwordError,
          changingPassword: dashboard.changingPassword,
        }}
        handlers={{
          onCurrentPasswordChange: dashboard.setCurrentPassword,
          onNewPasswordChange: dashboard.setNewPassword,
          onConfirmPasswordChange: dashboard.setConfirmPassword,
          onChangePassword: dashboard.handleChangePassword,
          onClose: () => {
            dashboard.setShowPasswordModal(false);
            dashboard.setCurrentPassword("");
            dashboard.setNewPassword("");
            dashboard.setConfirmPassword("");
          },
        }}
      />

      {/* Menu Item Selector Dialog */}
      <MenuItemSelectorDialog
        theme={theme}
        isOpen={dashboard.showMenuSelectorDialog}
        onClose={() => {
          dashboard.setShowMenuSelectorDialog(false);
          dashboard.setSelectedCategory(null);
        }}
        menuData={dashboard.menuData}
        selectedCategory={dashboard.selectedCategory}
        setSelectedCategory={dashboard.setSelectedCategory}
        onItemSelect={(item, category) => {
          // Auto-fill footer item form
          dashboard.setNewFooterItem({
            title: item.name,
            description: item.description || "",
            icon: "",
            link: "",
            menu_category_id: category.id,
            menu_item_name: item.name,
            visible: true,
          });
          dashboard.setShowMenuSelectorDialog(false);
          dashboard.setSelectedCategory(null);
        }}
        formatPrice={dashboard.formatPrice}
      />

      {/* Edit Item Dialog */}
      {(() => {
        const editingItem = dashboard.editingItem;
        if (!editingItem) return null;
        
        const category = dashboard.menuData.find(cat => cat.id === editingItem.categoryId);
        const item = category?.items?.find(item => item.id === editingItem.itemId);
        
        return (
          <EditItemDialog
            isOpen={!!editingItem && !!item}
            onClose={() => dashboard.setEditingItem(null)}
            item={item || null}
            categoryId={editingItem.categoryId}
            menuData={dashboard.menuData}
            formatPriceInput={dashboard.formatPriceInput}
            onSave={async (categoryId, itemId, item) => {
              await dashboard.handleSaveItem(categoryId, itemId, item);
              dashboard.setEditingItem(null);
            }}
          />
        );
      })()}

      {/* Alert Components */}
      <dashboard.authAlertComponent />
      <dashboard.menuAlertComponent />
      <dashboard.categoryAlertComponent />
    </div>
  );
}

