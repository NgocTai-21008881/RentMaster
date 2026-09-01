"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import DataTable, { Pagination } from "@/components/DataTable";
import Modal from "@/components/Modal";
import { Button, Field, inputClass, Badge } from "@/components/ui";
import { propertyApi } from "@/lib/api";
import { propertyTypeLabel, qs } from "@/lib/format";
import { useToast } from "@/context/ToastContext";

const empty = { name: "", type: "apartment", address: "", description: "", status: "active", manager_id: "" };

export default function PropertiesPage() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load(nextPage = page) {
    const res = await propertyApi.list(qs({ page: nextPage, search, type, limit: 8 }));
    setRows(res.data.items);
    setTotal(res.data.total);
  }

  useEffect(() => {
    load(1).catch((e) => toast.error(e.message));
  }, [search, type]);

  function openEdit(row) {
    setEditing(row);
    setForm(row ? { name: row.name, type: row.type, address: row.address, description: row.description || "", status: row.status, manager_id: row.manager_id || "" } : empty);
    setFile(null);
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v ?? ""));
      if (file) data.append("image", file);
      await propertyApi.save(editing?.id, data);
      toast.success("Đã lưu bất động sản");
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell title="Bất động sản" allow="staff">
      <div className="flex flex-wrap items-center gap-3">
        <input className={`${inputClass} max-w-xs`} placeholder="Tìm tên, địa chỉ..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={`${inputClass} max-w-40`} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Tất cả loại</option>
          <option value="apartment">Căn hộ</option>
          <option value="homestay">Homestay</option>
          <option value="boarding">Nhà trọ</option>
        </select>
        <Button className="ml-auto" onClick={() => openEdit(null)}>
          Thêm bất động sản
        </Button>
      </div>
      <DataTable
        rows={rows}
        columns={[
          {
            key: "name",
            label: "Tên",
            render: (row) => (
              <div className="flex items-center gap-3">
                {row.image_url ? <img src={row.image_url} alt="" className="h-12 w-16 rounded-lg object-cover" /> : null}
                <div>
                  <p className="font-medium">{row.name}</p>
                  <p className="text-xs text-slate-500">{row.address}</p>
                </div>
              </div>
            ),
          },
          { key: "type", label: "Loại", render: (r) => propertyTypeLabel[r.type] },
          { key: "room_count", label: "Số phòng" },
          { key: "manager_name", label: "Người quản lý" },
          { key: "status", label: "Trạng thái", render: (r) => <Badge className={r.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100"}>{r.status}</Badge> },
          {
            key: "a",
            label: "",
            render: (row) => (
              <div className="flex gap-2">
                <button className="text-indigo-600" onClick={() => openEdit(row)}>Sửa</button>
                <button
                  className="text-rose-600"
                  onClick={async () => {
                    if (!confirm("Xóa bất động sản này?")) return;
                    await propertyApi.remove(row.id);
                    load();
                  }}
                >
                  Xóa
                </button>
              </div>
            ),
          },
        ]}
      />
      <Pagination page={page} total={total} limit={8} onPage={(p) => { setPage(p); load(p); }} />
      <Modal title={editing ? "Sửa BĐS" : "Thêm BĐS"} open={open} onClose={() => setOpen(false)} footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Hủy</Button><Button disabled={saving} onClick={save}>Lưu</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Loại">
            <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="apartment">Căn hộ</option>
              <option value="homestay">Homestay</option>
              <option value="boarding">Nhà trọ</option>
            </select>
          </Field>
        </div>
        <Field label="Địa chỉ"><input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
        <Field label="Mô tả"><textarea className={inputClass} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <Field label="Trạng thái">
          <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngừng</option>
          </select>
        </Field>
        <Field label="Ảnh"><input type="file" onChange={(e) => setFile(e.target.files[0])} /></Field>
      </Modal>
    </AppShell>
  );
}
