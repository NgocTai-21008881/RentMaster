"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Maximize2, Shield, Users, Wallet } from "lucide-react";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import { catalogApi, contractApi } from "@/lib/api";
import { formatMoney, roomStatusLabel } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function RoomDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    catalogApi.room(id).then((r) => setRoom(r.data)).catch((e) => setError(e.message));
  }, [id]);

  async function applyRent() {
    if (!user) {
      router.push(`/login?next=/phong/${id}`);
      return;
    }
    if (user.role !== "tenant") {
      toast?.error("Chỉ tài khoản người thuê mới gửi yêu cầu thuê.");
      return;
    }
    setSubmitting(true);
    try {
      await contractApi.apply(Number(id));
      toast?.success("Đã gửi yêu cầu thuê. Vào Hợp đồng để theo dõi.");
      router.push("/portal/contracts");
    } catch (err) {
      toast?.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const canRent = room && room.status === "vacant";
  const next = encodeURIComponent(`/phong/${id}`);

  return (
    <div className="min-h-screen bg-[#f4f1ea]">
      <div className="site-hero">
        <SiteNav />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
        {error ? <p className="text-rose-600">{error}</p> : null}
        {room ? (
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <img src={room.image_url} alt={room.name} className="h-[420px] w-full rounded-[2rem] object-cover shadow-xl" />
              <div className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-indigo-500">{room.code} · {room.property_name}</p>
                <h1 className="mt-1 text-3xl font-extrabold text-slate-900">{room.name}</h1>
                <p className="mt-2 flex items-center gap-2 text-slate-500"><MapPin size={16} /> {room.property_address}</p>
                <p className="mt-4 leading-relaxed text-slate-600">
                  Không gian {room.area} m², tối đa {room.max_occupants} người. Tiện nghi: {room.amenities || "đầy đủ nội thất cơ bản"}.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {(room.services || []).map((s) => (
                    <span key={s.id} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{s.name}</span>
                  ))}
                </div>
              </div>
            </div>
            <aside className="h-fit rounded-[2rem] bg-slate-900 p-6 text-white shadow-2xl">
              <p className="text-sm text-indigo-200">Giá thuê hàng tháng</p>
              <p className="mt-1 text-3xl font-extrabold">{formatMoney(room.rent_price)}</p>
              <p className="mt-1 text-sm text-indigo-200">Cọc {formatMoney(room.deposit)}</p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/10 p-3"><Maximize2 size={16} /><p className="mt-1">{room.area} m²</p></div>
                <div className="rounded-2xl bg-white/10 p-3"><Users size={16} /><p className="mt-1">{room.max_occupants} người</p></div>
                <div className="rounded-2xl bg-white/10 p-3"><Wallet size={16} /><p className="mt-1">{roomStatusLabel[room.status]}</p></div>
                <div className="rounded-2xl bg-white/10 p-3"><Shield size={16} /><p className="mt-1">Tầng {room.floor || "—"}</p></div>
              </div>
              {user?.role === "tenant" ? (
                <>
                  <button
                    type="button"
                    disabled={!canRent || submitting}
                    onClick={applyRent}
                    className="mt-6 block w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 py-3 text-center font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? "Đang gửi..." : canRent ? "Gửi yêu cầu thuê" : "Phòng chưa cho thuê"}
                  </button>
                  <Link href="/portal/contracts" className="mt-3 block text-center text-sm text-indigo-200">Xem hợp đồng của tôi</Link>
                </>
              ) : user ? (
                <Link href="/dashboard" className="mt-6 block rounded-2xl bg-white py-3 text-center font-bold text-slate-900">
                  Vào hệ thống quản trị
                </Link>
              ) : (
                <>
                  <Link href={`/register?next=${next}`} className="mt-6 block rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 py-3 text-center font-bold text-white">
                    Đăng ký thuê
                  </Link>
                  <Link href={`/login?next=${next}`} className="mt-3 block text-center text-sm text-indigo-200">Đã có tài khoản? Đăng nhập</Link>
                </>
              )}
            </aside>
          </div>
        ) : null}
      </div>
      <SiteFooter />
    </div>
  );
}
