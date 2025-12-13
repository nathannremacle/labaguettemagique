"use client";

import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MenuCategory, MenuItem } from "@/components/MenuSection";
import { Button } from "@/components/ui/button";
import { Edit, Save, X, GripVertical, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { SortableItem } from "./SortableItem";
import { ItemList } from "./ItemList";
import { useAlert } from "@/lib/useAlert";

interface CategoryHandlers {
  handleUpdateCategory: (id: string) => void;
  handleCancelEditCategory: () => void;
  handleStartEditCategory: (category: MenuCategory) => void;
  handleDeleteCategory: (id: string) => void;
  handleSaveItem: (categoryId: string, itemId: number, item: MenuItem) => void;
  handleDeleteItem: (categoryId: string, itemId: number) => void;
  setEditingItem: (item: { categoryId: string; itemId: number } | null) => void;
}

interface SortableCategoryProps {
  category: MenuCategory;
  theme: string;
  editingState: {
    editingCategory: string | null;
    editCategoryLabel: string;
    setEditCategoryLabel: (label: string) => void;
  };
  handlers: CategoryHandlers;
  uiState: {
    isExpanded: boolean;
    searchQuery: string;
    onToggleExpand: () => void;
  };
  formatters: {
    formatPrice: (price: string | undefined) => string;
  };
  filters: {
    filterCategoryItems: (items: MenuItem[]) => MenuItem[];
  };
}

export function SortableCategory({
  category,
  theme,
  editingState,
  handlers,
  uiState,
  formatters,
  filters,
}: SortableCategoryProps) {
  const { showConfirm, AlertComponent } = useAlert();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const itemIds = (category.items || [])
    .filter((item) => item.id !== undefined)
    .map((item) => `item-${item.id}`);

  const filteredItems = filters.filterCategoryItems(category.items || []);

  const handleEditItem = (categoryId: string, itemId: number) => {
    handlers.setEditingItem({ categoryId, itemId });
  };

  const isEditing = editingState.editingCategory === category.id;
  const itemCount = category.items?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-category-id={category.id}
      className={`mb-8 p-6 rounded-lg border ${
        theme === "dark"
          ? "border-white/10 bg-slate-900"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <button
            {...attributes}
            {...listeners}
            className={`p-1 cursor-grab active:cursor-grabbing ${
              theme === "dark" ? "text-white/50 hover:text-white" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <GripVertical className="h-5 w-5" />
          </button>
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={editingState.editCategoryLabel || ""}
                onChange={(e) => editingState.setEditCategoryLabel(e.target.value)}
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  theme === "dark"
                    ? "border-white/10 bg-white/5 text-white"
                    : "border-slate-300 bg-white text-slate-900"
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
              <Button
                onClick={() => handlers.handleUpdateCategory(category.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
              <Button
                onClick={handlers.handleCancelEditCategory}
                variant="outline"
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            </div>
          ) : (
            <>
              <button
                onClick={uiState.onToggleExpand}
                className="flex items-center gap-2 flex-1 text-left hover:opacity-80 transition-opacity"
              >
                {uiState.isExpanded ? (
                  <ChevronUp className={`h-5 w-5 ${theme === "dark" ? "text-white/50" : "text-slate-400"}`} />
                ) : (
                  <ChevronDown className={`h-5 w-5 ${theme === "dark" ? "text-white/50" : "text-slate-400"}`} />
                )}
                <h2 className={`text-2xl font-bold ${
                  theme === "dark" ? "text-white" : "text-slate-900"
                }`}>
                  {category.label} <span className={`text-sm font-normal ${
                    theme === "dark" ? "text-white/50" : "text-slate-500"
                  }`}>
                    ({itemCount} articles)
                  </span>
                </h2>
              </button>
              <div className="flex gap-2">
                <Button
                  onClick={() => handlers.handleStartEditCategory(category)}
                  variant="outline"
                  className="text-sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
                <Button
                  onClick={() => {
                    showConfirm(
                      `Êtes-vous sûr de vouloir supprimer la catégorie "${category.label}" ? Cette action supprimera également tous les articles de cette catégorie.`,
                      () => handlers.handleDeleteCategory(category.id),
                      undefined,
                      "Supprimer"
                    );
                  }}
                  variant="outline"
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Items List - Expandable */}
      {uiState.isExpanded && (
        <div className="mt-4 space-y-2">
          <ItemList
            items={filteredItems}
            theme={theme}
            categoryId={category.id}
            searchQuery={uiState.searchQuery}
            onToggleExpand={uiState.onToggleExpand}
            handlers={{
              formatPrice: formatters.formatPrice,
              handleDeleteItem: handlers.handleDeleteItem,
              onEditItem: handleEditItem,
            }}
          />
        </div>
      )}
      <AlertComponent />
    </div>
  );
}


