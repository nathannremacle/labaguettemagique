"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LoginResponse {
  success?: boolean;
  error?: string;
}

export function useAdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (): Promise<boolean> => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data: LoginResponse = await response.json();

      if (response.ok) {
        if (data.success !== false && !data.error) {
          setLoading(false);
          setTimeout(() => {
            window.location.href = "/admin";
          }, 100);
          return true;
        } else {
          console.error("[Login] Authentication failed - Error:", data.error || "Invalid credentials");
          setError(data.error || "Invalid credentials");
          setLoading(false);
          return false;
        }
      } else {
        console.error("[Login] Authentication failed - Status:", response.status, "Error:", data.error || "Invalid credentials");
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error("[Login] Network or unexpected error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
      return false;
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    error,
    loading,
    handleLogin,
  };
}


