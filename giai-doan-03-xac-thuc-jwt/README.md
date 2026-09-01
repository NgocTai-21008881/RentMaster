# Tuần 3 — Xác thực JWT và phân quyền

**RentHub** · Giai đoạn 03 / 12

Đăng ký, đăng nhập, refresh token, quên/đổi mật khẩu, 4 vai trò admin/owner/manager/tenant.

## Mục tiêu tuần này

- JWT access + refresh, bcrypt, middleware `auth` / `requireRole`
- API `/api/auth/*` (register, login, me, logout, forgot/reset, profile)
- Trang Login, Register, Quên mật khẩu, Đặt lại mật khẩu
- Upload avatar (multer), log hoạt động + email mock

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
git add giai-doan-03-xac-thuc-jwt
git commit -m "feat(tuần-3): Xác thực JWT và phân quyền"
git push
```

Snapshot này **lũy tiến**: đã gồm toàn bộ code từ giai đoạn 1 → 3.
