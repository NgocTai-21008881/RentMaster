# Tuần 6 — Quản lý người thuê

**RentHub** · Giai đoạn 06 / 12

Hồ sơ người thuê, gắn phòng, cổng Portal xem phòng của tôi.

## Mục tiêu tuần này

- CRUD người thuê, liên kết user + room
- Dashboard Người thuê
- Portal: Phòng của tôi

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
git add giai-doan-06-nguoi-thue
git commit -m "feat(tuần-6): Quản lý người thuê"
git push
```

Snapshot này **lũy tiến**: đã gồm toàn bộ code từ giai đoạn 1 → 6.
