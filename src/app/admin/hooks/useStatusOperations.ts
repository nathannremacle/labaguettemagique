"use client";

import { useState, useEffect } from "react";

export function useStatusOperations() {
  const [status, setStatus] = useState({ isOpen: true, message: "" });

  const loadStatus = async () => {
    try {
      const response = await fetch("/api/status");
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Failed to load status:", error);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = { ...status, isOpen: !status.isOpen };
    try {
      const response = await fetch("/api/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStatus),
      });
      if (response.ok) {
        setStatus(newStatus);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleStatusMessageChange = async (message: string) => {
    const newStatus = { ...status, message };
    try {
      const response = await fetch("/api/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStatus),
      });
      if (response.ok) {
        setStatus(newStatus);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return {
    status,
    loadStatus,
    handleToggleStatus,
    handleStatusMessageChange,
  };
}

