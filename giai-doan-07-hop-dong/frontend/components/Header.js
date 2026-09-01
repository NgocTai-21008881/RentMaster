"use client";

import Link from "next/link";
import { Menu, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { roleLabel } from "@/lib/format";

export default function Header({ title, onMenu }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <button type="button" className="rounded-lg border border-slate-200 p-2 lg:hidden" onClick={onMenu}>
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          <p className="hidden text-xs text-slate-500 sm:block">Hệ thống quản lý cho thuê chuyên nghiệp</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {user?.role === "tenant" ? (
          <Link href="/" className="hidden rounded-xl border border-indigo-200 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 sm:inline-flex">
            Xem & thuê nhà
          </Link>
        ) : null}
        <Link href={user?.role === "tenant" ? "/portal/profile" : "/dashboard/profile"} className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-800">{user?.name}</p>
          <p className="text-xs text-slate-500">{roleLabel[user?.role] || user?.role}</p>
        </Link>
        <button type="button" onClick={logout} className="rounded-xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200" title="Đăng xuất">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
