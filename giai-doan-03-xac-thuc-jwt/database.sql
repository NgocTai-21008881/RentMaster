-- RentHub schema + dữ liệu demo
-- Khuyến nghị: cd backend && npm run seed
-- (seed tạo lại toàn bộ bảng và hash mật khẩu bcrypt)

CREATE DATABASE IF NOT EXISTS rental_management
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rental_management;

-- Schema đầy đủ được áp dụng bởi backend/src/scripts/schema.js khi chạy npm run seed.
-- Tài khoản sau seed:
-- admin@demo.com / Admin@123
-- owner@demo.com / Admin@123
-- manager@demo.com / Manager@123
-- tenant1@demo.com / Tenant@123
