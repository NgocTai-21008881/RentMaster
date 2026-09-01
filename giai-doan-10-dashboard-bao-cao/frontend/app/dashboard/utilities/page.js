"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import { Button, Field, inputClass } from "@/components/ui";
import { roomApi, utilityApi } from "@/lib/api";
import { formatMoney, qs } from "@/lib/format";
import { useToast } from "@/context/ToastContext";

export default function UtilitiesPage() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [open, setOpen] = useState(false);
  const month = new Date().toISOString().slice(0, 7);
  const [form, setForm] = useState({ room_id: "", period: month, electric_old: 0, electric_new: 0, electric_rate: 3500, water_old: 0, water_new: 0, water_rate: 18000 });

  async function load() {
    const res = await utilityApi.list(qs({ limit: 30 }));
    setRows(res.data.items);
  }
  useEffect(() => {
    roomApi.list(qs({ limit: 50 })).then((r) => setRooms(r.data.items));
    load().catch((e) => toast.error(e.message));
  }, []);

  const elec = Math.max(0, Number(form.electric_new) - Number(form.electric_old));
  const water = Math.max(0, Number(form.water_new) - Number(form.water_old));

  return (
    <AppShell title="Điện – Nước" allow="staff">
      <div className="flex justify-end"><Button onClick={() => setOpen(true)}>Nhập chỉ số tháng</Button></div>
      <DataTable rows={rows} columns={[
        { key: "period", label: "Kỳ" },
        { key: "room_code", label: "Phòng" },
        { key: "e", label: "Điện", render: (r) => `${r.electric_old} → ${r.electric_new} (${formatMoney(r.electric_amount)})` },
        { key: "w", label: "Nước", render: (r) => `${r.water_old} → ${r.water_new} (${formatMoney(r.water_amount)})` },
      ]} />
      <Modal title="Nhập chỉ số" open={open} onClose={() => setOpen(false)} footer={<Button onClick={async () => { try { await utilityApi.save(form); toast.success("Đã lưu"); setOpen(false); load(); } catch (e) { toast.error(e.message); } }}>Lưu</Button>}>
        <Field label="Phòng">
          <select className={inputClass} value={form.room_id} onChange={(e) => setForm({ ...form, room_id: e.target.value })}>
            <option value="">Chọn phòng</option>
            {rooms.map((r) => <option key={r.id} value={r.id}>{r.code} — {r.property_name}</option>)}
          </select>
        </Field>
        <Field label="Kỳ (YYYY-MM)"><input className={inputClass} value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Điện cũ"><input className={inputClass} value={form.electric_old} onChange={(e) => setForm({ ...form, electric_old: e.target.value })} /></Field>
          <Field label="Điện mới"><input className={inputClass} value={form.electric_new} onChange={(e) => setForm({ ...form, electric_new: e.target.value })} /></Field>
          <Field label="Nước cũ"><input className={inputClass} value={form.water_old} onChange={(e) => setForm({ ...form, water_old: e.target.value })} /></Field>
          <Field label="Nước mới"><input className={inputClass} value={form.water_new} onChange={(e) => setForm({ ...form, water_new: e.target.value })} /></Field>
        </div>
        <p className="text-sm text-slate-600">Tiêu thụ điện {elec} × {form.electric_rate} = {formatMoney(elec * form.electric_rate)} · Nước {water} × {form.water_rate} = {formatMoney(water * form.water_rate)}</p>
      </Modal>
    </AppShell>
  );
}
