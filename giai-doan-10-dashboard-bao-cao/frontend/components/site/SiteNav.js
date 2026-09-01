"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const links = [
  { href: "/", label: "Trang chủ" },
  { href: "/phong", label: "Phòng cho thuê" },
  { href: "/bat-dong-san", label: "Bất động sản" },
  { href: "/gioi-thieu", label: "Giới thiệu" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const home = user?.role === "tenant" ? "/portal" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-white/10">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 text-lg font-black text-white shadow-lg shadow-indigo-500/30">
            R
          </span>
          <span>
            <span className="block text-sm font-extrabold tracking-tight text-white">RentHub</span>
            <span className="block text-[11px] uppercase tracking-[0.18em] text-indigo-200">Living, elevated</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition ${
                pathname === link.href ? "text-white" : "text-indigo-100/80 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link href={home} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-indigo-50">
              {user.role === "tenant" ? "Cổng người thuê" : "Vào hệ thống"}
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-white hover:text-cyan-200">
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:brightness-110"
              >
                Đăng ký thuê
              </Link>
            </>
          )}
        </div>

        <button className="rounded-xl p-2 text-white md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open ? (
        <div className="space-y-2 border-t border-white/10 px-4 py-4 md:hidden">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-white hover:bg-white/10">
              {link.label}
            </Link>
          ))}
          {user ? (
            <Link href={home} className="block rounded-xl px-3 py-2 text-cyan-200" onClick={() => setOpen(false)}>
              {user.role === "tenant" ? "Cổng người thuê" : "Vào hệ thống"}
            </Link>
          ) : (
            <Link href="/login" className="block rounded-xl px-3 py-2 text-cyan-200" onClick={() => setOpen(false)}>
              Đăng nhập
            </Link>
          )}
        </div>
      ) : null}
    </header>
  );
}
