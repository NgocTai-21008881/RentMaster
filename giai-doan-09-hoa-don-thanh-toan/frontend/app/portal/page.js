"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import { authApi, invoiceApi } from "@/lib/api";
import { formatMoney, invoiceStatusLabel } from "@/lib/format";
import { ArrowRight, Compass } from "lucide-react";

export default function PortalHome() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    authApi.me().then((r) => setProfile(r.data));
    invoiceApi.list().then((r) => setInvoices(r.data.items || []));
  }, []);

  const unpaid = invoices.filter((i) => i.status !== "paid");

  return (
    <AppShell title="Cổng người thuê" allow="tenant">
      <section className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-lg">
        <p className="text-sm text-indigo-100">Xin chào</p>
        <h2 className="text-3xl font-extrabold">{profile?.name}</h2>
        <p className="mt-2 text-indigo-100">Phòng {profile?.room?.code || "chưa gán"} · {profile?.room?.property_name || ""}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900">
            <Compass size={16} /> Xem nhà trên trang chủ
          </Link>
          <Link href="/phong" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-bold text-white">
            Thuê phòng trống <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Hóa đơn chưa tất toán</p><p className="text-3xl font-bold">{unpaid.length}</p></article>
        <article className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Còn phải trả</p><p className="text-3xl font-bold">{formatMoney(unpaid.reduce((s, i) => s + (Number(i.total) - Number(i.paid_amount)), 0))}</p></article>
        <article className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Giá thuê</p><p className="text-3xl font-bold">{formatMoney(profile?.room?.rent_price)}</p></article>
      </section>
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h3 className="font-semibold">Hóa đơn gần đây</h3>
        <div className="mt-3 space-y-2 text-sm">
          {invoices.slice(0, 5).map((i) => (
            <div key={i.id} className="flex justify-between rounded-xl bg-slate-50 px-3 py-2">
              <span>{i.code}</span>
              <span>{invoiceStatusLabel[i.status]} · {formatMoney(i.total)}</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
