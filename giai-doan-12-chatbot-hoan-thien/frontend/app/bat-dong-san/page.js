"use client";

import { useEffect, useState } from "react";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import { PropertyCard } from "@/components/site/Cards";
import { catalogApi } from "@/lib/api";

export default function PropertiesPublicPage() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    catalogApi.properties("?limit=12").then((r) => setItems(r.data.items || [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f1ea]">
      <div className="site-hero">
        <SiteNav />
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-200">Portfolio</p>
          <h1 className="mt-2 text-4xl font-extrabold text-white">Hệ thống bất động sản</h1>
          <p className="mt-3 max-w-2xl text-indigo-100">Căn hộ, homestay và nhà trọ đang được vận hành trên RentHub.</p>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 lg:grid-cols-3 lg:px-6">
        {items.map((item) => (
          <PropertyCard key={item.id} property={item} />
        ))}
      </div>
      <SiteFooter />
    </div>
  );
}
