"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, DoorOpen, Users, FileText, Zap, Settings, Receipt, Wallet, BarChart3, Wrench, Home, Compass, Bell, Shield } from "lucide-react";

const staffItems = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/dashboard/properties", label: "Bất động sản", icon: Building2 },
  { href: "/dashboard/rooms", label: "Phòng / Căn hộ", icon: DoorOpen },
  { href: "/dashboard/tenants", label: "Người thuê", icon: Users },
  { href: "/dashboard/contracts", label: "Hợp đồng", icon: FileText },
  { href: "/dashboard/utilities", label: "Điện nước", icon: Zap },
  { href: "/dashboard/services", label: "Dịch vụ", icon: Settings },
  { href: "/dashboard/invoices", label: "Hóa đơn", icon: Receipt },
  { href: "/dashboard/payments", label: "Thanh toán", icon: Wallet },
  { href: "/dashboard/reports", label: "Báo cáo", icon: BarChart3 },
  { href: "/dashboard/maintenance", label: "Hỗ trợ", icon: Wrench },
];

const adminItems = [{ href: "/dashboard/users", label: "Tài khoản", icon: Shield }];

const tenantItems = [
  { href: "/portal", label: "Tổng quan", icon: Home },
  { href: "/", label: "Xem & thuê nhà", icon: Compass },
  { href: "/phong", label: "Phòng cho thuê", icon: Building2 },
  { href: "/portal/room", label: "Phòng của tôi", icon: DoorOpen },
  { href: "/portal/contracts", label: "Hợp đồng", icon: FileText },
  { href: "/portal/invoices", label: "Hóa đơn", icon: Receipt },
  { href: "/portal/payments", label: "Thanh toán", icon: Wallet },
  { href: "/portal/utilities", label: "Điện nước", icon: Zap },
  { href: "/portal/requests", label: "Yêu cầu hỗ trợ", icon: Wrench },
  { href: "/portal/notifications", label: "Thông báo", icon: Bell },
];

export default function Sidebar({ open, onClose, role }) {
  const pathname = usePathname();
  const items = role === "tenant" ? tenantItems : [...staffItems, ...(role === "admin" ? adminItems : [])];

  return (
    <>
      {open ? <button type="button" className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} /> : null}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 flex-col bg-[#111827] text-slate-100 transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 font-bold">R</div>
          <div>
            <p className="text-sm font-bold">RentHub</p>
            <p className="text-xs text-slate-400">Property OS</p>
          </div>
        </div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : item.href === "/phong"
                  ? pathname === "/phong" || pathname.startsWith("/phong/")
                  : pathname === item.href || (item.href !== "/portal" && pathname.startsWith(`${item.href}/`));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
