# Tuần 4 — Giao diện Dashboard / Portal và tài khoản

**RentHub** · Giai đoạn 04 / 12

Khung quản trị SaaS, cổng người thuê, hồ sơ cá nhân, CRUD tài khoản (Admin).

## Mục tiêu tuần này

- AppShell, Sidebar, Header, Modal, StatCard
- Dashboard staff + Portal tenant (layout, hồ sơ)
- Quản lý người dùng: tạo, khóa, xóa (admin)
- Phân luồng sau đăng nhập theo vai trò

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
git add giai-doan-04-giao-dien-dashboard
git commit -m "feat(tuần-4): Giao diện Dashboard / Portal và tài khoản"
git push
```

Snapshot này **lũy tiến**: đã gồm toàn bộ code từ giai đoạn 1 → 4.
