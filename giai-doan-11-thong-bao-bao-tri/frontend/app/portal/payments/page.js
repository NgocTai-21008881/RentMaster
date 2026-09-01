"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import DataTable from "@/components/DataTable";
import { paymentApi } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";

export default function PortalPayments() {
  const [rows, setRows] = useState([]);
  useEffect(() => { paymentApi.list().then((r) => setRows(r.data.items)); }, []);
  return (
    <AppShell title="Lịch sử thanh toán" allow="tenant">
      <DataTable rows={rows} columns={[
        { key: "invoice_code", label: "Hóa đơn" },
        { key: "amount", label: "Số tiền", render: (r) => formatMoney(r.amount) },
        { key: "method", label: "Hình thức", render: (r) => (r.method === "cash" ? "Tiền mặt" : "Chuyển khoản") },
        { key: "paid_at", label: "Thời gian", render: (r) => formatDate(r.paid_at) },
      ]} />
    </AppShell>
  );
}
