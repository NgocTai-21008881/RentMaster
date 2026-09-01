export function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN").format(Number(value) || 0) + " đ";
}

export function formatDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10).split("-").reverse().join("/");
}

export const propertyTypeLabel = {
  apartment: "Căn hộ",
  homestay: "Homestay",
  boarding: "Nhà trọ",
};

export const roomStatusLabel = {
  vacant: "Trống",
  occupied: "Đã thuê",
  reserved: "Đã đặt",
  maintenance: "Bảo trì",
};

export const roomStatusClass = {
  vacant: "bg-emerald-50 text-emerald-700",
  occupied: "bg-indigo-50 text-indigo-700",
  reserved: "bg-violet-50 text-violet-700",
  maintenance: "bg-amber-50 text-amber-700",
};

export const contractStatusLabel = {
  pending: "Chờ hiệu lực",
  active: "Đang hiệu lực",
  expiring: "Sắp hết hạn",
  expired: "Đã hết hạn",
  terminated: "Đã chấm dứt",
};

export const invoiceStatusLabel = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
  partial: "Thanh toán một phần",
  overdue: "Quá hạn",
};

export const invoiceStatusClass = {
  unpaid: "bg-slate-100 text-slate-700",
  paid: "bg-emerald-50 text-emerald-700",
  partial: "bg-amber-50 text-amber-700",
  overdue: "bg-rose-50 text-rose-700",
};

export const roleLabel = {
  admin: "Admin",
  owner: "Chủ nhà",
  manager: "Quản lý",
  tenant: "Người thuê",
};

export function qs(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, value);
  });
  const text = search.toString();
  return text ? `?${text}` : "";
}
