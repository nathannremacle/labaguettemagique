"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAdminLogin } from "./hooks/useAdminLogin";

export default function AdminLogin() {
  const { theme } = useTheme();
  const login = useAdminLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login.handleLogin();
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${
        theme === "dark" ? "bg-slate-950" : "bg-slate-50"
      }`}
    >
      <div
        className={`w-full max-w-md p-8 rounded-2xl border shadow-xl relative ${
          theme === "dark"
            ? "border-white/10 bg-slate-900"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <h1
          className={`text-3xl font-bold mb-2 ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}
        >
          Admin Login
        </h1>
        <p
          className={`mb-6 ${
            theme === "dark" ? "text-white/70" : "text-slate-600"
          }`}
        >
          Please sign in to access the admin panel
        </p>

        {login.error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {login.error}
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
              value={login.username}
              onChange={(e) => login.setUsername(e.target.value)}
              required
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "border-white/10 bg-white/5 text-white placeholder-white/50"
                  : "border-slate-300 bg-white text-slate-900"
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
              placeholder="Enter username"
              disabled={login.loading}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                theme === "dark" ? "text-white" : "text-slate-700"
              }`}
            >
              Password
            </label>
            <input
              type="password"
              value={login.password}
              onChange={(e) => login.setPassword(e.target.value)}
              required
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "border-white/10 bg-white/5 text-white placeholder-white/50"
                  : "border-slate-300 bg-white text-slate-900"
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
              placeholder="Enter password"
              disabled={login.loading}
            />
          </div>

          <Button
            type="submit"
            disabled={login.loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {login.loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}

