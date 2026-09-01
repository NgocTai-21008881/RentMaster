"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { authApi } from "@/lib/api";
import { formatMoney } from "@/lib/format";

export default function PortalRoom() {
  const [room, setRoom] = useState(null);
  useEffect(() => { authApi.me().then((r) => setRoom(r.data.room)); }, []);
  return (
    <AppShell title="Phòng đang thuê" allow="tenant">
      {room ? (
        <article className="overflow-hidden rounded-3xl bg-white shadow-sm">
          {room.image_url ? <img src={room.image_url} alt="" className="h-56 w-full object-cover" /> : null}
          <div className="space-y-2 p-6">
            <h2 className="text-2xl font-bold">{room.code} — {room.name}</h2>
            <p className="text-slate-500">{room.property_name} · {room.property_address}</p>
            <p>Diện tích {room.area} m² · Tầng {room.floor || "-"} · Tối đa {room.max_occupants} người</p>
            <p className="text-lg font-semibold text-indigo-600">{formatMoney(room.rent_price)} / tháng · Cọc {formatMoney(room.deposit)}</p>
            <p>Tiện nghi: {room.amenities || "—"}</p>
          </div>
        </article>
      ) : <p>Bạn chưa được gán phòng.</p>}
    </AppShell>
  );
}
