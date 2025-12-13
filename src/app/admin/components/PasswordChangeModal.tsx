"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PasswordState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  passwordError: string;
  changingPassword: boolean;
}

interface PasswordHandlers {
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onChangePassword: () => void;
  onClose: () => void;
}

interface PasswordChangeModalProps {
  theme: string;
  isOpen: boolean;
  passwordState: PasswordState;
  handlers: PasswordHandlers;
}

export function PasswordChangeModal({
  theme,
  isOpen,
  passwordState,
  handlers,
}: PasswordChangeModalProps) {
  const {
    currentPassword,
    newPassword,
    confirmPassword,
    passwordError,
    changingPassword,
  } = passwordState;
  
  const {
    onCurrentPasswordChange,
    onNewPasswordChange,
    onConfirmPasswordChange,
    onChangePassword,
    onClose,
  } = handlers;
  if (!isOpen) return null;

  return (
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
            onClick={onClose}
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
              onChange={(e) => onCurrentPasswordChange(e.target.value)}
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
              onChange={(e) => onNewPasswordChange(e.target.value)}
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
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "border-white/10 bg-white/5 text-white placeholder-white/50"
                  : "border-slate-300 bg-white text-slate-900"
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
              placeholder="Confirmez votre nouveau mot de passe"
              disabled={changingPassword}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !changingPassword) {
                  onChangePassword();
                }
              }}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={onChangePassword}
              disabled={changingPassword}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {changingPassword ? "Modification..." : "Modifier le mot de passe"}
            </Button>
            <Button
              onClick={onClose}
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
  );
}


