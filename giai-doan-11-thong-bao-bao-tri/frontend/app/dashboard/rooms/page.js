"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import DataTable, { Pagination } from "@/components/DataTable";
import Modal from "@/components/Modal";
import { Badge, Button, Field, inputClass } from "@/components/ui";
import { propertyApi, roomApi, serviceApi } from "@/lib/api";
import { formatMoney, qs, roomStatusClass, roomStatusLabel } from "@/lib/format";
import { useToast } from "@/context/ToastContext";

const empty = { property_id: "", code: "", name: "", floor: "", area: "", rent_price: "", deposit: "", max_occupants: 2, amenities: "", status: "vacant", service_ids: [] };

export default function RoomsPage() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [properties, setProperties] = useState([]);
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState({ search: "", status: "", property_id: "" });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load(p = page) {
    const res = await roomApi.list(qs({ ...filter, page: p, limit: 10 }));
    setRows(res.data.items);
    setTotal(res.data.total);
  }

  useEffect(() => {
    propertyApi.list(qs({ limit: 50 })).then((r) => setProperties(r.data.items));
    serviceApi.list().then((r) => setServices(r.data));
  }, []);
  useEffect(() => { load(1).catch((e) => toast.error(e.message)); }, [filter.search, filter.status, filter.property_id]);

  function openEdit(row) {
    setEditing(row);
    setForm(row ? { ...empty, ...row, service_ids: (row.services || []).map((s) => s.service_type_id) } : { ...empty, property_id: filter.property_id });
    setFile(null);
    setOpen(true);
    if (row) roomApi.get(row.id).then((r) => setForm((f) => ({ ...f, ...r.data, service_ids: (r.data.services || []).map((s) => s.service_type_id) })));
  }

  async function save() {
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "service_ids") data.append(k, (v || []).join(","));
        else data.append(k, v ?? "");
      });
      if (file) data.append("image", file);
      await roomApi.save(editing?.id, data);
      toast.success("Đã lưu phòng");
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell title="Phòng / Căn hộ" allow="staff">
      <div className="flex flex-wrap gap-3">
        <input className={`${inputClass} max-w-xs`} placeholder="Tìm mã, tên phòng" value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} />
        <select className={`${inputClass} max-w-48`} value={filter.property_id} onChange={(e) => setFilter({ ...filter, property_id: e.target.value })}>
          <option value="">Tất cả BĐS</option>
          {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className={`${inputClass} max-w-40`} value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(roomStatusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <Button className="ml-auto" onClick={() => openEdit(null)}>Thêm phòng</Button>
      </div>
      <DataTable rows={rows} columns={[
        { key: "code", label: "Mã" },
        { key: "name", label: "Tên phòng" },
        { key: "property_name", label: "BĐS" },
        { key: "floor", label: "Tầng" },
        { key: "area", label: "m²" },
        { key: "rent_price", label: "Giá thuê", render: (r) => formatMoney(r.rent_price) },
        { key: "status", label: "Trạng thái", render: (r) => <Badge className={roomStatusClass[r.status]}>{roomStatusLabel[r.status]}</Badge> },
        { key: "a", label: "", render: (row) => (
          <div className="flex gap-2">
            <button className="text-indigo-600" onClick={() => openEdit(row)}>Sửa</button>
            <button className="text-rose-600" onClick={async () => { if (confirm("Xóa phòng?")) { await roomApi.remove(row.id); load(); } }}>Xóa</button>
          </div>
        )},
      ]} />
      <Pagination page={page} total={total} limit={10} onPage={(p) => { setPage(p); load(p); }} />
      <Modal title={editing ? "Sửa phòng" : "Thêm phòng"} open={open} onClose={() => setOpen(false)} footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Hủy</Button><Button disabled={saving} onClick={save}>Lưu</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="BĐS">
            <select className={inputClass} value={form.property_id} onChange={(e) => setForm({ ...form, property_id: e.target.value })}>
              <option value="">Chọn</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Mã phòng"><input className={inputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Field>
          <Field label="Tên"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Tầng"><input className={inputClass} value={form.floor || ""} onChange={(e) => setForm({ ...form, floor: e.target.value })} /></Field>
          <Field label="Diện tích"><input className={inputClass} value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></Field>
          <Field label="Giá thuê"><input className={inputClass} value={form.rent_price} onChange={(e) => setForm({ ...form, rent_price: e.target.value })} /></Field>
          <Field label="Giá cọc"><input className={inputClass} value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} /></Field>
          <Field label="Số người tối đa"><input className={inputClass} value={form.max_occupants} onChange={(e) => setForm({ ...form, max_occupants: e.target.value })} /></Field>
        </div>
        <Field label="Tiện nghi"><input className={inputClass} value={form.amenities || ""} onChange={(e) => setForm({ ...form, amenities: e.target.value })} /></Field>
        <Field label="Trạng thái">
          <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {Object.entries(roomStatusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Dịch vụ">
          <div className="flex flex-wrap gap-2">
            {services.map((s) => (
              <label key={s.id} className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={(form.service_ids || []).map(Number).includes(s.id)} onChange={(e) => {
                  const ids = new Set((form.service_ids || []).map(Number));
                  e.target.checked ? ids.add(s.id) : ids.delete(s.id);
                  setForm({ ...form, service_ids: [...ids] });
                }} />
                {s.name}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Ảnh"><input type="file" onChange={(e) => setFile(e.target.files[0])} /></Field>
      </Modal>
    </AppShell>
  );
}
