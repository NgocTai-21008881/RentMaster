"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import DataTable from "@/components/DataTable";
import { paymentApi } from "@/lib/api";
import { formatDate, formatMoney, qs } from "@/lib/format";

export default function PaymentsPage() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    paymentApi.list(qs({ limit: 30 })).then((r) => setRows(r.data.items));
  }, []);
  return (
    <AppShell title="Lịch sử thanh toán" allow="staff">
      <DataTable rows={rows} columns={[
        { key: "invoice_code", label: "Hóa đơn" },
        { key: "tenant_name", label: "Người thuê" },
        { key: "amount", label: "Số tiền", render: (r) => formatMoney(r.amount) },
        { key: "method", label: "Hình thức", render: (r) => (r.method === "cash" ? "Tiền mặt" : "Chuyển khoản") },
        { key: "paid_at", label: "Thời gian", render: (r) => formatDate(r.paid_at) },
        { key: "confirmed_name", label: "Xác nhận bởi" },
        { key: "note", label: "Ghi chú" },
      ]} />
    </AppShell>
  );
}
