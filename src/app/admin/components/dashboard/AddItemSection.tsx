"use client";

import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { MenuCategory, MenuItem } from "@/components/MenuSection";
import { useAlert } from "@/lib/useAlert";

interface AddItemSectionProps {
  theme: string;
  menuData: MenuCategory[];
  newItem: Partial<MenuItem>;
  setNewItem: (item: Partial<MenuItem>) => void;
  newItemCategoryId: string;
  setNewItemCategoryId: (id: string) => void;
  uploadingImage: boolean;
  setUploadingImage: (uploading: boolean) => void;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
  formatPriceInput: (value: string) => string;
  handleAddItem: () => void;
}

export function AddItemSection({
  theme,
  menuData,
  newItem,
  setNewItem,
  newItemCategoryId,
  setNewItemCategoryId,
  uploadingImage,
  setUploadingImage,
  imagePreview,
  setImagePreview,
  formatPriceInput,
  handleAddItem,
}: AddItemSectionProps) {
  const { showAlert, AlertComponent } = useAlert();

  return (
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
                // Clean up and ensure euro symbol is present on blur
                let value = e.target.value.trim();
                // Remove all spaces (safety measure)
                value = value.replace(/\s+/g, '');
                // For price ranges, ensure proper spacing around dash
                value = value.replace(/([\d,.]+)-([\d,.]+)/g, '$1 - $2');
                if (value && !value.includes('€')) {
                  value = value + ' €';
                }
                if (value !== e.target.value) {
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
                      setImagePreview(preview);

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
                        await showAlert(error.error || "Erreur lors du téléchargement de l'image", "error");
                      }
                    } catch (error) {
                      console.error("Upload error:", error);
                      await showAlert("Erreur lors du téléchargement de l'image", "error");
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
      <AlertComponent />
    </div>
  );
}

