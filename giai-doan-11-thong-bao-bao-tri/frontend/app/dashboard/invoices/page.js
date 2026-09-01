"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import DataTable, { Pagination } from "@/components/DataTable";
import Modal from "@/components/Modal";
import { Badge, Button, Field, inputClass } from "@/components/ui";
import { contractApi, invoiceApi, openPdf, paymentApi } from "@/lib/api";
import { formatDate, formatMoney, invoiceStatusClass, invoiceStatusLabel, qs } from "@/lib/format";
import { useToast } from "@/context/ToastContext";

export default function InvoicesPage() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [contracts, setContracts] = useState([]);
  const [open, setOpen] = useState(false);
  const [pay, setPay] = useState(null);
  const [qr, setQr] = useState(null);
  const [contractId, setContractId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");

  async function load(p = page) {
    const res = await invoiceApi.list(qs({ status, page: p, limit: 10 }));
    setRows(res.data.items);
    setTotal(res.data.total);
  }
  useEffect(() => { contractApi.list(qs({ limit: 50 })).then((r) => setContracts(r.data.items)); }, []);
  useEffect(() => { load(1).catch((e) => toast.error(e.message)); }, [status]);

  return (
    <AppShell title="Hóa đơn" allow="staff">
      <div className="flex flex-wrap gap-3">
        <select className={`${inputClass} max-w-48`} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(invoiceStatusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <Button className="ml-auto" onClick={() => setOpen(true)}>Tạo hóa đơn tháng</Button>
      </div>
      <DataTable rows={rows} columns={[
        { key: "code", label: "Mã" },
        { key: "tenant_name", label: "Người thuê" },
        { key: "room_code", label: "Phòng" },
        { key: "period", label: "Kỳ" },
        { key: "total", label: "Tổng", render: (r) => formatMoney(r.total) },
        { key: "paid_amount", label: "Đã thu", render: (r) => formatMoney(r.paid_amount) },
        { key: "due_date", label: "Hạn", render: (r) => formatDate(r.due_date) },
        { key: "status", label: "TT", render: (r) => <Badge className={invoiceStatusClass[r.status]}>{invoiceStatusLabel[r.status]}</Badge> },
        { key: "a", label: "", render: (row) => (
          <div className="flex gap-2 text-sm">
            <button onClick={() => openPdf(`/invoices/${row.id}/pdf`)}>PDF</button>
            {row.status !== "paid" ? <button className="text-indigo-600" onClick={() => { setPay(row); setAmount(Number(row.total) - Number(row.paid_amount)); }}>Thu tiền</button> : null}
            <button onClick={async () => setQr((await paymentApi.qr(row.id)).data)}>QR</button>
          </div>
        )},
      ]} />
      <Pagination page={page} total={total} limit={10} onPage={(p) => { setPage(p); load(p); }} />
      <Modal title="Tạo hóa đơn từ hợp đồng" open={open} onClose={() => setOpen(false)} footer={<Button onClick={async () => { try { await invoiceApi.create({ contract_id: contractId }); toast.success("Đã tạo hóa đơn"); setOpen(false); load(); } catch (e) { toast.error(e.message); } }}>Tạo</Button>}>
        <Field label="Hợp đồng">
          <select className={inputClass} value={contractId} onChange={(e) => setContractId(e.target.value)}>
            <option value="">Chọn</option>
            {contracts.filter((c) => c.status !== "terminated").map((c) => <option key={c.id} value={c.id}>{c.code} — {c.tenant_name}</option>)}
          </select>
        </Field>
      </Modal>
      <Modal title="Xác nhận thanh toán" open={!!pay} onClose={() => setPay(null)} footer={<Button onClick={async () => { try { await paymentApi.create({ invoice_id: pay.id, amount, method }); toast.success("Đã ghi nhận"); setPay(null); load(); } catch (e) { toast.error(e.message); } }}>Xác nhận</Button>}>
        <p className="text-sm">Hóa đơn {pay?.code} còn {formatMoney(pay ? Number(pay.total) - Number(pay.paid_amount) : 0)}</p>
        <Field label="Số tiền"><input className={inputClass} value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
        <Field label="Hình thức">
          <select className={inputClass} value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="cash">Tiền mặt</option>
            <option value="transfer">Chuyển khoản</option>
          </select>
        </Field>
      </Modal>
      <Modal title="QR chuyển khoản" open={!!qr} onClose={() => setQr(null)}>
        {qr ? (
          <div className="text-center">
            <img src={qr.qr_url} alt="QR" className="mx-auto h-56 w-56 rounded-xl border" />
            <p className="mt-2 text-sm">{qr.account_name} · {qr.bank_code} · {qr.bank_account}</p>
            <p className="font-semibold">{formatMoney(qr.remain)}</p>
          </div>
        ) : null}
      </Modal>
    </AppShell>
  );
}
