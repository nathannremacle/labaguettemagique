"use client";

import { ToggleLeft, ToggleRight } from "lucide-react";

interface StatusManagementProps {
  theme: string;
  status: { isOpen: boolean; message: string };
  onToggleStatus: () => void;
  onStatusMessageChange: (message: string) => void;
}

export function StatusManagement({
  theme,
  status,
  onToggleStatus,
  onStatusMessageChange,
}: StatusManagementProps) {
  return (
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
          onClick={onToggleStatus}
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
            onChange={(e) => onStatusMessageChange(e.target.value)}
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
  );
}


