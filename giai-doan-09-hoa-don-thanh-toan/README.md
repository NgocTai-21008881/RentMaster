# Tuần 9 — Hóa đơn và thanh toán

**RentHub** · Giai đoạn 09 / 12

Phát hành hóa đơn tháng, thanh toán tiền mặt/chuyển khoản, QR VietQR.

## Mục tiêu tuần này

- Hóa đơn tổng hợp tiền thuê + điện + nước + dịch vụ
- Thanh toán một phần / đủ, lịch sử giao dịch
- QR chuyển khoản demo (VietQR)
- Xuất PDF hóa đơn; Portal hóa đơn & thanh toán

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
git add giai-doan-09-hoa-don-thanh-toan
git commit -m "feat(tuần-9): Hóa đơn và thanh toán"
git push
```

Snapshot này **lũy tiến**: đã gồm toàn bộ code từ giai đoạn 1 → 9.
