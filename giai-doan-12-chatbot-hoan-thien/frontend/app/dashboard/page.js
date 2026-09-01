"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AppShell from "@/components/AppShell";
import StatCard from "@/components/StatCard";
import { dashboardApi } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { Skeleton } from "@/components/ui";

const COLORS = ["#4f46e5", "#06b6d4", "#f59e0b", "#f43f5e"];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardApi.summary().then((res) => setData(res.data)).catch((err) => setError(err.message));
  }, []);

  const occ = data
    ? [
        { name: "Đã thuê", value: data.occupancy.occupied },
        { name: "Trống", value: data.occupancy.vacant },
        { name: "Đã đặt", value: data.occupancy.reserved },
        { name: "Bảo trì", value: data.occupancy.maintenance },
      ]
    : [];
  const inv = data
    ? [
        { name: "Đã trả", value: data.invoices.paid },
        { name: "Chưa trả", value: data.invoices.unpaid },
        { name: "Một phần", value: data.invoices.partial },
        { name: "Quá hạn", value: data.invoices.overdue },
      ]
    : [];

  return (
    <AppShell title="Tổng quan" allow="staff">
      {error ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      {!data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Bất động sản" value={data.total_properties} tone="indigo" />
            <StatCard label="Tổng phòng" value={data.total_rooms} tone="cyan" />
            <StatCard label="Đang thuê" value={data.occupied_rooms} tone="emerald" />
            <StatCard label="Còn trống" value={data.vacant_rooms} tone="amber" />
            <StatCard label="Bảo trì" value={data.maintenance_rooms} tone="rose" />
            <StatCard label="Người thuê" value={data.total_tenants} tone="slate" />
            <StatCard label="HĐ đang hiệu lực" value={data.active_contracts} tone="indigo" />
            <StatCard label="HĐ sắp hết hạn" value={data.expiring_contracts} tone="amber" />
            <StatCard label="HĐ chưa thanh toán" value={data.unpaid_invoices} tone="cyan" />
            <StatCard label="HĐ quá hạn" value={data.overdue_invoices} tone="rose" />
            <StatCard label="Doanh thu tháng" value={data.month_revenue} hint={formatMoney(data.month_revenue)} tone="emerald" />
          </section>
          <section className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
              <h2 className="mb-4 font-semibold">Doanh thu theo tháng</h2>
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={data.revenue_by_month}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(v) => formatMoney(v)} />
                    <Bar dataKey="total" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold">Tỷ lệ phòng</h2>
              <div className="h-72">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={occ} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                      {occ.map((entry, i) => (
                        <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold">Hóa đơn</h2>
              <div className="h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={inv} dataKey="value" nameKey="name" outerRadius={80}>
                      {inv.map((entry, i) => (
                        <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}
