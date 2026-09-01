"use client";

import Link from "next/link";
import { MapPin, Maximize2, Users } from "lucide-react";
import { formatMoney, propertyTypeLabel, roomStatusLabel } from "@/lib/format";

export function RoomCard({ room }) {
  const statusTone = {
    vacant: "bg-emerald-400 text-emerald-950",
    occupied: "bg-white/90 text-slate-800",
    reserved: "bg-amber-300 text-amber-950",
    maintenance: "bg-rose-300 text-rose-950",
  };

  return (
    <Link href={`/phong/${room.id}`} className="group block overflow-hidden rounded-3xl bg-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-24px_rgba(79,70,229,0.45)]">
      <div className="relative h-56 overflow-hidden">
        <img
          src={room.image_url || "/images/home-2.jpg"}
          alt={room.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold ${statusTone[room.status] || "bg-white"}`}>
          {roomStatusLabel[room.status] || room.status}
        </span>
        <span className="absolute bottom-4 left-4 text-lg font-extrabold text-white">{formatMoney(room.rent_price)}<span className="text-sm font-medium text-white/80"> /tháng</span></span>
      </div>
      <div className="space-y-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">{room.code} · {room.property_name}</p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">{room.name}</h3>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1"><Maximize2 size={14} /> {room.area} m²</span>
          <span className="inline-flex items-center gap-1"><Users size={14} /> {room.max_occupants} người</span>
          <span className="inline-flex items-center gap-1"><MapPin size={14} /> Tầng {room.floor || "—"}</span>
        </div>
      </div>
    </Link>
  );
}

export function PropertyCard({ property }) {
  return (
    <Link href={`/bat-dong-san/${property.id}`} className="group relative block min-h-72 overflow-hidden rounded-3xl">
      <img
        src={property.image_url || "/images/about-space.jpg"}
        alt={property.name}
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
        <span className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-bold text-slate-900">
          {propertyTypeLabel[property.type]}
        </span>
        <h3 className="mt-3 text-2xl font-extrabold">{property.name}</h3>
        <p className="mt-1 text-sm text-white/80">{property.address}</p>
        <p className="mt-3 text-sm font-semibold text-cyan-200">{property.room_count} phòng</p>
      </div>
    </Link>
  );
}
