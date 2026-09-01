# Tuần 8 — Điện nước và dịch vụ

**RentHub** · Giai đoạn 08 / 12

Chỉ số điện/nước tự tính tiền, cấu hình loại dịch vụ và gán theo phòng.

## Mục tiêu tuần này

- Nhập chỉ số điện/nước, tính thành tiền theo đơn giá
- Danh mục dịch vụ (Internet, gửi xe, vệ sinh, ...)
- Gán dịch vụ theo phòng
- Portal xem điện nước của phòng mình

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
git add giai-doan-08-dien-nuoc-dich-vu
git commit -m "feat(tuần-8): Điện nước và dịch vụ"
git push
```

Snapshot này **lũy tiến**: đã gồm toàn bộ code từ giai đoạn 1 → 8.
