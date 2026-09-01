# Tuần 10 — Dashboard thống kê và báo cáo

**RentHub** · Giai đoạn 10 / 12

Biểu đồ doanh thu, tỷ lệ phòng, hóa đơn; xuất báo cáo CSV/Excel.

## Mục tiêu tuần này

- Dashboard tổng quan (Recharts): occupancy, hóa đơn, doanh thu
- Báo cáo theo kỳ, xuất Excel (exceljs)
- API `/api/dashboard`, `/api/reports`

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
git add giai-doan-10-dashboard-bao-cao
git commit -m "feat(tuần-10): Dashboard thống kê và báo cáo"
git push
```

Snapshot này **lũy tiến**: đã gồm toàn bộ code từ giai đoạn 1 → 10.
