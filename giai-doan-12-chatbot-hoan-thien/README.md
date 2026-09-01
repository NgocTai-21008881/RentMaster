# Tuần 12 — Chatbot AI và hoàn thiện

**RentHub** · Giai đoạn 12 / 12

Chatbot lấy dữ liệu MySQL theo quyền user, gắn LLM tùy chọn, hoàn thiện đồ án.

## Mục tiêu tuần này

- Chatbot widget trên Dashboard/Portal
- Trả lời dựa trên phòng trống, hóa đơn, hợp đồng của user
- Tùy chọn LLM qua `.env` (nếu trống thì dùng rule + MySQL)
- README đầy đủ, tài khoản demo, checklist nghiệm thu

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
git add giai-doan-12-chatbot-hoan-thien
git commit -m "feat(tuần-12): Chatbot AI và hoàn thiện"
git push
```

Snapshot này **lũy tiến**: đã gồm toàn bộ code từ giai đoạn 1 → 12.
