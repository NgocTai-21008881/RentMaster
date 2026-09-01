# Tuần 2 — Thiết kế cơ sở dữ liệu MySQL

**RentHub** · Giai đoạn 02 / 12

Thiết kế toàn bộ schema theo luồng BĐS → Phòng → Người thuê → Hợp đồng → Điện nước → Hóa đơn → Thanh toán.

## Mục tiêu tuần này

- Schema 16 bảng (users, properties, rooms, tenants, contracts, utilities, invoices, payments, ...)
- Kết nối MySQL pool (`config/db.js`)
- Script seed dữ liệu demo + docker-compose MySQL 8
- Backend bắt buộc kết nối DB khi khởi động

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

Mở http://localhost:3000 — trang chủ / giới thiệu / phòng.
Backend health: http://localhost:5000/api/health


## Tài khoản demo

| Vai trò     | Email              | Mật khẩu     |
|-------------|--------------------|--------------|
| Admin       | admin@demo.com     | Admin@123    |
| Chủ nhà     | owner@demo.com     | Admin@123    |
| Quản lý     | manager@demo.com   | Manager@123  |
| Người thuê  | tenant1@demo.com   | Tenant@123   |

## Commit GitHub (tuần này)

```bash
git add giai-doan-02-thiet-ke-csdl
git commit -m "feat(tuần-2): Thiết kế cơ sở dữ liệu MySQL"
git push
```

Snapshot này **lũy tiến**: đã gồm toàn bộ code từ giai đoạn 1 → 2.
