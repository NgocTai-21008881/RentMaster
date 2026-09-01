# Tuần 1 — Khởi tạo dự án

**RentHub** · Giai đoạn 01 / 12

Dựng Next.js + Express, giao diện website công khai (landing, giới thiệu, danh sách phòng).

## Mục tiêu tuần này

- Khởi tạo monorepo frontend (Next.js 15, Tailwind) và backend (Express)
- Cấu hình CORS, health check `/api/health`, middleware lỗi
- Trang chủ, Giới thiệu, Phòng cho thuê, Bất động sản (UI; dữ liệu API sẽ nối ở tuần 5)
- Component dùng chung: SiteNav, SiteFooter, Cards, DataTable, Toast, AuthContext (khung)

## Cách chạy snapshot này

Vào đúng folder giai đoạn (không chạy ở thư mục gốc nếu bạn muốn đúng mốc tuần này).

> Giai đoạn 1 chưa cần MySQL. Backend chỉ có health check.

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

Mở http://localhost:3000 — trang chủ / giới thiệu / phòng.
Backend health: http://localhost:5000/api/health


## Commit GitHub (tuần này)

```bash
git add giai-doan-01-khoi-tao-du-an
git commit -m "feat(tuần-1): Khởi tạo dự án"
git push
```

Snapshot này **lũy tiến**: đã gồm toàn bộ code từ giai đoạn 1 → 1.
