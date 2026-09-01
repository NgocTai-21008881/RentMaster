"use client";

import AppShell from "@/components/AppShell";

export default function DashboardPage() {
  return (
    <AppShell title="Tổng quan" allow="staff">
      <section className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-lg">
        <p className="text-sm text-indigo-100">Tuần 8 · Giai đoạn 8</p>
        <h2 className="mt-1 text-3xl font-extrabold">Điện nước và dịch vụ</h2>
        <p className="mt-2 max-w-2xl text-indigo-100">Chỉ số điện/nước tự tính tiền, cấu hình loại dịch vụ và gán theo phòng.</p>
      </section>
      <p className="text-sm text-slate-500">
        Dashboard biểu đồ doanh thu sẽ có ở giai đoạn 10. Dùng menu bên trái để mở các module đã hoàn thành.
      </p>
    </AppShell>
  );
}
