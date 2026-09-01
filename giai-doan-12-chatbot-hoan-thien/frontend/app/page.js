"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Wallet, Wifi } from "lucide-react";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import { PropertyCard, RoomCard } from "@/components/site/Cards";
import { catalogApi } from "@/lib/api";

const fallbackHero = "/images/about-space.jpg";

export default function HomePage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState({ type: "", status: "vacant", q: "" });

  useEffect(() => {
    catalogApi.stats().then((r) => setStats(r.data)).catch(() => {});
    catalogApi.properties("?limit=3").then((r) => setProperties(r.data.items || [])).catch(() => {});
    catalogApi.rooms("?limit=6").then((r) => setRooms(r.data.items || [])).catch(() => {});
  }, []);

  function goSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.q) params.set("search", search.q);
    if (search.type) params.set("type", search.type);
    if (search.status) params.set("status", search.status);
    router.push(`/phong?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-[#f4f1ea]">
      <div className="site-hero">
        <SiteNav />
        <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-6 lg:py-24">
          <div>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
              <Sparkles size={14} /> Căn hộ · Homestay · Nhà trọ
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.08] text-white sm:text-6xl">
              Sống đúng chất riêng, thuê minh bạch, quản lý chuẩn SaaS.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mt-5 max-w-xl text-lg text-indigo-100/85">
              RentHub kết nối không gian sống đẹp với vận hành chuyên nghiệp: hợp đồng điện tử, điện nước, hóa đơn và hỗ trợ 1 chạm.
            </motion.p>
            <form onSubmit={goSearch} className="mt-8 grid gap-3 rounded-3xl bg-white p-3 shadow-2xl shadow-indigo-950/30 sm:grid-cols-4">
              <input
                className="rounded-2xl bg-slate-50 px-4 py-3 text-sm outline-none sm:col-span-2"
                placeholder="Tìm căn hộ, homestay, khu vực..."
                value={search.q}
                onChange={(e) => setSearch({ ...search, q: e.target.value })}
              />
              <select className="rounded-2xl bg-slate-50 px-3 py-3 text-sm" value={search.type} onChange={(e) => setSearch({ ...search, type: e.target.value })}>
                <option value="">Mọi loại</option>
                <option value="apartment">Căn hộ</option>
                <option value="homestay">Homestay</option>
                <option value="boarding">Nhà trọ</option>
              </select>
              <button className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-3 text-sm font-bold text-white">
                Tìm phòng
              </button>
            </form>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Bất động sản", stats?.properties ?? "—"],
                ["Tổng phòng", stats?.rooms ?? "—"],
                ["Đang trống", stats?.vacant ?? "—"],
                ["Đang thuê", stats?.occupied ?? "—"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-2xl font-extrabold text-white">{value}</p>
                  <p className="text-xs text-indigo-200">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative hidden h-[520px] lg:block">
            <img src={properties[0]?.image_url || fallbackHero} alt="" className="h-full w-full rounded-[2.2rem] object-cover shadow-2xl" />
            <div className="absolute -left-8 bottom-10 rounded-3xl bg-white p-4 shadow-xl">
              <p className="text-xs font-semibold text-slate-500">Phòng nổi bật</p>
              <p className="font-bold text-slate-900">{rooms[0]?.name || "Căn 1PN view sông"}</p>
              <p className="text-indigo-600">{rooms[0] ? `${Number(rooms[0].rent_price).toLocaleString("vi-VN")} đ` : "8.500.000 đ"}</p>
            </div>
          </motion.div>
        </section>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-500">Bất động sản</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900">Những không gian đang vận hành</h2>
          </div>
          <Link href="/phong" className="hidden items-center gap-1 text-sm font-semibold text-indigo-600 sm:flex">
            Xem tất cả <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {properties.map((item) => (
            <PropertyCard key={item.id} property={item} />
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-500">Sản phẩm cho thuê</p>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900">Danh sách phòng & căn hộ</h2>
            </div>
            <Link href="/phong" className="text-sm font-semibold text-indigo-600">Khám phá thêm →</Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:px-6">
        <div className="grid grid-cols-2 gap-4">
          <img src="/images/home-1.jpg" alt="Homestay RentHub" className="h-64 w-full rounded-[2rem] object-cover" />
          <img src="/images/home-2.jpg" alt="Căn hộ RentHub" className="mt-10 h-64 w-full rounded-[2rem] object-cover" />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600">Giới thiệu</p>
          <h2 className="mt-2 text-4xl font-extrabold text-slate-900">RentHub là hệ điều hành cho thuê, không chỉ là website đăng tin.</h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Chúng tôi xây dựng trải nghiệm giống một sản phẩm SaaS bất động sản thực tế: chủ nhà theo dõi doanh thu, người thuê xem hóa đơn – hợp đồng, chatbot trả lời bằng dữ liệu thật. Mọi căn hộ trên trang chủ đều lấy từ MySQL, không phải dữ liệu giả trên frontend.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              [ShieldCheck, "Hợp đồng rõ ràng"],
              [Wallet, "Hóa đơn & QR"],
              [Wifi, "Hỗ trợ sự cố"],
            ].map(([Icon, label]) => (
              <div key={label} className="rounded-2xl bg-indigo-50 p-4">
                <Icon className="text-indigo-600" />
                <p className="mt-2 text-sm font-semibold text-slate-800">{label}</p>
              </div>
            ))}
          </div>
          <Link href="/gioi-thieu" className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
            Câu chuyện RentHub <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="mx-4 mb-16 overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 px-8 py-14 text-center text-white lg:mx-auto lg:max-w-7xl">
        <h2 className="text-3xl font-extrabold sm:text-4xl">Sẵn sàng chuyển tới không gian mới?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-indigo-100">Đăng ký tài khoản người thuê trong 1 phút, xem hợp đồng điện tử và theo dõi hóa đơn ngay trên cổng Portal.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/phong" className="rounded-full border border-white/40 px-6 py-3 text-sm font-bold">Xem phòng trống</Link>
          <Link href="/register" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-900">Đăng ký ngay</Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
