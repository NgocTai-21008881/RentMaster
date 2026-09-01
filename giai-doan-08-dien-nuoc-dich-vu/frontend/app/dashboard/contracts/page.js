"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import DataTable, { Pagination } from "@/components/DataTable";
import Modal from "@/components/Modal";
import { Badge, Button, Field, inputClass } from "@/components/ui";
import { contractApi, openPdf, roomApi, tenantApi } from "@/lib/api";
import { contractStatusLabel, formatDate, formatMoney, qs } from "@/lib/format";
import { useToast } from "@/context/ToastContext";

const empty = { tenant_id: "", room_id: "", start_date: "", end_date: "", rent_amount: "", deposit_amount: "", payment_day: 5, terms: "", status: "pending" };

export default function ContractsPage() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(null);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [renewDate, setRenewDate] = useState("");

  async function load(p = page) {
    const res = await contractApi.list(qs({ search, page: p, limit: 10 }));
    setRows(res.data.items);
    setTotal(res.data.total);
  }
  useEffect(() => {
    tenantApi.list(qs({ limit: 50 })).then((r) => setTenants(r.data.items));
    roomApi.list(qs({ limit: 50 })).then((r) => setRooms(r.data.items));
  }, []);
  useEffect(() => { load(1).catch((e) => toast.error(e.message)); }, [search]);

  async function save() {
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v ?? ""));
      if (file) data.append("file", file);
      await contractApi.save(null, data);
      toast.success("Đã tạo hợp đồng");
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <AppShell title="Hợp đồng thuê" allow="staff">
      <div className="flex gap-3">
        <input className={`${inputClass} max-w-xs`} placeholder="Tìm mã HĐ, người thuê..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button className="ml-auto" onClick={() => { setForm(empty); setOpen(true); }}>Tạo hợp đồng</Button>
      </div>
      <DataTable rows={rows} columns={[
        { key: "code", label: "Mã" },
        { key: "tenant_name", label: "Người thuê" },
        { key: "room_code", label: "Phòng" },
        { key: "start_date", label: "Bắt đầu", render: (r) => formatDate(r.start_date) },
        { key: "end_date", label: "Kết thúc", render: (r) => formatDate(r.end_date) },
        { key: "rent_amount", label: "Tiền thuê", render: (r) => formatMoney(r.rent_amount) },
        { key: "status", label: "Trạng thái", render: (r) => <Badge className="bg-indigo-50 text-indigo-700">{contractStatusLabel[r.computed_status || r.status]}</Badge> },
        { key: "a", label: "", render: (row) => (
          <div className="flex flex-wrap gap-2 text-sm">
            <button className="text-slate-600" onClick={async () => setView((await contractApi.get(row.id)).data)}>Xem</button>
            <button className="text-indigo-600" onClick={() => openPdf(`/contracts/${row.id}/pdf`)}>PDF</button>
            {row.status === "pending" ? <button onClick={async () => { await contractApi.activate(row.id); load(); }}>Kích hoạt</button> : null}
            {row.status !== "terminated" ? <button className="text-rose-600" onClick={async () => { if (confirm("Chấm dứt?")) { await contractApi.terminate(row.id); load(); } }}>Chấm dứt</button> : null}
          </div>
        )},
      ]} />
      <Pagination page={page} total={total} limit={10} onPage={(p) => { setPage(p); load(p); }} />
      <Modal title="Tạo hợp đồng" open={open} onClose={() => setOpen(false)} footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Hủy</Button><Button onClick={save}>Lưu</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Người thuê">
            <select className={inputClass} value={form.tenant_id} onChange={(e) => setForm({ ...form, tenant_id: e.target.value })}>
              <option value="">Chọn</option>
              {tenants.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>
          </Field>
          <Field label="Phòng">
            <select className={inputClass} value={form.room_id} onChange={(e) => {
              const room = rooms.find((r) => String(r.id) === e.target.value);
              setForm({ ...form, room_id: e.target.value, rent_amount: room?.rent_price || "", deposit_amount: room?.deposit || "" });
            }}>
              <option value="">Chọn</option>
              {rooms.map((r) => <option key={r.id} value={r.id}>{r.code} — {r.property_name}</option>)}
            </select>
          </Field>
          <Field label="Ngày bắt đầu"><input type="date" className={inputClass} value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></Field>
          <Field label="Ngày kết thúc"><input type="date" className={inputClass} value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></Field>
          <Field label="Tiền thuê"><input className={inputClass} value={form.rent_amount} onChange={(e) => setForm({ ...form, rent_amount: e.target.value })} /></Field>
          <Field label="Tiền cọc"><input className={inputClass} value={form.deposit_amount} onChange={(e) => setForm({ ...form, deposit_amount: e.target.value })} /></Field>
        </div>
        <Field label="Điều khoản"><textarea className={inputClass} rows={3} value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} /></Field>
        <Field label="File hợp đồng"><input type="file" onChange={(e) => setFile(e.target.files[0])} /></Field>
      </Modal>
      <Modal title={view?.code || "Hợp đồng"} open={!!view} onClose={() => setView(null)}>
        {view ? (
          <div className="space-y-2 text-sm">
            <p>{view.tenant_name} · {view.room_code} · {view.property_name}</p>
            <p>{formatDate(view.start_date)} → {formatDate(view.end_date)}</p>
            <p>Thuê {formatMoney(view.rent_amount)} · Cọc {formatMoney(view.deposit_amount)}</p>
            <p>Người thuê xác nhận: {view.tenant_confirmed_at || "Chưa"}</p>
            <p>Chủ nhà xác nhận: {view.owner_confirmed_at || "Chưa"}</p>
            <p className="whitespace-pre-wrap">{view.terms}</p>
            <div className="flex gap-2">
              <Button onClick={() => contractApi.confirm(view.id).then(() => contractApi.get(view.id).then((r) => setView(r.data)))}>Xác nhận chủ nhà</Button>
              <div className="flex items-center gap-2">
                <input type="date" className={inputClass} value={renewDate} onChange={(e) => setRenewDate(e.target.value)} />
                <Button variant="ghost" onClick={async () => { await contractApi.renew(view.id, renewDate); load(); toast.success("Đã gia hạn"); }}>Gia hạn</Button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </AppShell>
  );
}
