"use client";

import { MenuCategory } from "@/components/MenuSection";

interface DashboardStatsProps {
  theme: string;
  menuData: MenuCategory[];
  status: { isOpen: boolean; message: string };
}

function getStatusColor(isOpen: boolean, theme: string) {
  if (isOpen) {
    return theme === "dark" ? "text-green-400" : "text-green-600";
  }
  return theme === "dark" ? "text-red-400" : "text-red-600";
}

export function DashboardStats({ theme, menuData, status }: DashboardStatsProps) {
  return (
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
          <p className={`text-2xl font-bold ${getStatusColor(status.isOpen, theme)}`}>
            {status.isOpen ? "Ouvert" : "Fermé"}
          </p>
        </div>
      </div>
    </div>
  );
}

