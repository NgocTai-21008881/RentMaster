# Tuần 7 — Hợp đồng thuê

**RentHub** · Giai đoạn 07 / 12

Tạo, kích hoạt, gia hạn, chấm dứt, xác nhận 2 bên, xuất PDF.

## Mục tiêu tuần này

- Hợp đồng + xác nhận chủ nhà / người thuê
- Xuất PDF hợp đồng (pdfkit)
- Dashboard Hợp đồng + Portal Hợp đồng
- Người thuê có thể gửi yêu cầu thuê phòng trống

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
git add giai-doan-07-hop-dong
git commit -m "feat(tuần-7): Hợp đồng thuê"
git push
```

Snapshot này **lũy tiến**: đã gồm toàn bộ code từ giai đoạn 1 → 7.
