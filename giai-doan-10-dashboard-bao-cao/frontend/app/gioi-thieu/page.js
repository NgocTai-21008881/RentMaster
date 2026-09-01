"use client";

import Link from "next/link";
import { Building2, HeartHandshake, LineChart, Sparkles } from "lucide-react";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";

const values = [
  { icon: Sparkles, title: "Không gian sống có thẩm mỹ", text: "Căn hộ, homestay và nhà trọ được chọn lọc, hình ảnh thật, thông tin diện tích – giá – tiện nghi rõ ràng." },
  { icon: HeartHandshake, title: "Minh bạch hai phía", text: "Chủ nhà và người thuê cùng nhìn hợp đồng, hóa đơn, điện nước trên một hệ thống. Không miệng truyền, không sổ tay." },
  { icon: LineChart, title: "Vận hành như sản phẩm SaaS", text: "Dashboard doanh thu, QR thanh toán, chatbot dữ liệu thật, cổng Portal riêng cho người thuê." },
  { icon: Building2, title: "Từ phòng trống đến báo cáo", text: "Luồng BĐS → phòng → hợp đồng → dịch vụ → hóa đơn → thanh toán được thiết kế cho đồ án và cho vận hành thật." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f4f1ea]">
      <div className="site-hero">
        <SiteNav />
        <section className="mx-auto max-w-5xl px-4 py-20 text-center lg:px-6">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-200">Về chúng tôi</p>
          <h1 className="mt-4 text-4xl font-extrabold text-white sm:text-6xl">RentHub ra đời để biến việc cho thuê thành trải nghiệm hiện đại.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-indigo-100/90">
            Không còn bảng Excel rời rạc. Một nền tảng cho chủ nhà quản trị và người thuê an tâm ở — đẹp, rõ, và đủ nghiệp vụ.
          </p>
        </section>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-2 lg:px-6">
        <img src="/images/about-space.jpg" alt="Không gian RentHub" className="h-[420px] w-full rounded-[2rem] object-cover shadow-xl" />
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-extrabold text-slate-900">Câu chuyện thương hiệu</h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            RentHub bắt đầu từ nhu cầu thật: chủ nhà cần biết phòng nào trống, hóa đơn nào quá hạn; người thuê cần biết tháng này trả bao nhiêu và hợp đồng còn hạn đến khi nào. Chúng tôi gói toàn bộ vào một sản phẩm có giao diện SaaS, màu sắc dứt khoát và dữ liệu lấy từ MySQL.
          </p>
          <p className="mt-4 leading-relaxed text-slate-600">
            Trang chủ bạn đang xem chính là mặt tiền của hệ thống quản lý: mỗi căn hộ, mỗi mức giá đều phản ánh kho phòng đang vận hành.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <h2 className="text-center text-3xl font-extrabold text-slate-900">Vì sao chọn RentHub</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {values.map((item) => (
              <article key={item.title} className="rounded-[1.8rem] border border-slate-100 bg-[#f4f1ea] p-6">
                <item.icon className="text-indigo-600" />
                <h3 className="mt-3 text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-3xl font-extrabold">Bắt đầu với một căn phòng</h2>
        <p className="mt-3 text-slate-600">Xem catalog realtime hoặc đăng nhập với vai trò chủ nhà / người thuê để trải nghiệm đủ luồng.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/phong" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white">Xem phòng</Link>
          <Link href="/register" className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-bold text-white">Đăng ký</Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
