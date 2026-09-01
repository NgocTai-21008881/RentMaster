"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Menu, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { roleLabel } from "@/lib/format";
import { notiApi } from "@/lib/api";

export default function Header({ title, onMenu }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  async function load() {
    try {
      const res = await notiApi.list();
      setItems(res.data.rows || []);
      setUnread(res.data.unread || 0);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, []);

  async function markAll() {
    await notiApi.readAll();
    load();
  }

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
        <div className="relative">
          <button type="button" onClick={() => setOpen((v) => !v)} className="relative rounded-xl border border-slate-200 p-2 hover:bg-slate-50">
            <Bell size={18} />
            {unread ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-500 px-1 text-center text-[10px] text-white">{unread}</span> : null}
          </button>
          {open ? (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="font-semibold">Thông báo</span>
                <button className="text-indigo-600" onClick={markAll}>
                  Đọc tất cả
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {items.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-slate-500">Chưa có thông báo.</p>
                ) : (
                  items.slice(0, 8).map((item) => (
                    <button
                      key={item.id}
                      className={`block w-full px-3 py-2 text-left text-sm ${item.is_read ? "text-slate-500" : "bg-indigo-50/70 text-slate-800"}`}
                      onClick={async () => {
                        await notiApi.read(item.id);
                        load();
                      }}
                    >
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.message}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>
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
