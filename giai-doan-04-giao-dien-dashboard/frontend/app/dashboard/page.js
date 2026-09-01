"use client";

import AppShell from "@/components/AppShell";

export default function DashboardPage() {
  return (
    <AppShell title="Tổng quan" allow="staff">
      <section className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-lg">
        <p className="text-sm text-indigo-100">Tuần 4 · Giai đoạn 4</p>
        <h2 className="mt-1 text-3xl font-extrabold">Giao diện Dashboard / Portal và tài khoản</h2>
        <p className="mt-2 max-w-2xl text-indigo-100">Khung quản trị SaaS, cổng người thuê, hồ sơ cá nhân, CRUD tài khoản (Admin).</p>
      </section>
      <p className="text-sm text-slate-500">
        Dashboard biểu đồ doanh thu sẽ có ở giai đoạn 10. Dùng menu bên trái để mở các module đã hoàn thành.
      </p>
    </AppShell>
  );
}
