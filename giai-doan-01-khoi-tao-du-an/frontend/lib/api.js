const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const FILE_URL = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/api$/, "");

export function fileSrc(path) {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;
  return `${FILE_URL}${path}`;
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function api(path, options = {}) {
  const isForm = options.body instanceof FormData;
  const headers = { ...(options.headers || {}) };
  if (!isForm) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      body: isForm ? options.body : options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error("Không kết nối được máy chủ. Hãy chạy backend (thư mục backend → npm run dev) rồi tải lại trang.");
  }

  if (options.blob) {
    if (!response.ok) throw new Error("Không tải được tệp.");
    return response.blob();
  }

  const payload = await response.json().catch(() => ({}));
  if (response.status === 401 && typeof window !== "undefined" && !path.startsWith("/auth/login") && !path.startsWith("/auth/refresh")) {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
  if (!response.ok) throw new Error(payload.message || "Có lỗi xảy ra khi gọi API.");
  return payload;
}

export async function openPdf(path) {
  const blob = await api(path, { blob: true });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

export const authApi = {
  login: (email, password) => api("/auth/login", { method: "POST", body: { email, password } }),
  register: (body) => api("/auth/register", { method: "POST", body }),
  me: () => api("/auth/me"),
  logout: () => api("/auth/logout", { method: "POST" }),
  forgot: (email) => api("/auth/forgot-password", { method: "POST", body: { email } }),
  reset: (token, new_password) => api("/auth/reset-password", { method: "POST", body: { token, new_password } }),
  changePassword: (body) => api("/auth/change-password", { method: "POST", body }),
  updateProfile: (form) => api("/auth/profile", { method: "PUT", body: form }),
};

export const dashboardApi = { summary: () => api("/dashboard/summary") };
export const reportApi = {
  get: (query = "") => api(`/reports${query}`),
  exportUrl: (query) => `${API_URL}/reports/export${query}`,
};
export const userApi = {
  list: (q = "") => api(`/users${q}`),
  create: (body) => api("/users", { method: "POST", body }),
  update: (id, body) => api(`/users/${id}`, { method: "PUT", body }),
  lock: (id) => api(`/users/${id}/lock`, { method: "POST" }),
  remove: (id) => api(`/users/${id}`, { method: "DELETE" }),
  logs: (q = "") => api(`/users/logs${q}`),
};
export const propertyApi = {
  list: (q = "") => api(`/properties${q}`),
  get: (id) => api(`/properties/${id}`),
  save: (id, form) => api(id ? `/properties/${id}` : "/properties", { method: id ? "PUT" : "POST", body: form }),
  remove: (id) => api(`/properties/${id}`, { method: "DELETE" }),
};
export const roomApi = {
  list: (q = "") => api(`/rooms${q}`),
  get: (id) => api(`/rooms/${id}`),
  save: (id, form) => api(id ? `/rooms/${id}` : "/rooms", { method: id ? "PUT" : "POST", body: form }),
  remove: (id) => api(`/rooms/${id}`, { method: "DELETE" }),
};
export const tenantApi = {
  list: (q = "") => api(`/tenants${q}`),
  get: (id) => api(`/tenants/${id}`),
  create: (body) => api("/tenants", { method: "POST", body }),
  update: (id, body) => api(`/tenants/${id}`, { method: "PUT", body }),
  remove: (id) => api(`/tenants/${id}`, { method: "DELETE" }),
};
export const contractApi = {
  list: (q = "") => api(`/contracts${q}`),
  get: (id) => api(`/contracts/${id}`),
  save: (id, form) => api(id ? `/contracts/${id}` : "/contracts", { method: id ? "PUT" : "POST", body: form }),
  activate: (id) => api(`/contracts/${id}/activate`, { method: "POST" }),
  terminate: (id) => api(`/contracts/${id}/terminate`, { method: "POST" }),
  renew: (id, end_date) => api(`/contracts/${id}/renew`, { method: "POST", body: { end_date } }),
  confirm: (id) => api(`/contracts/${id}/confirm`, { method: "POST" }),
  apply: (room_id) => api("/contracts/apply", { method: "POST", body: { room_id } }),
};
export const utilityApi = {
  list: (q = "") => api(`/utilities${q}`),
  save: (body) => api("/utilities", { method: "POST", body }),
  remove: (id) => api(`/utilities/${id}`, { method: "DELETE" }),
};
export const serviceApi = {
  list: () => api("/services"),
  create: (body) => api("/services", { method: "POST", body }),
  update: (id, body) => api(`/services/${id}`, { method: "PUT", body }),
  remove: (id) => api(`/services/${id}`, { method: "DELETE" }),
};
export const invoiceApi = {
  list: (q = "") => api(`/invoices${q}`),
  get: (id) => api(`/invoices/${id}`),
  create: (body) => api("/invoices", { method: "POST", body }),
};
export const paymentApi = {
  list: (q = "") => api(`/payments${q}`),
  create: (body) => api("/payments", { method: "POST", body }),
  qr: (invoiceId) => api(`/payments/qr/${invoiceId}`),
};
export const notiApi = {
  list: () => api("/notifications"),
  read: (id) => api(`/notifications/${id}/read`, { method: "POST" }),
  readAll: () => api("/notifications/read-all", { method: "POST" }),
};
export const maintenanceApi = {
  list: (q = "") => api(`/maintenance${q}`),
  create: (form) => api("/maintenance", { method: "POST", body: form }),
  update: (id, body) => api(`/maintenance/${id}`, { method: "PUT", body }),
};
export const chatbotApi = {
  ask: (question) => api("/chat/ask", { method: "POST", body: { question } }),
};

export const catalogApi = {
  stats: () => api("/public/stats"),
  properties: (q = "") => api(`/public/properties${q}`),
  property: (id) => api(`/public/properties/${id}`),
  rooms: (q = "") => api(`/public/rooms${q}`),
  room: (id) => api(`/public/rooms/${id}`),
};
