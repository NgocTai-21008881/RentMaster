# RentHub — Hệ thống Quản lý Bất động sản Cho thuê

Hệ thống quản lý căn hộ, homestay và nhà trọ theo mô hình **SaaS dashboard**, phục vụ đồ án tốt nghiệp.

Đồ án được chia **12 giai đoạn / 12 tuần** — mỗi giai đoạn một folder, commit dần lên GitHub. Xem [GIAI_DOAN.md](./GIAI_DOAN.md).

Luồng nghiệp vụ:

**Bất động sản → Phòng → Người thuê → Hợp đồng → Điện/Nước/Dịch vụ → Hóa đơn → Thanh toán → Báo cáo**

Kèm **Admin / Chủ nhà / Quản lý / Người thuê**, chatbot AI, thông báo và dashboard doanh thu.

## Tech stack

- Frontend: Next.js 15, React, Tailwind CSS, Framer Motion, Recharts
- Backend: Node.js, Express.js
- Database: MySQL 8
- Auth: JWT (access + refresh) + bcrypt
- REST API, upload ảnh/file, xuất PDF/Excel
- Chatbot: mock theo dữ liệu MySQL, có thể gắn LLM qua `.env`

## Chức năng

- Phân quyền Admin, Chủ nhà/Quản lý, Người thuê
- Đăng ký, đăng nhập, đăng xuất, quên/đổi mật khẩu, hồ sơ, avatar
- Dashboard + biểu đồ doanh thu, tỷ lệ phòng, hóa đơn
- CRUD BĐS, phòng, người thuê (tìm kiếm, lọc, phân trang, upload ảnh)
- Hợp đồng: tạo, kích hoạt, gia hạn, chấm dứt, xác nhận 2 bên, xuất PDF
- Điện nước tự tính tiền, cấu hình dịch vụ theo phòng
- Hóa đơn tháng, thanh toán tiền mặt/chuyển khoản/QR, lịch sử giao dịch
- Nhắc hạn (in-app + email/SMS mock)
- Báo cáo doanh thu, xuất CSV/Excel
- Yêu cầu hỗ trợ kỹ thuật
- Chatbot lấy dữ liệu thật theo quyền user
- Notification chuông trên header

## Cấu trúc

```text
WebsiteQuanLyBDSChoThue/
├── GIAI_DOAN.md              # Lộ trình 12 tuần + lệnh commit
├── giai-doan-01-...          # Snapshot từng tuần (lũy tiến)
├── giai-doan-12-...
├── database.sql              # Schema tham chiếu
├── backend/
│   ├── .env
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── jobs/             # nhắc hạn
│       ├── middleware/
│       ├── repositories/
│       ├── routes/
│       ├── scripts/          # schema + seed
│       └── services/
└── frontend/
    ├── app/dashboard         # cổng quản trị
    └── app/portal            # cổng người thuê
```

## Cài đặt

### 1. Database

```bash
cd backend
npm install
npm run seed
```

Seed sẽ **tạo lại schema** và nạp dữ liệu demo. MySQL local:

- Host `localhost:3306`
- User `root`
- Password xem `backend/.env`
- Database `rental_management`

### 2. Backend

```bash
cd backend
npm run dev
```

API: http://localhost:5000  · Health: `/api/health`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: http://localhost:3000

## Tài khoản demo

| Vai trò     | Email              | Mật khẩu     |
|-------------|--------------------|--------------|
| Admin       | admin@demo.com     | Admin@123    |
| Chủ nhà     | owner@demo.com     | Admin@123    |
| Quản lý     | manager@demo.com   | Manager@123  |
| Người thuê  | tenant1@demo.com   | Tenant@123   |

## Biến môi trường

**backend/.env**

- `DB_*`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`
- `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL` — để trống thì chatbot dùng dữ liệu MySQL
- `SMTP_*` — nếu trống, email được log mock
- `SMS_PROVIDER=mock`
- `BANK_CODE`, `BANK_ACCOUNT`, `BANK_ACCOUNT_NAME` — QR VietQR demo
- `REMINDER_DAYS=1,3,5`

**frontend/.env.local**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Tích hợp LLM

Điền vào `backend/.env`:

```env
LLM_API_KEY=sk-...
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

Chatbot vẫn chỉ trả lời dựa trên dữ liệu user được phép xem, không bịa số liệu.

## API chính

`/api/auth` `/api/users` `/api/properties` `/api/rooms` `/api/tenants` `/api/contracts` `/api/utilities` `/api/services` `/api/invoices` `/api/payments` `/api/reports` `/api/notifications` `/api/maintenance` `/api/chat`

Hầu hết endpoint cần `Authorization: Bearer <token>`.
