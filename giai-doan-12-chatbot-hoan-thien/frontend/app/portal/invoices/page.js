"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import { Badge, Button } from "@/components/ui";
import { invoiceApi, openPdf, paymentApi } from "@/lib/api";
import { formatMoney, invoiceStatusClass, invoiceStatusLabel } from "@/lib/format";

export default function PortalInvoices() {
  const [rows, setRows] = useState([]);
  const [qr, setQr] = useState(null);
  useEffect(() => { invoiceApi.list().then((r) => setRows(r.data.items)); }, []);
  return (
    <AppShell title="Hóa đơn" allow="tenant">
      <DataTable rows={rows} columns={[
        { key: "code", label: "Mã" },
        { key: "period", label: "Kỳ" },
        { key: "total", label: "Tổng", render: (r) => formatMoney(r.total) },
        { key: "paid_amount", label: "Đã trả", render: (r) => formatMoney(r.paid_amount) },
        { key: "status", label: "TT", render: (r) => <Badge className={invoiceStatusClass[r.status]}>{invoiceStatusLabel[r.status]}</Badge> },
        { key: "a", label: "", render: (row) => (
          <div className="flex gap-2">
            <button onClick={() => openPdf(`/invoices/${row.id}/pdf`)}>PDF</button>
            {row.status !== "paid" ? <Button onClick={async () => setQr((await paymentApi.qr(row.id)).data)}>QR thanh toán</Button> : null}
          </div>
        )},
      ]} />
      <Modal title="Chuyển khoản QR" open={!!qr} onClose={() => setQr(null)}>
        {qr ? <div className="text-center"><img src={qr.qr_url} className="mx-auto h-56 w-56" alt="QR" /><p className="mt-2">{qr.account_name}</p><p>{formatMoney(qr.remain)}</p></div> : null}
      </Modal>
    </AppShell>
  );
}
