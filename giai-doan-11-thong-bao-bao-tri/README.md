# Tuần 11 — Thông báo, nhắc hạn và hỗ trợ kỹ thuật

**RentHub** · Giai đoạn 11 / 12

Chuông thông báo, job nhắc hạn hợp đồng/hóa đơn, ticket bảo trì.

## Mục tiêu tuần này

- Notification in-app trên Header
- Job nhắc hạn (REMINDER_DAYS) + email/SMS mock
- Yêu cầu hỗ trợ kỹ thuật (tenant tạo, staff xử lý)
- Portal Thông báo + Yêu cầu hỗ trợ

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
git add giai-doan-11-thong-bao-bao-tri
git commit -m "feat(tuần-11): Thông báo, nhắc hạn và hỗ trợ kỹ thuật"
git push
```

Snapshot này **lũy tiến**: đã gồm toàn bộ code từ giai đoạn 1 → 11.
