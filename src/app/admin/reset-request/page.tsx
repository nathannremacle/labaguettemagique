"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";

export default function ResetRequest() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // In production, show message that email was sent
        // For now, show success message
      } else {
        if (response.status === 429) {
          const retryAfter = data.retryAfter || 1800;
          const minutes = Math.ceil(retryAfter / 60);
          setError(
            `Too many requests. Please try again in ${minutes} minute${minutes > 1 ? "s" : ""}.`
          );
        } else {
          setError(data.error || "An error occurred");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${
        theme === "dark" ? "bg-slate-950" : "bg-slate-50"
      }`}
    >
      <div
        className={`w-full max-w-md p-8 rounded-2xl border shadow-xl ${
          theme === "dark"
            ? "border-white/10 bg-slate-900"
            : "border-slate-200 bg-white"
        }`}
      >
        <h1
          className={`text-3xl font-bold mb-2 ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}
        >
          Reset Password
        </h1>
        <p
          className={`mb-6 ${
            theme === "dark" ? "text-white/70" : "text-slate-600"
          }`}
        >
          Enter your username to receive a password reset link
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
            If the username exists, a password reset link has been sent. Check
            the console for the reset token (development only).
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                theme === "dark" ? "text-white" : "text-slate-700"
              }`}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "border-white/10 bg-white/5 text-white placeholder-white/50"
                  : "border-slate-300 bg-white text-slate-900"
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
              placeholder="Enter username"
              disabled={loading || success}
            />
          </div>

          <Button
            type="submit"
            disabled={loading || success}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? "Sending..." : success ? "Sent" : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/admin/login"
            className={`text-sm hover:underline ${
              theme === "dark" ? "text-green-400" : "text-green-600"
            }`}
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

