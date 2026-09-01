"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import { Button, Field, inputClass } from "@/components/ui";
import { maintenanceApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export default function PortalRequests() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "other", priority: "medium" });
  const [file, setFile] = useState(null);

  async function load() {
    setRows((await maintenanceApi.list()).data.items);
  }
  useEffect(() => { load(); }, []);

  return (
    <AppShell title="Yêu cầu hỗ trợ" allow="tenant">
      <div className="flex justify-end"><Button onClick={() => setOpen(true)}>Gửi yêu cầu</Button></div>
      <DataTable rows={rows} columns={[
        { key: "title", label: "Tiêu đề" },
        { key: "category", label: "Loại" },
        { key: "priority", label: "Ưu tiên" },
        { key: "status", label: "Trạng thái" },
        { key: "response", label: "Phản hồi" },
      ]} />
      <Modal title="Báo sự cố" open={open} onClose={() => setOpen(false)} footer={<Button onClick={async () => {
        const data = new FormData();
        Object.entries(form).forEach(([k, v]) => data.append(k, v));
        if (file) data.append("image", file);
        try { await maintenanceApi.create(data); toast.success("Đã gửi"); setOpen(false); load(); } catch (e) { toast.error(e.message); }
      }}>Gửi</Button>}>
        <Field label="Tiêu đề"><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Nội dung"><textarea className={inputClass} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></Field>
        <Field label="Loại">
          <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="electric">Điện</option>
            <option value="water">Nước</option>
            <option value="internet">Internet</option>
            <option value="ac">Điều hòa</option>
            <option value="device">Thiết bị</option>
            <option value="other">Khác</option>
          </select>
        </Field>
        <Field label="Ưu tiên">
          <select className={inputClass} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Thấp</option><option value="medium">Trung bình</option><option value="high">Cao</option>
          </select>
        </Field>
        <Field label="Ảnh"><input type="file" onChange={(e) => setFile(e.target.files[0])} /></Field>
      </Modal>
    </AppShell>
  );
}
