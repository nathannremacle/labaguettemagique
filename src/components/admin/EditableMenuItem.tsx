"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MenuItem } from "@/components/MenuSection";
import { Edit, Save, X, Trash2 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import Image from "next/image";

interface EditableMenuItemProps {
  item: MenuItem;
  categoryId: string;
  itemId: number;
  onSave: (categoryId: string, itemId: number, item: MenuItem) => void;
  onDelete: (categoryId: string, itemId: number) => void;
}

export function EditableMenuItem({
  item,
  categoryId,
  itemId,
  onSave,
  onDelete,
}: EditableMenuItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(item);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { theme } = useTheme();

  const handleSave = () => {
    onSave(categoryId, itemId, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(item);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={`p-6 rounded-lg border ${
        theme === "dark"
          ? "border-white/10 bg-white/5"
          : "border-slate-200 bg-white"
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          theme === "dark" ? "text-white" : "text-slate-900"
        }`}>
          Modifier l'article
        </h3>
        
        {editData.image && (
          <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden border">
            <Image
              src={editData.image}
              alt={editData.name}
              fill
              className="object-cover"
              sizes="100%"
            />
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === "dark" ? "text-white/90" : "text-slate-700"
            }`}>
              Nom de l'article
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
                Prix
              </label>
              <input
                type="text"
                value={editData.price || ""}
                onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === "dark"
                    ? "border-white/10 bg-white/5 text-white placeholder-white/50"
                    : "border-slate-300 bg-white text-slate-900"
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
                placeholder="Ex: 5,50 € - 6,50 €"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === "dark" ? "text-white/90" : "text-slate-700"
              }`}>
                Image
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
                      alt="Preview"
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
                      alt="Current"
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
      </div>
    );
  }

  return (
    <div 
      data-item-id={itemId}
      className={`p-4 rounded-lg border ${
        theme === "dark"
          ? "border-white/10 bg-white/5"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex gap-4">
        {item.image && (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}>
            {item.name}
          </h3>
          <p className={`text-sm ${
            theme === "dark" ? "text-white/70" : "text-slate-600"
          }`}>
            {item.description}
          </p>
          <p className={`text-sm font-semibold ${
            theme === "dark" ? "text-amber-300" : "text-amber-600"
          }`}>
            {item.price && !item.price.includes('€') ? `${item.price} €` : item.price}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="text-sm px-3 py-2"
            aria-label="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => {
              if (confirm("Are you sure you want to delete this item?")) {
                onDelete(categoryId, itemId);
              }
            }}
            variant="outline"
            className="text-red-500 hover:text-red-700 text-sm px-3 py-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
