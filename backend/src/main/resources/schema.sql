-- ============================================================
-- RentMaster - Database Schema Migration Script
-- Phase 1: 8 Core Tables
-- ============================================================
-- NOTE: File này dùng làm reference/backup.
-- Hibernate ddl-auto:update sẽ tự tạo bảng từ JPA Entities.
-- Chạy thủ công script này nếu muốn tạo DB sạch từ đầu.
-- ============================================================

CREATE DATABASE IF NOT EXISTS rentmaster_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE rentmaster_db;

-- 1. SaaS Packages
CREATE TABLE IF NOT EXISTS saas_packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    max_rooms INT NOT NULL,
    duration_days INT NOT NULL DEFAULT 30,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    landlord_id BIGINT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('SUPER_ADMIN', 'LANDLORD', 'TENANT') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'PENDING') NOT NULL DEFAULT 'ACTIVE',
    package_id BIGINT NULL,
    package_expired_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_package FOREIGN KEY (package_id) REFERENCES saas_packages(id) ON DELETE SET NULL
);
CREATE INDEX idx_users_landlord ON users(landlord_id);

-- 3. Properties
CREATE TABLE IF NOT EXISTS properties (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    landlord_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    total_floors INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_properties_landlord FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_properties_landlord ON properties(landlord_id);

-- 4. Rooms
CREATE TABLE IF NOT EXISTS rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    landlord_id BIGINT NOT NULL,
    property_id BIGINT NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    floor INT NOT NULL,
    base_price DECIMAL(12,2) NOT NULL,
    area DECIMAL(6,2) NULL,
    status ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE') DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rooms_landlord FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_rooms_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);
CREATE INDEX idx_rooms_landlord ON rooms(landlord_id);

-- 5. Tenants
CREATE TABLE IF NOT EXISTS tenants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    landlord_id BIGINT NOT NULL,
    user_id BIGINT NULL,
    identity_card VARCHAR(20) NOT NULL,
    permanent_address VARCHAR(255) NULL,
    emergency_contact VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenants_landlord FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tenants_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_tenants_landlord ON tenants(landlord_id);

-- 6. Contracts
CREATE TABLE IF NOT EXISTS contracts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    landlord_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    deposit_amount DECIMAL(12,2) NOT NULL,
    monthly_rent DECIMAL(12,2) NOT NULL,
    contract_pdf_url VARCHAR(255) NULL,
    signature_url VARCHAR(255) NULL,
    status ENUM('ACTIVE', 'EXPIRED', 'TERMINATED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_contracts_landlord FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_contracts_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
    CONSTRAINT fk_contracts_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT
);
CREATE INDEX idx_contracts_landlord ON contracts(landlord_id);

-- 7. Service Meters
CREATE TABLE IF NOT EXISTS service_meters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    landlord_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    record_month INT NOT NULL,
    record_year INT NOT NULL,
    old_electric INT NOT NULL,
    new_electric INT NOT NULL,
    old_water INT NOT NULL,
    new_water INT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_meters_landlord FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_meters_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);
CREATE INDEX idx_meters_landlord ON service_meters(landlord_id);

-- 8. Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    landlord_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL,
    contract_id BIGINT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    room_fee DECIMAL(12,2) NOT NULL,
    electric_fee DECIMAL(12,2) NOT NULL,
    water_fee DECIMAL(12,2) NOT NULL,
    service_fee DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('PENDING', 'PAID', 'OVERDUE') DEFAULT 'PENDING',
    due_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoices_landlord FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_invoices_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
    CONSTRAINT fk_invoices_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
    CONSTRAINT fk_invoices_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE RESTRICT
);
CREATE INDEX idx_invoices_landlord ON invoices(landlord_id);

-- ============================================================
-- Seed Data: Gói SaaS mặc định
-- ============================================================
INSERT INTO saas_packages (name, price, max_rooms, duration_days, description) VALUES
('FREE', 0.00, 5, 30, 'Gói miễn phí - Quản lý tối đa 5 phòng'),
('BASIC', 99000.00, 20, 30, 'Gói cơ bản - Quản lý tối đa 20 phòng'),
('PRO', 299000.00, 100, 30, 'Gói chuyên nghiệp - Quản lý tối đa 100 phòng');
