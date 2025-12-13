"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddCategorySectionProps {
  theme: string;
  newCategory: { label: string };
  onNewCategoryChange: (label: string) => void;
  onAddCategory: () => void;
}

export function AddCategorySection({
  theme,
  newCategory,
  onNewCategoryChange,
  onAddCategory,
}: AddCategorySectionProps) {
  return (
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
          onChange={(e) => onNewCategoryChange(e.target.value)}
          placeholder="Nom de la catégorie"
          className={`flex-1 px-4 py-2 rounded-lg border ${
            theme === "dark"
              ? "border-white/10 bg-white/5 text-white"
              : "border-slate-300 bg-white text-slate-900"
          }`}
        />
        <Button onClick={onAddCategory} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une catégorie
        </Button>
      </div>
    </div>
  );
}

