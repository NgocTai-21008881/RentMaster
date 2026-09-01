"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import { RoomCard } from "@/components/site/Cards";
import { catalogApi } from "@/lib/api";
import { Pagination } from "@/components/DataTable";
import { qs, roomStatusLabel } from "@/lib/format";

function ListingInner() {
  const params = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({
    search: params.get("search") || "",
    status: params.get("status") || "",
    type: params.get("type") || "",
  });

  async function load(p = 1) {
    const res = await catalogApi.rooms(qs({ ...filter, page: p, limit: 9 }));
    setItems(res.data.items);
    setTotal(res.data.total);
    setPage(p);
  }

  useEffect(() => {
    load(1).catch(() => {});
  }, [filter.search, filter.status, filter.type]);

  return (
    <div className="min-h-screen bg-[#f4f1ea]">
      <div className="site-hero">
        <SiteNav />
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-200">Catalog</p>
          <h1 className="mt-2 text-4xl font-extrabold text-white sm:text-5xl">Phòng & căn hộ cho thuê</h1>
          <p className="mt-3 max-w-2xl text-indigo-100">Danh sách lấy trực tiếp từ hệ thống quản lý — giá, diện tích, trạng thái luôn đồng bộ với vận hành thực tế.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        <div className="mb-8 grid gap-3 rounded-3xl bg-white p-4 shadow-sm md:grid-cols-4">
          <input className="rounded-2xl bg-slate-50 px-4 py-3 text-sm" placeholder="Tìm tên phòng, khu..." value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} />
          <select className="rounded-2xl bg-slate-50 px-4 py-3 text-sm" value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
            <option value="">Mọi loại BĐS</option>
            <option value="apartment">Căn hộ</option>
            <option value="homestay">Homestay</option>
            <option value="boarding">Nhà trọ</option>
          </select>
          <select className="rounded-2xl bg-slate-50 px-4 py-3 text-sm" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
            <option value="">Mọi trạng thái</option>
            {Object.entries(roomStatusLabel).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <div className="flex items-center px-2 text-sm text-slate-500">{total} sản phẩm</div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
        {items.length === 0 ? <p className="py-20 text-center text-slate-500">Không tìm thấy phòng phù hợp.</p> : null}
        <div className="mt-8">
          <Pagination page={page} total={total} limit={9} onPage={load} />
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

export default function ListingPage() {
  return (
    <Suspense>
      <ListingInner />
    </Suspense>
  );
}
