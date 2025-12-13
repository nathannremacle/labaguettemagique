"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { LogOut, ExternalLink, Lock } from "lucide-react";

interface DashboardHeaderProps {
  theme: string;
  onShowPasswordModal: () => void;
  onLogout: () => void;
}

export function DashboardHeader({ theme, onShowPasswordModal, onLogout }: DashboardHeaderProps) {
  return (
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
            onClick={onShowPasswordModal}
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
            onClick={onLogout}
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
  );
}

