"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

const AuthContext = createContext(null);

function homeFor(role) {
  return role === "tenant" ? "/portal" : "/dashboard";
}

function safePath(path) {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//");
}

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem("user");
    if (cached) setUser(JSON.parse(cached));
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password, redirectTo) {
    const res = await authApi.login(email, password);
    localStorage.setItem("token", res.data.token);
    if (res.data.refreshToken) localStorage.setItem("refreshToken", res.data.refreshToken);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    router.push(safePath(redirectTo) ? redirectTo : homeFor(res.data.user.role));
  }

  async function register(payload, redirectTo) {
    const res = await authApi.register(payload);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    router.push(safePath(redirectTo) ? redirectTo : homeFor(res.data.user.role));
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  }

  async function refreshUser() {
    const res = await authApi.me();
    setUser(res.data);
    localStorage.setItem("user", JSON.stringify(res.data));
    return res.data;
  }

  const value = useMemo(() => ({ user, loading, login, register, logout, refreshUser }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth phải dùng trong AuthProvider");
  return context;
}
