"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import { Compass } from "lucide-react";

export default function PortalHome() {
  const { user } = useAuth();

  return (
    <AppShell title="Cổng người thuê" allow="tenant">
      <section className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-lg">
        <p className="text-sm text-indigo-100">Xin chào</p>
        <h2 className="text-3xl font-extrabold">{user?.name}</h2>
        <p className="mt-2 text-indigo-100">Tuần 4: Giao diện Dashboard / Portal và tài khoản</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900">
            Xem nhà đang cho thuê <Compass size={16} />
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
