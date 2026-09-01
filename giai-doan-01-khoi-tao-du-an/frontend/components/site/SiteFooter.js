import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#070b24] text-indigo-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 lg:px-6">
        <div className="md:col-span-2">
          <p className="text-2xl font-extrabold text-white">RentHub</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-indigo-200/80">
            Nền tảng quản lý và cho thuê căn hộ, homestay, nhà trọ. Minh bạch hợp đồng, điện nước, hóa đơn và trải nghiệm ở thực tế — không phải trang CRUD sơ sài.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Khám phá</p>
          <div className="mt-3 space-y-2 text-sm">
            <Link className="block hover:text-white" href="/phong">Phòng cho thuê</Link>
            <Link className="block hover:text-white" href="/bat-dong-san">Bất động sản</Link>
            <Link className="block hover:text-white" href="/gioi-thieu">Giới thiệu</Link>
            <Link className="block hover:text-white" href="/login">Cổng quản trị</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Liên hệ demo</p>
          <p className="mt-3 text-sm">TP. Hồ Chí Minh · Hà Nội · Đà Lạt</p>
          <p className="text-sm">hello@renthub.vn</p>
          <p className="text-sm">0900 000 002</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-indigo-300/70">
        © {new Date().getFullYear()} RentHub — Hệ thống quản lý bất động sản cho thuê
      </div>
    </footer>
  );
}
