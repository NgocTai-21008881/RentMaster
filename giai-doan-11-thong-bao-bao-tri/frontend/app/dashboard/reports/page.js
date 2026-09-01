"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui";
import { api, reportApi } from "@/lib/api";
import { formatMoney } from "@/lib/format";

export default function ReportsPage() {
  const year = new Date().getFullYear();
  const [data, setData] = useState(null);

  useEffect(() => {
    reportApi.get(`?year=${year}`).then((r) => setData(r.data));
  }, [year]);

  async function download(format) {
    const blob = await api(`/reports/export?year=${year}&format=${format}`, { blob: true });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bao-cao.${format === "xlsx" ? "xlsx" : "csv"}`;
    a.click();
  }

  return (
    <AppShell title="Báo cáo & thống kê" allow="staff">
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => download("csv")}>Xuất CSV</Button>
        <Button onClick={() => download("xlsx")}>Xuất Excel</Button>
      </div>
      {data ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Chưa thu</p><p className="text-2xl font-bold">{formatMoney(data.outstanding)}</p></article>
            <article className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Công suất phòng</p><p className="text-2xl font-bold">{data.occupancy_rate}%</p></article>
            <article className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Tỷ lệ trống</p><p className="text-2xl font-bold">{data.vacant_rate}%</p></article>
            <article className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">HĐ mới / hết hạn</p><p className="text-2xl font-bold">{data.new_contracts} / {data.expired_contracts}</p></article>
          </section>
          <div className="h-80 rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold">Doanh thu năm {year}</h2>
            <ResponsiveContainer>
              <BarChart data={data.revenue_by_month}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => formatMoney(v)} />
                <Bar dataKey="total" fill="#7c3aed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr><th className="p-3 text-left">Bất động sản</th><th className="p-3 text-left">Doanh thu</th></tr></thead>
              <tbody>
                {data.revenue_by_property.map((row) => (
                  <tr key={row.id} className="border-t"><td className="p-3">{row.name}</td><td className="p-3">{formatMoney(row.total)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </AppShell>
  );
}
