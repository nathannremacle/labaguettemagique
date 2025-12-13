"use client";

import { useState, useCallback } from "react";
import type { ReactElement } from "react";
import { AlertModal, AlertType } from "@/components/ui/alert-modal";

interface AlertState {
  isOpen: boolean;
  message: string;
  type: AlertType;
  mode: "alert" | "confirm";
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function useAlert() {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    message: "",
    type: "info",
    mode: "alert",
  });

  const showAlert = useCallback(
    (message: string, type: AlertType = "info") => {
      return new Promise<void>((resolve) => {
        setAlertState({
          isOpen: true,
          message,
          type,
          mode: "alert",
          onConfirm: () => resolve(),
        });
      });
    },
    []
  );

  const showConfirm = useCallback(
    (
      message: string,
      onConfirm?: () => void,
      onCancel?: () => void,
      confirmLabel?: string,
      cancelLabel?: string,
      type: AlertType = "warning"
    ) => {
      setAlertState({
        isOpen: true,
        message,
        type,
        mode: "confirm",
        onConfirm,
        onCancel,
        confirmLabel,
        cancelLabel,
      });
    },
    []
  );

  const closeAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const AlertComponent: () => ReactElement = () => (
    <AlertModal
      isOpen={alertState.isOpen}
      onClose={closeAlert}
      message={alertState.message}
      type={alertState.type}
      mode={alertState.mode}
      onConfirm={alertState.onConfirm}
      onCancel={alertState.onCancel}
      confirmLabel={alertState.confirmLabel}
      cancelLabel={alertState.cancelLabel}
    />
  );

  return {
    showAlert,
    showConfirm,
    closeAlert,
    AlertComponent,
  };
}

