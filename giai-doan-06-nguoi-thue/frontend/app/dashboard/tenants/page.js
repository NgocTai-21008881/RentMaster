"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import DataTable, { Pagination } from "@/components/DataTable";
import Modal from "@/components/Modal";
import { Button, Field, inputClass } from "@/components/ui";
import { roomApi, tenantApi } from "@/lib/api";
import { qs } from "@/lib/format";
import { useToast } from "@/context/ToastContext";

const empty = { full_name: "", date_of_birth: "", gender: "male", id_number: "", phone: "", email: "", permanent_address: "", emergency_contact: "", emergency_phone: "", notes: "", room_id: "" };

export default function TenantsPage() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [rooms, setRooms] = useState([]);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  async function load(p = page) {
    const res = await tenantApi.list(qs({ search, page: p, limit: 10 }));
    setRows(res.data.items);
    setTotal(res.data.total);
  }
  useEffect(() => { roomApi.list(qs({ limit: 50 })).then((r) => setRooms(r.data.items)); }, []);
  useEffect(() => { load(1).catch((e) => toast.error(e.message)); }, [search]);

  async function save() {
    try {
      if (editing) await tenantApi.update(editing.id, form);
      else await tenantApi.create(form);
      toast.success("Đã lưu người thuê");
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <AppShell title="Người thuê" allow="staff">
      <div className="flex gap-3">
        <input className={`${inputClass} max-w-xs`} placeholder="Tìm tên, SĐT, CCCD..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button className="ml-auto" onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}>Thêm người thuê</Button>
      </div>
      <DataTable rows={rows} columns={[
        { key: "full_name", label: "Họ tên" },
        { key: "phone", label: "SĐT" },
        { key: "email", label: "Email" },
        { key: "id_number", label: "CCCD" },
        { key: "room_code", label: "Phòng", render: (r) => r.room_code || "Chưa gán" },
        { key: "a", label: "", render: (row) => (
          <div className="flex gap-2">
            <button className="text-slate-600" onClick={async () => setDetail((await tenantApi.get(row.id)).data)}>Chi tiết</button>
            <button className="text-indigo-600" onClick={() => { setEditing(row); setForm({ ...empty, ...row, date_of_birth: row.date_of_birth ? String(row.date_of_birth).slice(0,10) : "" }); setOpen(true); }}>Sửa</button>
            <button className="text-rose-600" onClick={async () => { if (confirm("Xóa?")) { await tenantApi.remove(row.id); load(); } }}>Xóa</button>
          </div>
        )},
      ]} />
      <Pagination page={page} total={total} limit={10} onPage={(p) => { setPage(p); load(p); }} />
      <Modal title={editing ? "Sửa người thuê" : "Thêm người thuê"} open={open} onClose={() => setOpen(false)} footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Hủy</Button><Button onClick={save}>Lưu</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Họ tên"><input className={inputClass} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
          <Field label="Ngày sinh"><input type="date" className={inputClass} value={form.date_of_birth || ""} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} /></Field>
          <Field label="Giới tính">
            <select className={inputClass} value={form.gender || ""} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="male">Nam</option><option value="female">Nữ</option><option value="other">Khác</option>
            </select>
          </Field>
          <Field label="CCCD"><input className={inputClass} value={form.id_number || ""} onChange={(e) => setForm({ ...form, id_number: e.target.value })} /></Field>
          <Field label="SĐT"><input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Email"><input className={inputClass} value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        </div>
        <Field label="Địa chỉ thường trú"><input className={inputClass} value={form.permanent_address || ""} onChange={(e) => setForm({ ...form, permanent_address: e.target.value })} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Liên hệ khẩn cấp"><input className={inputClass} value={form.emergency_contact || ""} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} /></Field>
          <Field label="SĐT khẩn cấp"><input className={inputClass} value={form.emergency_phone || ""} onChange={(e) => setForm({ ...form, emergency_phone: e.target.value })} /></Field>
        </div>
        <Field label="Phòng">
          <select className={inputClass} value={form.room_id || ""} onChange={(e) => setForm({ ...form, room_id: e.target.value })}>
            <option value="">Chưa gán</option>
            {rooms.map((r) => <option key={r.id} value={r.id}>{r.code} — {r.property_name}</option>)}
          </select>
        </Field>
        <Field label="Ghi chú"><textarea className={inputClass} value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      </Modal>
      <Modal title="Hồ sơ người thuê" open={!!detail} onClose={() => setDetail(null)}>
        {detail ? (
          <div className="space-y-2 text-sm">
            <p><b>{detail.full_name}</b> · {detail.phone}</p>
            <p>Phòng hiện tại: {detail.room_code || "Chưa gán"}</p>
            <p className="font-medium">Hợp đồng</p>
            {(detail.contracts || []).map((c) => <p key={c.id}>{c.code} — {c.status}</p>)}
            <p className="font-medium">Hóa đơn</p>
            {(detail.invoices || []).map((c) => <p key={c.id}>{c.code} — {c.status}</p>)}
          </div>
        ) : null}
      </Modal>
    </AppShell>
  );
}
