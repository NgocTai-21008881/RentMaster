"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import { Badge, Button, Field, inputClass } from "@/components/ui";
import { userApi } from "@/lib/api";
import { qs, roleLabel } from "@/lib/format";
import { useToast } from "@/context/ToastContext";

export default function UsersPage() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [logs, setLogs] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "manager", password: "Demo@123" });

  async function load() {
    setRows((await userApi.list(qs({ limit: 20 }))).data.items);
    setLogs((await userApi.logs(qs({ limit: 8 }))).data.items);
  }
  useEffect(() => { load().catch((e) => toast.error(e.message)); }, []);

  return (
    <AppShell title="Tài khoản & hoạt động" allow="admin">
      <div className="flex justify-end"><Button onClick={() => setOpen(true)}>Tạo tài khoản</Button></div>
      <DataTable rows={rows} columns={[
        { key: "name", label: "Tên" },
        { key: "email", label: "Email" },
        { key: "role", label: "Vai trò", render: (r) => roleLabel[r.role] },
        { key: "status", label: "TT", render: (r) => <Badge className={r.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}>{r.status}</Badge> },
        { key: "a", label: "", render: (row) => (
          <div className="flex gap-2">
            <button onClick={async () => { await userApi.lock(row.id); load(); }}>{row.status === "locked" ? "Mở khóa" : "Khóa"}</button>
            <button className="text-rose-600" onClick={async () => { if (confirm("Xóa?")) { await userApi.remove(row.id); load(); } }}>Xóa</button>
          </div>
        )},
      ]} />
      <h2 className="font-semibold">Nhật ký hoạt động</h2>
      <DataTable rows={logs} columns={[
        { key: "user_name", label: "Người dùng" },
        { key: "action", label: "Hành động" },
        { key: "entity", label: "Đối tượng" },
        { key: "detail", label: "Chi tiết" },
      ]} />
      <Modal title="Tạo tài khoản" open={open} onClose={() => setOpen(false)} footer={<Button onClick={async () => { try { await userApi.create(form); toast.success("Đã tạo"); setOpen(false); load(); } catch (e) { toast.error(e.message); } }}>Tạo</Button>}>
        <Field label="Tên"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Email"><input className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="SĐT"><input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="Vai trò">
          <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="admin">Admin</option>
            <option value="owner">Chủ nhà</option>
            <option value="manager">Quản lý</option>
            <option value="tenant">Người thuê</option>
          </select>
        </Field>
        <Field label="Mật khẩu"><input className={inputClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
      </Modal>
    </AppShell>
  );
}
