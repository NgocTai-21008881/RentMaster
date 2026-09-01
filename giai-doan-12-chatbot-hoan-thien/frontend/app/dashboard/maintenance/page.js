"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import { Badge, Button, Field, inputClass } from "@/components/ui";
import { maintenanceApi } from "@/lib/api";
import { qs } from "@/lib/format";
import { useToast } from "@/context/ToastContext";

const statusLabel = { new: "Mới", processing: "Đang xử lý", resolved: "Đã xử lý", closed: "Đã đóng" };

export default function MaintenancePage() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({ status: "processing", response: "" });

  async function load() {
    setRows((await maintenanceApi.list(qs({ limit: 30 }))).data.items);
  }
  useEffect(() => { load().catch((e) => toast.error(e.message)); }, []);

  return (
    <AppShell title="Yêu cầu hỗ trợ" allow="staff">
      <DataTable rows={rows} columns={[
        { key: "title", label: "Tiêu đề" },
        { key: "tenant_name", label: "Người thuê" },
        { key: "room_code", label: "Phòng" },
        { key: "priority", label: "Ưu tiên" },
        { key: "status", label: "Trạng thái", render: (r) => <Badge className="bg-violet-50 text-violet-700">{statusLabel[r.status]}</Badge> },
        { key: "a", label: "", render: (row) => <button className="text-indigo-600" onClick={() => { setCurrent(row); setForm({ status: row.status, response: row.response || "" }); }}>Xử lý</button> },
      ]} />
      <Modal title={current?.title} open={!!current} onClose={() => setCurrent(null)} footer={<Button onClick={async () => { await maintenanceApi.update(current.id, form); toast.success("Đã cập nhật"); setCurrent(null); load(); }}>Lưu</Button>}>
        <p className="text-sm text-slate-600">{current?.content}</p>
        <Field label="Trạng thái">
          <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Phản hồi"><textarea className={inputClass} value={form.response} onChange={(e) => setForm({ ...form, response: e.target.value })} /></Field>
      </Modal>
    </AppShell>
  );
}
