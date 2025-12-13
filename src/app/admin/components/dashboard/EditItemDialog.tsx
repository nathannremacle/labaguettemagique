"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { MenuItem, MenuCategory } from "@/components/MenuSection";
import { Save, X } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import Image from "next/image";

interface EditItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  categoryId: string | null;
  menuData: MenuCategory[];
  formatPriceInput: (value: string) => string;
  onSave: (categoryId: string, itemId: number, item: MenuItem) => void;
}

export function EditItemDialog({
  isOpen,
  onClose,
  item,
  categoryId,
  menuData,
  formatPriceInput,
  onSave,
}: EditItemDialogProps) {
  const { theme } = useTheme();
  const [editData, setEditData] = useState<Partial<MenuItem>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Initialize editData when item changes
  useEffect(() => {
    if (item) {
      setEditData(item);
      setImagePreview(null);
    }
  }, [item]);

  // Reset when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setEditData({});
      setImagePreview(null);
      setUploadingImage(false);
    }
  }, [isOpen]);

  if (!item || !categoryId) return null;

  const handleSave = () => {
    if (!editData.name || !editData.price) {
      alert("Veuillez remplir au moins le nom et le prix");
      return;
    }
    onSave(categoryId, item.id!, editData as MenuItem);
    onClose();
  };

  const handleCancel = () => {
    setEditData(item);
    setImagePreview(null);
    onClose();
  };

  const category = menuData.find((cat) => cat.id === categoryId);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleCancel}
      title={`Modifier l'article${category ? ` - ${category.label}` : ""}`}
    >
      <div className="space-y-4">
        {editData.image && (
          <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden border">
            <Image
              src={editData.image}
              alt={editData.name || "Image de l'article"}
              fill
              className="object-cover"
              sizes="100%"
            />
          </div>
        )}

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === "dark" ? "text-white/90" : "text-slate-700"
          }`}>
            Nom de l'article *
          </label>
          <input
            type="text"
            value={editData.name || ""}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === "dark"
                ? "border-white/10 bg-white/5 text-white placeholder-white/50"
                : "border-slate-300 bg-white text-slate-900"
            } focus:outline-none focus:ring-2 focus:ring-green-500`}
            placeholder="Ex: Roi Dagobert"
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
              value={editData.price || ""}
              onChange={(e) => {
                const formatted = formatPriceInput(e.target.value);
                setEditData({ ...editData, price: formatted });
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
                  setEditData({ ...editData, price: value });
                }
              }}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "border-white/10 bg-white/5 text-white placeholder-white/50"
                  : "border-slate-300 bg-white text-slate-900"
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
              placeholder="Ex: 5,50 - 6,50"
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
                        setEditData({ ...editData, image: data.url });
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
                      setEditData({ ...editData, image: undefined });
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
              {editData.image && !imagePreview && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                  <img
                    src={editData.image}
                    alt="Image actuelle"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <input
                type="text"
                placeholder="Ou entrez une URL d'image"
                value={editData.image || ""}
                onChange={(e) => {
                  setEditData({ ...editData, image: e.target.value });
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
            value={editData.description || ""}
            onChange={(e) =>
              setEditData({ ...editData, description: e.target.value })
            }
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === "dark"
                ? "border-white/10 bg-white/5 text-white placeholder-white/50"
                : "border-slate-300 bg-white text-slate-900"
            } focus:outline-none focus:ring-2 focus:ring-green-500 resize-y`}
            placeholder="Description détaillée de l'article..."
            rows={4}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
          >
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
          <Button 
            onClick={handleCancel} 
            variant="outline" 
            className="px-6 py-2"
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

