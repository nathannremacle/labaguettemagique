"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MenuSection, MenuCategory, MenuItem } from "@/components/MenuSection";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useTheme } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { EditableMenuItem } from "@/components/admin/EditableMenuItem";
import { LogOut, Plus, ToggleLeft, ToggleRight, Edit, Save, X, GripVertical, Trash2, Eye, Search, ChevronDown, ChevronUp, ExternalLink, Lock } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Category Component
function SortableCategory({
  category,
  theme,
  editingCategory,
  editCategoryLabel,
  setEditCategoryLabel,
  handleUpdateCategory,
  handleCancelEditCategory,
  handleStartEditCategory,
  handleDeleteCategory,
  handleSaveItem,
  handleDeleteItem,
  isExpanded,
  onToggleExpand,
  formatPrice,
  searchQuery,
  filterCategoryItems,
}: {
  category: MenuCategory;
  theme: string;
  editingCategory: string | null;
  editCategoryLabel: string;
  setEditCategoryLabel: (label: string) => void;
  handleUpdateCategory: (id: string) => void;
  handleCancelEditCategory: () => void;
  handleStartEditCategory: (category: MenuCategory) => void;
  handleDeleteCategory: (id: string) => void;
  handleSaveItem: (categoryId: string, itemId: number, item: MenuItem) => void;
  handleDeleteItem: (categoryId: string, itemId: number) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  formatPrice: (price: string | undefined) => string;
  searchQuery: string;
  filterCategoryItems: (items: MenuItem[]) => MenuItem[];
}) {
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
              <button
                onClick={onToggleExpand}
                className="flex items-center gap-2 flex-1 text-left hover:opacity-80 transition-opacity"
              >
                {isExpanded ? (
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
                    ({category.items?.length || 0} articles)
                  </span>
                </h2>
              </button>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleStartEditCategory(category)}
                  variant="outline"
                  className="text-sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
                <Button
                  onClick={() => {
                    if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.label}" ? Cette action supprimera également tous les articles de cette catégorie.`)) {
                      handleDeleteCategory(category.id);
                    }
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
      {isExpanded && (
        <div className="mt-4 space-y-2">
          {(() => {
            const filteredItems = filterCategoryItems(category.items || []);
            const currentTheme = theme; // Capture theme in closure
            return filteredItems.length > 0 ? (
              filteredItems.map((item, index) => {
              // Use index as fallback key if id is undefined
              const itemKey = item.id != null && typeof item.id === 'number' ? item.id : `item-${index}`;
              
              return (
                <div
                  key={itemKey}
                  data-item-id={item.id}
                  className={`p-4 rounded-lg border ${
                    currentTheme === "dark"
                      ? "border-white/10 bg-white/5"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {item.image && (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name || "Image de l'article"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Hide image on error
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className={`font-semibold mb-1 ${
                            currentTheme === "dark" ? "text-white" : "text-slate-900"
                          }`}>
                            {item.name || "Article sans nom"}
                          </h3>
                          {item.description && (
                            <p className={`text-sm mb-2 ${
                              currentTheme === "dark" ? "text-white/70" : "text-slate-600"
                            } line-clamp-2`}>
                              {item.description}
                            </p>
                          )}
                          {item.price && (
                            <p className={`text-sm font-semibold ${
                              currentTheme === "dark" ? "text-amber-300" : "text-amber-600"
                            }`}>
                              {formatPrice(item.price)}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {item.id != null && typeof item.id === 'number' ? (
                            <>
                              <Button
                                onClick={() => {
                                  // Collapse the category first to show the collapsed view with EditableMenuItem
                                  onToggleExpand();
                                  // Wait for the collapse animation, then find and trigger edit mode
                                  setTimeout(() => {
                                    const itemElement = document.querySelector(
                                      `[data-item-id="${item.id}"]`
                                    );
                                    if (itemElement) {
                                      // Scroll to item first
                                      itemElement.scrollIntoView({ behavior: "smooth", block: "center" });
                                      // Then find and click the edit button
                                      setTimeout(() => {
                                        const editButton = itemElement.querySelector('button[aria-label="Edit"]') as HTMLButtonElement;
                                        if (editButton) {
                                          editButton.click();
                                        } else {
                                          // Fallback: try to find any button with Edit icon
                                          const buttons = itemElement.querySelectorAll('button');
                                          buttons.forEach(btn => {
                                            const icon = btn.querySelector('svg');
                                            if (icon && icon.classList.contains('lucide-edit')) {
                                              btn.click();
                                            }
                                          });
                                        }
                                      }, 300);
                                    }
                                  }, 100);
                                }}
                                variant="outline"
                                className={`text-sm px-3 py-2 ${
                                  currentTheme === "dark" 
                                    ? "border-white/20 text-white hover:bg-white/10" 
                                    : "border-slate-300 text-slate-700 hover:bg-slate-100"
                                }`}
                                aria-label="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => {
                                  if (item.id != null && typeof item.id === 'number' && confirm(`Êtes-vous sûr de vouloir supprimer "${item.name || 'cet article'}" ?`)) {
                                    handleDeleteItem(category.id, item.id);
                                  }
                                }}
                                variant="outline"
                                className={`text-sm px-3 py-2 ${
                                  currentTheme === "dark"
                                    ? "text-red-400 hover:text-red-300 border-white/20 hover:bg-red-500/10"
                                    : "text-red-500 hover:text-red-700 border-slate-300 hover:bg-red-50"
                                }`}
                                aria-label="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <span className={`text-xs italic ${
                              currentTheme === "dark" ? "text-white/50" : "text-slate-500"
                            }`}>
                              ID manquant
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
              })
            ) : (
              <p className={`text-sm italic ${
                currentTheme === "dark" ? "text-white/50" : "text-slate-500"
              }`}>
                {searchQuery ? "Aucun article trouvé dans cette catégorie" : "Vide"}
              </p>
            );
          })()}
        </div>
      )}
      
      {/* Sortable Items (for drag and drop) - Hidden when expanded */}
      {!isExpanded && (
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {category.items && category.items.length > 0 ? (
              category.items.map((item) => {
                if (item.id === undefined) return null;
                return (
                  <SortableItem
                    key={item.id}
                    item={item}
                    categoryId={category.id}
                    handleSaveItem={handleSaveItem}
                    handleDeleteItem={handleDeleteItem}
                  />
                );
              })
            ) : (
              <p className={`text-sm italic ${
                theme === "dark" ? "text-white/50" : "text-slate-500"
              }`}>
                Vide
              </p>
            )}
          </div>
        </SortableContext>
      )}
    </div>
  );
}

// Sortable Item Component
function SortableItem({
  item,
  categoryId,
  handleSaveItem,
  handleDeleteItem,
}: {
  item: MenuItem;
  categoryId: string;
  handleSaveItem: (categoryId: string, itemId: number, item: MenuItem) => void;
  handleDeleteItem: (categoryId: string, itemId: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `item-${item.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (item.id === undefined) return null;

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <EditableMenuItem
            item={item}
            categoryId={categoryId}
            itemId={item.id}
            onSave={handleSaveItem}
            onDelete={handleDeleteItem}
          />
        </div>
      </div>
    </div>
  );
}

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
  const { theme, toggleTheme } = useTheme();

  // Helper function to format price with euro symbol
  const formatPrice = (price: string | undefined): string => {
    if (!price) return "";
    if (price.includes("€")) return price;
    return `${price} €`;
  };

  // Helper function to format price input (only numbers, comma, dot, dash, space)
  const formatPriceInput = (value: string): string => {
    // Remove euro symbol if present (we'll add it back)
    let cleaned = value.replace(/€/g, '').trim();
    
    // Only allow numbers, comma, dot, dash, and spaces
    cleaned = cleaned.replace(/[^\d,.\-\s]/g, '');
    
    // Add euro symbol if there's content
    if (cleaned) {
      return cleaned + ' €';
    }
    return cleaned;
  };

  // Helper function to handle price input change
  const handlePriceInputChange = (value: string, setter: (price: string) => void) => {
    const formatted = formatPriceInput(value);
    setter(formatted);
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

  // Filter items based on search query - always compute for search functionality
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
        // Menu data loaded successfully
        
        // Check if data is an array and has content
        if (Array.isArray(data) && data.length > 0) {
          // Ensure all categories have items array and items have IDs
          const normalizedData = data.map((cat: MenuCategory) => ({
            ...cat,
            items: (cat.items || []).map((item: any) => {
              // Ensure ID is preserved and properly typed as number
              // Log detailed info if ID is missing
              if (item.id === undefined || item.id === null) {
                console.warn(`[Admin] Item missing ID:`, {
                  item,
                  itemKeys: Object.keys(item),
                  itemIdType: typeof item.id,
                  itemIdValue: item.id,
                });
              } else {
                // Ensure ID is a number (convert if string)
                const itemId = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id;
                if (isNaN(itemId)) {
                  console.error(`[Admin] Item ID is not a valid number:`, {
                    item,
                    originalId: item.id,
                    parsedId: itemId,
                  });
                }
              }
              // Convert ID to number if it's a string, preserve if number, or keep undefined
              const normalizedId = item.id != null 
                ? (typeof item.id === 'string' ? parseInt(item.id, 10) : Number(item.id))
                : undefined;
              
              return {
                ...item,
                id: isNaN(normalizedId as number) ? undefined : normalizedId,
              };
            }),
          }));
          
          // Log summary of loaded data
          const totalItems = normalizedData.reduce((sum, cat) => sum + (cat.items?.length || 0), 0);
          const itemsWithIds = normalizedData.reduce((sum, cat) => 
            sum + (cat.items || []).filter(item => item.id != null).length, 0
          );
          console.log(`[Admin] Loaded ${totalItems} items, ${itemsWithIds} with IDs`);
          
          setMenuData(normalizedData);
        } else {
          // Menu data is empty - set empty array
          setMenuData([]);
        }
      } else {
        // API returned error - keep empty state
        setMenuData([]);
      }
    } catch (error) {
      // Log error but don't expose details
      console.error("Failed to load menu:", error);
      // Keep empty state on error
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
    
    // Validation
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
        // Success - close modal and reset form
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Check if dragging categories
    const activeCategory = menuData.find((cat) => cat.id === active.id);
    const overCategory = menuData.find((cat) => cat.id === over.id);

    if (activeCategory && overCategory) {
      // Reordering categories
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

  if (loading) {
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
              onClick={() => setShowPasswordModal(true)}
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
              onClick={handleLogout}
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
                        onClick={() => setEditingFooterItem(item.id)}
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
                              await loadFooterItems();
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
                  value={newFooterItem.title}
                  onChange={(e) => setNewFooterItem({...newFooterItem, title: e.target.value})}
                  placeholder="Titre *"
                  className={`w-full px-3 py-2 rounded border text-sm ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5 text-white"
                      : "border-slate-300 bg-white text-slate-900"
                  }`}
                />
                <textarea
                  value={newFooterItem.description}
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
                  value={newFooterItem.icon}
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
                    value={newFooterItem.link}
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
                      checked={newFooterItem.visible}
                      onChange={(e) => setNewFooterItem({...newFooterItem, visible: e.target.checked})}
                      className="rounded"
                    />
                    Visible
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      if (!newFooterItem.title.trim()) {
                        alert("Le titre est requis");
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
              placeholder="Nom de la catégorie"
              className={`flex-1 px-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "border-white/10 bg-white/5 text-white"
                  : "border-slate-300 bg-white text-slate-900"
              }`}
            />
            <Button onClick={handleAddCategory} className="bg-green-600 hover:bg-green-700">
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
                  placeholder="Ex: 5,50 - 6,50"
                  value={newItem.price || ""}
                  onChange={(e) => {
                    const formatted = formatPriceInput(e.target.value);
                    setNewItem({ ...newItem, price: formatted });
                  }}
                  onBlur={(e) => {
                    // Ensure euro symbol is present on blur
                    let value = e.target.value.trim();
                    if (value && !value.includes('€')) {
                      value = value + ' €';
                      setNewItem({ ...newItem, price: value });
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
                        alt="Aperçu"
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
                        alt="Image actuelle"
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
              Liste de tous les articles ({getAllItems().length})
            </h2>
            <Button
              onClick={() => setShowAllItems(!showAllItems)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {showAllItems ? "Masquer" : "Afficher"}
            </Button>
          </div>

          {showAllItems && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  theme === "dark" ? "text-white/50" : "text-slate-400"
                }`} />
                <input
                  type="text"
                  placeholder="Rechercher un article..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5 text-white placeholder-white/50"
                      : "border-slate-300 bg-white text-slate-900"
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => {
                    if (item.id === undefined) return null;
                    const category = menuData.find(cat => cat.id === item.categoryId);
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
                                  {formatPrice(item.price)}
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
                                      handleDeleteItem(item.categoryId, item.id);
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
                    {searchQuery ? "Aucun article trouvé" : "Aucun article disponible"}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Menu Categories */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={menuData.map((cat) => cat.id)} strategy={verticalListSortingStrategy}>
            {menuData && menuData.length > 0 ? (
              menuData.map((category) => (
                <SortableCategory
                  key={category.id}
                  category={category}
                  theme={theme}
                  editingCategory={editingCategory}
                  editCategoryLabel={editCategoryLabel}
                  setEditCategoryLabel={setEditCategoryLabel}
                  handleUpdateCategory={handleUpdateCategory}
                  handleCancelEditCategory={handleCancelEditCategory}
                  handleStartEditCategory={handleStartEditCategory}
                  handleDeleteCategory={handleDeleteCategory}
                  handleSaveItem={handleSaveItem}
                  handleDeleteItem={handleDeleteItem}
                  isExpanded={expandedCategories.has(category.id)}
                  onToggleExpand={() => {
                    setExpandedCategories(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(category.id)) {
                        newSet.delete(category.id);
                      } else {
                        newSet.add(category.id);
                      }
                      return newSet;
                    });
                  }}
                  formatPrice={formatPrice}
                  searchQuery={searchQuery}
                  filterCategoryItems={filterCategoryItems}
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
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-xl ${
            theme === "dark"
              ? "border-white/10 bg-slate-900"
              : "border-slate-200 bg-white"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-2xl font-bold ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}>
                Modifier le mot de passe
              </h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordError("");
                }}
                className={`p-2 rounded-lg transition ${
                  theme === "dark"
                    ? "text-white/70 hover:text-white hover:bg-white/10"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {passwordError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-white" : "text-slate-700"
                }`}>
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5 text-white placeholder-white/50"
                      : "border-slate-300 bg-white text-slate-900"
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
                  placeholder="Entrez votre mot de passe actuel"
                  disabled={changingPassword}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-white" : "text-slate-700"
                }`}>
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5 text-white placeholder-white/50"
                      : "border-slate-300 bg-white text-slate-900"
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
                  placeholder="Entrez votre nouveau mot de passe"
                  disabled={changingPassword}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-white" : "text-slate-700"
                }`}>
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5 text-white placeholder-white/50"
                      : "border-slate-300 bg-white text-slate-900"
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
                  placeholder="Confirmez votre nouveau mot de passe"
                  disabled={changingPassword}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !changingPassword) {
                      handleChangePassword();
                    }
                  }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {changingPassword ? "Modification..." : "Modifier le mot de passe"}
                </Button>
                <Button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError("");
                  }}
                  variant="outline"
                  disabled={changingPassword}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Item Selector Dialog */}
      <Dialog
        isOpen={showMenuSelectorDialog}
        onClose={() => {
          setShowMenuSelectorDialog(false);
          setSelectedCategory(null);
        }}
        title={selectedCategory ? "Sélectionner un élément" : "Sélectionner une catégorie"}
      >
        <div className="space-y-4">
          {!selectedCategory ? (
            // Stage 1: Category Selection
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {menuData.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
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
                onClick={() => setSelectedCategory(null)}
                className={`flex items-center gap-2 text-sm mb-4 ${
                  theme === "dark" ? "text-white/70 hover:text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ChevronUp className="h-4 w-4" />
                Retour aux catégories
              </button>
              <div className="max-h-[60vh] overflow-y-auto space-y-2">
                {selectedCategory.items?.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      // Auto-fill footer item form
                      setNewFooterItem({
                        title: item.name,
                        description: item.description || "",
                        icon: "",
                        link: "",
                        menu_category_id: selectedCategory.id,
                        menu_item_name: item.name,
                        visible: true,
                      });
                      setShowMenuSelectorDialog(false);
                      setSelectedCategory(null);
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
                            {formatPrice(item.price)}
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

