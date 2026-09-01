"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { notiApi } from "@/lib/api";
import { Button } from "@/components/ui";

export default function PortalNoti() {
  const [items, setItems] = useState([]);
  async function load() {
    setItems((await notiApi.list()).data.rows);
  }
  useEffect(() => { load(); }, []);
  return (
    <AppShell title="Thông báo" allow="tenant">
      <div className="flex justify-end"><Button variant="ghost" onClick={async () => { await notiApi.readAll(); load(); }}>Đánh dấu tất cả đã đọc</Button></div>
      <div className="space-y-2">
        {items.map((item) => (
          <button key={item.id} className={`block w-full rounded-2xl p-4 text-left ${item.is_read ? "bg-white" : "bg-indigo-50"}`} onClick={async () => { await notiApi.read(item.id); load(); }}>
            <p className="font-semibold">{item.title}</p>
            <p className="text-sm text-slate-600">{item.message}</p>
          </button>
        ))}
      </div>
    </AppShell>
  );
}
