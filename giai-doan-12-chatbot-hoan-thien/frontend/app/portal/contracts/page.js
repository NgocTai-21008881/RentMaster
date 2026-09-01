"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import DataTable from "@/components/DataTable";
import { contractApi, openPdf } from "@/lib/api";
import { contractStatusLabel, formatDate, formatMoney } from "@/lib/format";
import { Button } from "@/components/ui";
import { useToast } from "@/context/ToastContext";

export default function PortalContracts() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  async function load() {
    setRows((await contractApi.list()).data.items);
  }
  useEffect(() => { load(); }, []);
  return (
    <AppShell title="Hợp đồng của tôi" allow="tenant">
      <DataTable rows={rows} columns={[
        { key: "code", label: "Mã" },
        { key: "room_code", label: "Phòng" },
        { key: "start_date", label: "Bắt đầu", render: (r) => formatDate(r.start_date) },
        { key: "end_date", label: "Kết thúc", render: (r) => formatDate(r.end_date) },
        { key: "rent_amount", label: "Tiền thuê", render: (r) => formatMoney(r.rent_amount) },
        { key: "status", label: "TT", render: (r) => contractStatusLabel[r.computed_status || r.status] },
        { key: "a", label: "", render: (row) => (
          <div className="flex gap-2">
            <button onClick={() => openPdf(`/contracts/${row.id}/pdf`)}>PDF</button>
            {!row.tenant_confirmed_at ? <Button onClick={async () => { await contractApi.confirm(row.id); toast.success("Đã xác nhận"); load(); }}>Xác nhận</Button> : <span>Đã xác nhận</span>}
          </div>
        )},
      ]} />
    </AppShell>
  );
}
