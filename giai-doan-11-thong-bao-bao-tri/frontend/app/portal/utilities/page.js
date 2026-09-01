"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import DataTable from "@/components/DataTable";
import { utilityApi } from "@/lib/api";
import { formatMoney } from "@/lib/format";

export default function PortalUtilities() {
  const [rows, setRows] = useState([]);
  useEffect(() => { utilityApi.list().then((r) => setRows(r.data.items)); }, []);
  return (
    <AppShell title="Điện nước & phí" allow="tenant">
      <DataTable rows={rows} columns={[
        { key: "period", label: "Kỳ" },
        { key: "e", label: "Điện", render: (r) => `${r.electric_new - r.electric_old} kWh · ${formatMoney(r.electric_amount)}` },
        { key: "w", label: "Nước", render: (r) => `${r.water_new - r.water_old} m³ · ${formatMoney(r.water_amount)}` },
      ]} />
    </AppShell>
  );
}
