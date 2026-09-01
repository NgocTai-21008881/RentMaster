module.exports = `
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS chat_sessions;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS maintenance_requests;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoice_items;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS room_services;
DROP TABLE IF EXISTS service_types;
DROP TABLE IF EXISTS utilities;
DROP TABLE IF EXISTS contract_confirmations;
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS tenants;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','owner','manager','tenant') NOT NULL DEFAULT 'tenant',
  phone VARCHAR(20) NULL,
  avatar VARCHAR(255) NULL,
  status ENUM('active','locked') NOT NULL DEFAULT 'active',
  refresh_token TEXT NULL,
  reset_token VARCHAR(120) NULL,
  reset_token_expires DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_status (status)
);

CREATE TABLE properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  type ENUM('apartment','homestay','boarding') NOT NULL DEFAULT 'apartment',
  address VARCHAR(255) NOT NULL,
  description TEXT NULL,
  image_url VARCHAR(500) NULL,
  manager_id INT NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_properties_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_properties_type (type),
  INDEX idx_properties_status (status)
);

CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  floor INT NULL,
  area DECIMAL(8,1) NOT NULL,
  rent_price DECIMAL(12,0) NOT NULL,
  deposit DECIMAL(12,0) NOT NULL DEFAULT 0,
  max_occupants INT NOT NULL DEFAULT 2,
  amenities TEXT NULL,
  image_url VARCHAR(500) NULL,
  status ENUM('vacant','occupied','reserved','maintenance') NOT NULL DEFAULT 'vacant',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_rooms_property_code (property_id, code),
  CONSTRAINT fk_rooms_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  INDEX idx_rooms_status (status)
);

CREATE TABLE tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  full_name VARCHAR(150) NOT NULL,
  date_of_birth DATE NULL,
  gender ENUM('male','female','other') NULL,
  id_number VARCHAR(20) NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(150) NULL,
  permanent_address VARCHAR(255) NULL,
  emergency_contact VARCHAR(150) NULL,
  emergency_phone VARCHAR(20) NULL,
  notes TEXT NULL,
  room_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tenants_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_tenants_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
  INDEX idx_tenants_phone (phone)
);

CREATE TABLE contracts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL UNIQUE,
  tenant_id INT NOT NULL,
  room_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rent_amount DECIMAL(12,0) NOT NULL,
  deposit_amount DECIMAL(12,0) NOT NULL DEFAULT 0,
  payment_day INT NOT NULL DEFAULT 5,
  terms TEXT NULL,
  file_url VARCHAR(500) NULL,
  status ENUM('pending','active','expiring','expired','terminated') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_contracts_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  CONSTRAINT fk_contracts_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
  INDEX idx_contracts_status (status),
  INDEX idx_contracts_dates (start_date, end_date)
);

CREATE TABLE contract_confirmations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contract_id INT NOT NULL UNIQUE,
  tenant_confirmed_at DATETIME NULL,
  owner_confirmed_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_confirm_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);

CREATE TABLE utilities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  period VARCHAR(7) NOT NULL,
  electric_old INT NOT NULL DEFAULT 0,
  electric_new INT NOT NULL DEFAULT 0,
  electric_rate DECIMAL(12,0) NOT NULL DEFAULT 3500,
  electric_amount DECIMAL(12,0) NOT NULL DEFAULT 0,
  water_old INT NOT NULL DEFAULT 0,
  water_new INT NOT NULL DEFAULT 0,
  water_rate DECIMAL(12,0) NOT NULL DEFAULT 18000,
  water_amount DECIMAL(12,0) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_utilities_room_period (room_id, period),
  CONSTRAINT fk_utilities_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE TABLE service_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  unit_price DECIMAL(12,0) NOT NULL DEFAULT 0,
  description VARCHAR(255) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE room_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  service_type_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_room_service (room_id, service_type_id),
  CONSTRAINT fk_rs_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  CONSTRAINT fk_rs_service FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE CASCADE
);

CREATE TABLE invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL UNIQUE,
  contract_id INT NULL,
  room_id INT NOT NULL,
  tenant_id INT NOT NULL,
  period VARCHAR(7) NOT NULL,
  rent_amount DECIMAL(12,0) NOT NULL DEFAULT 0,
  electric_amount DECIMAL(12,0) NOT NULL DEFAULT 0,
  water_amount DECIMAL(12,0) NOT NULL DEFAULT 0,
  service_amount DECIMAL(12,0) NOT NULL DEFAULT 0,
  other_amount DECIMAL(12,0) NOT NULL DEFAULT 0,
  discount DECIMAL(12,0) NOT NULL DEFAULT 0,
  total DECIMAL(12,0) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(12,0) NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  status ENUM('unpaid','paid','partial','overdue') NOT NULL DEFAULT 'unpaid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoices_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL,
  CONSTRAINT fk_invoices_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
  CONSTRAINT fk_invoices_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  INDEX idx_invoices_status (status),
  INDEX idx_invoices_period (period)
);

CREATE TABLE invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  amount DECIMAL(12,0) NOT NULL DEFAULT 0,
  type ENUM('rent','electric','water','service','other','discount') NOT NULL DEFAULT 'other',
  CONSTRAINT fk_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  amount DECIMAL(12,0) NOT NULL,
  method ENUM('cash','transfer') NOT NULL DEFAULT 'cash',
  note VARCHAR(255) NULL,
  confirmed_by INT NULL,
  paid_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_user FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_payments_paid_at (paid_at)
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(40) NOT NULL DEFAULT 'system',
  link VARCHAR(255) NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_noti_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_noti_user_read (user_id, is_read)
);

CREATE TABLE maintenance_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  room_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  content TEXT NOT NULL,
  category ENUM('electric','water','internet','ac','device','other') NOT NULL DEFAULT 'other',
  priority ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  image_url VARCHAR(500) NULL,
  status ENUM('new','processing','resolved','closed') NOT NULL DEFAULT 'new',
  response TEXT NULL,
  responded_by INT NULL,
  responded_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_mr_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_mr_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  CONSTRAINT fk_mr_user FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_mr_status (status)
);

CREATE TABLE chat_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  role ENUM('user','assistant') NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cm_session FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

CREATE TABLE activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(80) NOT NULL,
  entity VARCHAR(80) NULL,
  entity_id INT NULL,
  detail TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activity_created (created_at)
);
`;
