# Tuần 5 — Quản lý bất động sản và phòng

**RentHub** · Giai đoạn 05 / 12

CRUD BĐS & phòng, upload ảnh, API công khai cho website khách.

## Mục tiêu tuần này

- API `/api/properties`, `/api/rooms` (tìm kiếm, lọc, phân trang)
- API `/api/public/*` cho trang chủ / listing
- Màn hình dashboard Bất động sản, Phòng
- Website công khai đọc dữ liệu MySQL thật

## Cách chạy snapshot này

Vào đúng folder giai đoạn (không chạy ở thư mục gốc nếu bạn muốn đúng mốc tuần này).

### Database + seed

```bash
cd backend
copy .env.example .env
npm install
npm run seed
```

MySQL local: host `localhost:3306`, database `rental_management`. Mật khẩu xem `backend/.env`.

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

Sau đó mở http://localhost:3000/login


## Tài khoản demo

| Vai trò     | Email              | Mật khẩu     |
|-------------|--------------------|--------------|
| Admin       | admin@demo.com     | Admin@123    |
| Chủ nhà     | owner@demo.com     | Admin@123    |
| Quản lý     | manager@demo.com   | Manager@123  |
| Người thuê  | tenant1@demo.com   | Tenant@123   |

## Commit GitHub (tuần này)

```bash
git add giai-doan-05-bat-dong-san-phong
git commit -m "feat(tuần-5): Quản lý bất động sản và phòng"
git push
```

Snapshot này **lũy tiến**: đã gồm toàn bộ code từ giai đoạn 1 → 5.
