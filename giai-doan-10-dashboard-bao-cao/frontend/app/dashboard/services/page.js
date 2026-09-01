"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import { Button, Field, inputClass } from "@/components/ui";
import { serviceApi } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { useToast } from "@/context/ToastContext";

export default function ServicesPage() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", unit_price: "", description: "", is_active: 1 });
  const [editing, setEditing] = useState(null);

  async function load() {
    setRows((await serviceApi.list()).data);
  }
  useEffect(() => { load().catch((e) => toast.error(e.message)); }, []);

  return (
    <AppShell title="Dịch vụ & phí" allow="staff">
      <div className="flex justify-end"><Button onClick={() => { setEditing(null); setForm({ name: "", unit_price: "", description: "", is_active: 1 }); setOpen(true); }}>Thêm dịch vụ</Button></div>
      <DataTable rows={rows} columns={[
        { key: "name", label: "Tên phí" },
        { key: "unit_price", label: "Đơn giá", render: (r) => formatMoney(r.unit_price) },
        { key: "description", label: "Mô tả" },
        { key: "is_active", label: "Kích hoạt", render: (r) => (r.is_active ? "Có" : "Không") },
        { key: "a", label: "", render: (row) => (
          <div className="flex gap-2">
            <button className="text-indigo-600" onClick={() => { setEditing(row); setForm(row); setOpen(true); }}>Sửa</button>
            <button className="text-rose-600" onClick={async () => { await serviceApi.remove(row.id); load(); }}>Xóa</button>
          </div>
        )},
      ]} />
      <Modal title="Dịch vụ" open={open} onClose={() => setOpen(false)} footer={<Button onClick={async () => { editing ? await serviceApi.update(editing.id, form) : await serviceApi.create(form); setOpen(false); load(); }}>Lưu</Button>}>
        <Field label="Tên"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Đơn giá"><input className={inputClass} value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} /></Field>
        <Field label="Mô tả"><input className={inputClass} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      </Modal>
    </AppShell>
  );
}
