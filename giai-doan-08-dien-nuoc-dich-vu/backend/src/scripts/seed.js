require("dotenv").config();

const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const schemaSql = require("./schema");

function periodOffset(monthsBack) {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsBack);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function dateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function datetimeOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 19).replace("T", " ");
}

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  const dbName = process.env.DB_NAME || "rental_management";
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await connection.query(`USE \`${dbName}\``);
  await connection.query(schemaSql);

  const adminHash = await bcrypt.hash("Admin@123", 10);
  const managerHash = await bcrypt.hash("Manager@123", 10);
  const tenantHash = await bcrypt.hash("Tenant@123", 10);

  await connection.query(
    `INSERT INTO users (name, email, password, role, phone, status) VALUES
    ('Quản trị viên', 'admin@demo.com', ?, 'admin', '0900000001', 'active'),
    ('Nguyễn Ngọc Tài', 'owner@demo.com', ?, 'owner', '0900000002', 'active'),
    ('Lê Thị Hạnh', 'manager@demo.com', ?, 'manager', '0900000003', 'active'),
    ('Trần Minh Anh', 'tenant1@demo.com', ?, 'tenant', '0905123456', 'active'),
    ('Lê Hoàng Nam', 'tenant2@demo.com', ?, 'tenant', '0912345678', 'active'),
    ('Phạm Thảo Linh', 'tenant3@demo.com', ?, 'tenant', '0987654321', 'active'),
    ('Võ Quốc Huy', 'tenant4@demo.com', ?, 'tenant', '0933445566', 'active')`,
    [adminHash, adminHash, managerHash, tenantHash, tenantHash, tenantHash, tenantHash]
  );

  await connection.query(`
    INSERT INTO properties (name, type, address, description, image_url, manager_id, status) VALUES
    ('Căn hộ Sunrise Riverside', 'apartment', '25 Nguyễn Hữu Thọ, Quận 7, TP.HCM',
     'Cụm căn hộ cao cấp ven sông, nội thất đầy đủ, bảo vệ 24/7 và hồ bơi ngoài trời.',
     'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200', 3, 'active'),
    ('Homestay Đà Lạt Pine View', 'homestay', '18 Trần Phú, Phường 4, Đà Lạt',
     'Homestay view đồi thông, phù hợp nghỉ dưỡng ngắn ngày, có sân vườn và bếp chung.',
     'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200', 3, 'active'),
    ('Nhà trọ Green Park', 'boarding', '88 Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội',
     'Dãy phòng trọ khép kín gần công viên, tiện đi lại và phù hợp sinh viên, người đi làm.',
     'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200', 2, 'active')
  `);

  await connection.query(`
    INSERT INTO rooms (property_id, code, name, floor, area, rent_price, deposit, max_occupants, amenities, image_url, status) VALUES
    (1, 'A101', 'Căn 1PN view sông', 1, 45.0, 8500000, 8500000, 2, 'Máy lạnh, bếp, máy giặt, ban công', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'occupied'),
    (1, 'A102', 'Căn 1PN nội thất', 1, 42.0, 7800000, 7800000, 2, 'Máy lạnh, bếp, tủ lạnh', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', 'occupied'),
    (1, 'A205', 'Căn 2PN góc', 2, 68.5, 12000000, 12000000, 4, 'Máy lạnh, bếp, máy giặt, 2 WC', 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800', 'vacant'),
    (1, 'A206', 'Căn 2PN gia đình', 2, 70.0, 12500000, 12500000, 4, 'Máy lạnh, bếp, máy giặt, sofa', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', 'reserved'),
    (1, 'A312', 'Căn studio', 3, 32.0, 6500000, 6500000, 1, 'Máy lạnh, bếp mini', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'maintenance'),
    (1, 'A401', 'Căn penthouse', 4, 92.0, 18000000, 18000000, 4, 'Máy lạnh, bếp, máy giặt, view sông', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 'occupied'),
    (1, 'A402', 'Căn 1PN hướng Nam', 4, 46.0, 8200000, 8200000, 2, 'Máy lạnh, bếp, ban công', 'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800', 'vacant'),
    (2, 'P01', 'Phòng Đồi Thông', 1, 28.0, 750000, 500000, 2, 'Máy sưởi, wifi, ban công', 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800', 'occupied'),
    (2, 'P02', 'Phòng Hoàng Hôn', 1, 30.0, 850000, 500000, 2, 'Máy sưởi, wifi, view đồi', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', 'vacant'),
    (2, 'P03', 'Phòng Gia Đình', 2, 42.0, 1200000, 800000, 4, 'Bếp, máy sưởi, 2 giường', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800', 'occupied'),
    (2, 'P04', 'Phòng Sương Mai', 2, 26.0, 700000, 500000, 2, 'Wifi, máy sưởi', 'https://images.unsplash.com/photo-1615874959470-d0d6d1d0d8c5?w=800', 'vacant'),
    (2, 'P05', 'Phòng Gió Núi', 3, 24.0, 680000, 500000, 2, 'Wifi, ban công', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 'reserved'),
    (2, 'P06', 'Phòng Đom Đóm', 3, 22.0, 620000, 400000, 2, 'Wifi', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 'maintenance'),
    (3, 'B01', 'Phòng trọ 1', 1, 20.0, 3500000, 3500000, 1, 'Máy lạnh, WC riêng, wifi', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800', 'occupied'),
    (3, 'B02', 'Phòng trọ 2', 1, 22.0, 3800000, 3800000, 2, 'Máy lạnh, WC riêng, wifi', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 'occupied'),
    (3, 'B03', 'Phòng trọ 3', 2, 20.0, 3500000, 3500000, 1, 'Quạt, WC riêng, wifi', 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800', 'vacant'),
    (3, 'B04', 'Phòng trọ 4', 2, 24.0, 4000000, 4000000, 2, 'Máy lạnh, WC riêng, ban công', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800', 'occupied'),
    (3, 'B05', 'Phòng trọ 5', 3, 18.0, 3200000, 3200000, 1, 'Wifi, WC riêng', 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800', 'vacant'),
    (3, 'B06', 'Phòng trọ 6', 3, 22.0, 3700000, 3700000, 2, 'Máy lạnh, wifi', 'https://images.unsplash.com/photo-1615529328331-f8917597711b?w=800', 'maintenance')
  `);

  await connection.query(`
    INSERT INTO tenants (user_id, full_name, date_of_birth, gender, id_number, phone, email, permanent_address, emergency_contact, emergency_phone, notes, room_id) VALUES
    (4, 'Trần Minh Anh', '1998-04-12', 'female', '079198001111', '0905123456', 'tenant1@demo.com', '12 Nguyễn Trãi, Q.5, TP.HCM', 'Trần Văn Bình', '0905111222', 'Thuê dài hạn, thanh toán đúng hạn.', 1),
    (5, 'Lê Hoàng Nam', '1996-09-03', 'male', '001096002222', '0912345678', 'tenant2@demo.com', '45 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội', 'Lê Thị Hoa', '0912000111', 'Đi làm ca đêm.', 8),
    (6, 'Phạm Thảo Linh', '1999-01-21', 'female', '079199003333', '0987654321', 'tenant3@demo.com', '88 Hoàng Diệu, Hải Châu, Đà Nẵng', 'Phạm Quốc', '0987000111', 'Ở cùng 1 người thân.', 10),
    (7, 'Võ Quốc Huy', '1995-07-18', 'male', '001095004444', '0933445566', 'tenant4@demo.com', '3 Trần Hưng Đạo, Q.1, TP.HCM', 'Võ Thị Lan', '0933000111', NULL, 6),
    (NULL, 'Ngô Bảo Châu', '1997-11-02', 'female', '079197005555', '0977000888', 'ngobaochau@gmail.com', '22 Cách Mạng Tháng 8, Q.10, TP.HCM', 'Ngô Văn Đức', '0977111222', 'Đặt cọc phòng A206.', 4),
    (NULL, 'Đặng Minh Khoa', '1994-02-14', 'male', '001094006666', '0966123456', 'dangkhoa@gmail.com', '9 Nguyễn Văn Cừ, Long Biên, Hà Nội', 'Đặng Thị Mai', '0966000111', NULL, 14),
    (NULL, 'Hoàng Yến Nhi', '2000-06-30', 'female', '079200007777', '0944555666', 'yennhi@gmail.com', '15 Pasteur, Q.3, TP.HCM', 'Hoàng Văn Tâm', '0944000111', NULL, 15),
    (NULL, 'Bùi Thanh Tùng', '1993-12-09', 'male', '001093008888', '0922333444', 'thanhtung@gmail.com', '70 Giải Phóng, Hoàng Mai, Hà Nội', 'Bùi Thị Hà', '0922000111', NULL, 17)
  `);

  const terms =
    "Bên thuê thanh toán đúng hạn trước ngày quy định hàng tháng. Không cải tạo kết cấu khi chưa được đồng ý. Tiền cọc được hoàn khi bàn giao phòng nguyên trạng.";

  await connection.query(
    `INSERT INTO contracts (code, tenant_id, room_id, start_date, end_date, rent_amount, deposit_amount, payment_day, terms, status) VALUES
    ('HD-2025-001', 1, 1, '2025-01-01', ?, 8500000, 8500000, 5, ?, 'active'),
    ('HD-2025-002', 2, 8, '2025-03-01', ?, 750000, 500000, 5, ?, 'expiring'),
    ('HD-2025-003', 3, 10, '2025-02-15', '2026-02-14', 1200000, 800000, 10, ?, 'active'),
    ('HD-2025-004', 4, 6, '2025-06-01', '2026-05-31', 18000000, 18000000, 5, ?, 'active'),
    ('HD-2026-005', 5, 4, '2026-09-01', '2027-08-31', 12500000, 12500000, 5, ?, 'pending'),
    ('HD-2025-006', 6, 14, '2025-04-01', '2026-03-31', 3500000, 3500000, 5, ?, 'active'),
    ('HD-2025-007', 7, 15, '2025-05-01', ?, 3800000, 3800000, 8, ?, 'active'),
    ('HD-2024-008', 8, 17, '2024-08-01', '2025-07-31', 4000000, 4000000, 5, ?, 'expired')`,
    [dateOffset(220), terms, dateOffset(18), terms, terms, terms, terms, terms, dateOffset(40), terms, terms]
  );

  await connection.query(`
    INSERT INTO contract_confirmations (contract_id, tenant_confirmed_at, owner_confirmed_at) VALUES
    (1, '2025-01-01 09:00:00', '2025-01-01 10:00:00'),
    (2, '2025-03-01 09:00:00', '2025-03-01 11:00:00'),
    (3, '2025-02-15 08:30:00', '2025-02-15 09:00:00'),
    (4, '2025-06-01 09:00:00', '2025-06-01 09:20:00'),
    (6, '2025-04-01 09:00:00', '2025-04-01 09:10:00'),
    (7, '2025-05-01 09:00:00', '2025-05-01 10:00:00')
  `);

  await connection.query(`
    INSERT INTO service_types (name, unit_price, description, is_active) VALUES
    ('Internet', 150000, 'Wifi tốc độ cao theo phòng', 1),
    ('Gửi xe máy', 100000, '1 xe máy/tháng', 1),
    ('Gửi ô tô', 800000, '1 ô tô/tháng', 1),
    ('Vệ sinh', 80000, 'Dọn hành lang và rác thải', 1),
    ('Phí quản lý', 200000, 'Phí vận hành tòa nhà', 1),
    ('Phí dịch vụ', 120000, 'Bảo trì thiết bị chung', 1)
  `);

  await connection.query(`
    INSERT INTO room_services (room_id, service_type_id) VALUES
    (1,1),(1,2),(1,4),(1,5),
    (2,1),(2,2),(2,5),
    (6,1),(6,3),(6,5),(6,6),
    (8,1),(8,4),
    (10,1),(10,2),
    (14,1),(14,2),(14,4),
    (15,1),(15,2),
    (17,1),(17,2),(17,5)
  `);

  const p0 = periodOffset(0);
  const p1 = periodOffset(1);
  const p2 = periodOffset(2);

  await connection.query(
    `INSERT INTO utilities (room_id, period, electric_old, electric_new, electric_rate, electric_amount, water_old, water_new, water_rate, water_amount) VALUES
    (1, ?, 1200, 1285, 3500, 297500, 80, 92, 18000, 216000),
    (1, ?, 1110, 1200, 3500, 315000, 68, 80, 18000, 216000),
    (1, ?, 1020, 1110, 3500, 315000, 55, 68, 18000, 234000),
    (8, ?, 430, 470, 3500, 140000, 20, 28, 18000, 144000),
    (10, ?, 510, 560, 3500, 175000, 30, 40, 18000, 180000),
    (6, ?, 2100, 2280, 3500, 630000, 110, 128, 18000, 324000),
    (14, ?, 300, 345, 3500, 157500, 18, 26, 18000, 144000),
    (15, ?, 280, 330, 3500, 175000, 16, 24, 18000, 144000)`,
    [p0, p1, p2, p0, p0, p0, p0, p0]
  );

  async function insertInvoice({
    code,
    contractId,
    roomId,
    tenantId,
    period,
    rent,
    electric,
    water,
    service,
    other = 0,
    discount = 0,
    paid,
    due,
    status,
    items,
  }) {
    const total = rent + electric + water + service + other - discount;
    const [result] = await connection.query(
      `INSERT INTO invoices (code, contract_id, room_id, tenant_id, period, rent_amount, electric_amount, water_amount, service_amount, other_amount, discount, total, paid_amount, due_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, contractId, roomId, tenantId, period, rent, electric, water, service, other, discount, total, paid, due, status]
    );
    for (const item of items) {
      await connection.query("INSERT INTO invoice_items (invoice_id, name, amount, type) VALUES (?, ?, ?, ?)", [
        result.insertId,
        item.name,
        item.amount,
        item.type,
      ]);
    }
    return result.insertId;
  }

  const inv1 = await insertInvoice({
    code: `HDN-${p0.replace("-", "")}-001`,
    contractId: 1,
    roomId: 1,
    tenantId: 1,
    period: p0,
    rent: 8500000,
    electric: 297500,
    water: 216000,
    service: 530000,
    paid: 0,
    due: dateOffset(5),
    status: "unpaid",
    items: [
      { name: "Tiền thuê phòng", amount: 8500000, type: "rent" },
      { name: "Tiền điện", amount: 297500, type: "electric" },
      { name: "Tiền nước", amount: 216000, type: "water" },
      { name: "Internet + xe + vệ sinh + quản lý", amount: 530000, type: "service" },
    ],
  });

  await insertInvoice({
    code: `HDN-${p1.replace("-", "")}-001`,
    contractId: 1,
    roomId: 1,
    tenantId: 1,
    period: p1,
    rent: 8500000,
    electric: 315000,
    water: 216000,
    service: 530000,
    paid: 9561000,
    due: dateOffset(-25),
    status: "paid",
    items: [
      { name: "Tiền thuê phòng", amount: 8500000, type: "rent" },
      { name: "Tiền điện", amount: 315000, type: "electric" },
      { name: "Tiền nước", amount: 216000, type: "water" },
      { name: "Dịch vụ", amount: 530000, type: "service" },
    ],
  });

  await insertInvoice({
    code: `HDN-${p0.replace("-", "")}-002`,
    contractId: 2,
    roomId: 8,
    tenantId: 2,
    period: p0,
    rent: 750000,
    electric: 140000,
    water: 144000,
    service: 230000,
    paid: 0,
    due: dateOffset(-4),
    status: "overdue",
    items: [
      { name: "Tiền thuê phòng", amount: 750000, type: "rent" },
      { name: "Tiền điện", amount: 140000, type: "electric" },
      { name: "Tiền nước", amount: 144000, type: "water" },
      { name: "Internet + vệ sinh", amount: 230000, type: "service" },
    ],
  });

  const inv3 = await insertInvoice({
    code: `HDN-${p0.replace("-", "")}-003`,
    contractId: 4,
    roomId: 6,
    tenantId: 4,
    period: p0,
    rent: 18000000,
    electric: 630000,
    water: 324000,
    service: 1270000,
    paid: 10000000,
    due: dateOffset(3),
    status: "partial",
    items: [
      { name: "Tiền thuê phòng", amount: 18000000, type: "rent" },
      { name: "Tiền điện", amount: 630000, type: "electric" },
      { name: "Tiền nước", amount: 324000, type: "water" },
      { name: "Internet + ô tô + quản lý + dịch vụ", amount: 1270000, type: "service" },
    ],
  });

  await insertInvoice({
    code: `HDN-${p0.replace("-", "")}-004`,
    contractId: 6,
    roomId: 14,
    tenantId: 6,
    period: p0,
    rent: 3500000,
    electric: 157500,
    water: 144000,
    service: 330000,
    paid: 4131500,
    due: dateOffset(2),
    status: "paid",
    items: [
      { name: "Tiền thuê phòng", amount: 3500000, type: "rent" },
      { name: "Tiền điện", amount: 157500, type: "electric" },
      { name: "Tiền nước", amount: 144000, type: "water" },
      { name: "Internet + xe + vệ sinh", amount: 330000, type: "service" },
    ],
  });

  await insertInvoice({
    code: `HDN-${p2.replace("-", "")}-001`,
    contractId: 1,
    roomId: 1,
    tenantId: 1,
    period: p2,
    rent: 8500000,
    electric: 315000,
    water: 234000,
    service: 530000,
    paid: 9579000,
    due: dateOffset(-55),
    status: "paid",
    items: [
      { name: "Tiền thuê phòng", amount: 8500000, type: "rent" },
      { name: "Tiền điện", amount: 315000, type: "electric" },
      { name: "Tiền nước", amount: 234000, type: "water" },
      { name: "Dịch vụ", amount: 530000, type: "service" },
    ],
  });

  await insertInvoice({
    code: `HDN-${p0.replace("-", "")}-005`,
    contractId: 7,
    roomId: 15,
    tenantId: 7,
    period: p0,
    rent: 3800000,
    electric: 175000,
    water: 144000,
    service: 250000,
    paid: 0,
    due: dateOffset(-10),
    status: "overdue",
    items: [
      { name: "Tiền thuê phòng", amount: 3800000, type: "rent" },
      { name: "Tiền điện", amount: 175000, type: "electric" },
      { name: "Tiền nước", amount: 144000, type: "water" },
      { name: "Internet + xe", amount: 250000, type: "service" },
    ],
  });

  await connection.query(
    `INSERT INTO payments (invoice_id, amount, method, note, confirmed_by, paid_at) VALUES
    (2, 9561000, 'transfer', 'Chuyển khoản tháng trước', 2, ?),
    (5, 4131500, 'cash', 'Thu tại văn phòng', 3, ?),
    (6, 9579000, 'transfer', 'Thanh toán đủ', 2, ?),
    (?, 10000000, 'transfer', 'Thanh toán một phần penthouse', 2, ?)`,
    [datetimeOffset(-20), datetimeOffset(-3), datetimeOffset(-50), inv3, datetimeOffset(-1)]
  );

  await connection.query(`
    INSERT INTO maintenance_requests (tenant_id, room_id, title, content, category, priority, status, response, responded_by, responded_at) VALUES
    (1, 1, 'Máy lạnh không lạnh', 'Máy lạnh phòng khách chạy nhưng không mát, nghi hết gas.', 'ac', 'high', 'processing', 'Đã liên hệ thợ, sẽ đến trong hôm nay.', 3, NOW()),
    (2, 8, 'Wifi chập chờn', 'Mạng hay rớt vào buổi tối.', 'internet', 'medium', 'new', NULL, NULL, NULL),
    (6, 14, 'Vòi nước rò rỉ', 'Vòi lavabo nhỏ giọt cả đêm.', 'water', 'high', 'resolved', 'Đã thay gioăng mới.', 2, DATE_SUB(NOW(), INTERVAL 2 DAY)),
    (3, 10, 'Bóng đèn hành lang', 'Hành lang tầng 2 tối, đề nghị thay bóng.', 'electric', 'low', 'closed', 'Đã thay bóng LED.', 3, DATE_SUB(NOW(), INTERVAL 8 DAY))
  `);

  await connection.query(`
    INSERT INTO notifications (user_id, title, message, type, link, is_read) VALUES
    (2, 'Hóa đơn quá hạn', 'Hóa đơn homestay P01 của Lê Hoàng Nam đã quá hạn 4 ngày.', 'invoice_overdue', '/dashboard/invoices', 0),
    (2, 'Hợp đồng sắp hết hạn', 'Hợp đồng HD-2025-002 sẽ hết hạn trong 18 ngày.', 'contract_expiring', '/dashboard/contracts', 0),
    (3, 'Yêu cầu hỗ trợ mới', 'Lê Hoàng Nam gửi yêu cầu: Wifi chập chờn.', 'maintenance', '/dashboard/maintenance', 0),
    (4, 'Hóa đơn tháng mới', 'Hóa đơn tháng này của phòng A101 đã được phát hành.', 'invoice_new', '/portal/invoices', 0),
    (4, 'Yêu cầu đang xử lý', 'Chủ nhà đã phản hồi yêu cầu sửa máy lạnh.', 'maintenance', '/portal/requests', 0),
    (5, 'Hóa đơn quá hạn', 'Bạn còn hóa đơn chưa thanh toán đã quá hạn.', 'invoice_overdue', '/portal/invoices', 0),
    (7, 'Nhắc thanh toán', 'Hóa đơn penthouse mới thanh toán một phần. Vui lòng hoàn tất phần còn lại.', 'invoice_due', '/portal/invoices', 0)
  `);

  await connection.query(`
    INSERT INTO activity_logs (user_id, action, entity, entity_id, detail) VALUES
    (2, 'login', 'users', 2, 'Chủ nhà đăng nhập hệ thống'),
    (3, 'update', 'maintenance_requests', 1, 'Cập nhật trạng thái yêu cầu máy lạnh'),
    (2, 'create', 'invoices', 1, 'Phát hành hóa đơn tháng hiện tại'),
    (1, 'create', 'users', 3, 'Tạo tài khoản quản lý')
  `);

  await connection.end();
  console.log("Seed thành công. Tài khoản demo:");
  console.log("  Admin     : admin@demo.com   / Admin@123");
  console.log("  Chủ nhà   : owner@demo.com   / Admin@123");
  console.log("  Quản lý   : manager@demo.com / Manager@123");
  console.log("  Người thuê: tenant1@demo.com / Tenant@123");
}

seed().catch((error) => {
  console.error("Seed thất bại:", error);
  process.exit(1);
});
