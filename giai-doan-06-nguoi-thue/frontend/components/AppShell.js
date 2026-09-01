"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function AppShell({ title, children, allow }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (allow === "staff" && user.role === "tenant") router.replace("/portal");
    if (allow === "tenant" && user.role !== "tenant") router.replace("/dashboard");
    if (allow === "admin" && user.role !== "admin") router.replace("/dashboard");
  }, [loading, user, router, allow]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Đang tải phiên làm việc...</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#f5f7fb]">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} role={user.role} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header title={title} onMenu={() => setMenuOpen(true)} />
        <div className="flex-1 space-y-6 p-4 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
