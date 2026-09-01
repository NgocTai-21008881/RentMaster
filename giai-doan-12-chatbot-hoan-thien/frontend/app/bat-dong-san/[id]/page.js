"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import { RoomCard } from "@/components/site/Cards";
import { catalogApi } from "@/lib/api";
import { propertyTypeLabel } from "@/lib/format";

export default function PropertyPublicPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    catalogApi.property(id).then((r) => setData(r.data)).catch(() => {});
  }, [id]);

  if (!data) {
    return (
      <div className="site-hero min-h-screen">
        <SiteNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f1ea]">
      <div className="relative h-[420px]">
        <img src={data.image_url} alt={data.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
        <div className="absolute inset-x-0 top-0">
          <SiteNav />
        </div>
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-10 lg:px-6">
          <span className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-bold text-slate-900">{propertyTypeLabel[data.type]}</span>
          <h1 className="mt-3 text-4xl font-extrabold text-white">{data.name}</h1>
          <p className="mt-2 text-indigo-100">{data.address}</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <p className="max-w-3xl text-lg text-slate-600">{data.description}</p>
        <h2 className="mt-10 text-2xl font-extrabold">Phòng tại đây</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {(data.rooms || []).map((room) => (
            <RoomCard key={room.id} room={{ ...room, property_name: data.name }} />
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
