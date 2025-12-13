"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAlert } from "@/lib/useAlert";

interface UseAuthLogicOptions {
  onAuthenticated?: () => void;
}

export function useAuthLogic(options?: UseAuthLogicOptions) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        credentials: "include",
      });
      const data = await response.json();
      
      if (data.authenticated) {
        setAuthenticated(true);
        options?.onAuthenticated?.();
      } else {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("[Admin] Auth check error:", error);
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    
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
        setShowPasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
        await showAlert("Mot de passe modifié avec succès", "success");
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

  return {
    authenticated,
    loading,
    showPasswordModal,
    setShowPasswordModal,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordError,
    changingPassword,
    handleLogout,
    handleChangePassword,
    AlertComponent,
  };
}

