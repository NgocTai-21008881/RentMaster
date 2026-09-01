const { pool } = require("../config/db");

function applyStatus(row) {
  if (!row) return row;
  if (row.status === "terminated" || row.status === "pending") return row;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(row.end_date);
  if (end < today) {
    row.computed_status = "expired";
  } else {
    const days = (end - today) / 86400000;
    row.computed_status = days <= 30 ? "expiring" : "active";
  }
  return row;
}

async function findAll(query = {}) {
  const where = [];
  const params = [];
  if (query.search) {
    where.push("(c.code LIKE ? OR t.full_name LIKE ? OR r.code LIKE ?)");
    params.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
  }
  if (query.tenant_id) {
    where.push("c.tenant_id = ?");
    params.push(query.tenant_id);
  }
  if (query.status) {
    where.push("c.status = ?");
    params.push(query.status);
  }
  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM contracts c
     JOIN tenants t ON t.id = c.tenant_id
     JOIN rooms r ON r.id = c.room_id ${sqlWhere}`,
    params
  );
  const [rows] = await pool.query(
    `SELECT c.*, t.full_name AS tenant_name, t.phone AS tenant_phone, r.code AS room_code, r.name AS room_name, p.name AS property_name,
            cc.tenant_confirmed_at, cc.owner_confirmed_at
     FROM contracts c
     JOIN tenants t ON t.id = c.tenant_id
     JOIN rooms r ON r.id = c.room_id
     JOIN properties p ON p.id = r.property_id
     LEFT JOIN contract_confirmations cc ON cc.contract_id = c.id
     ${sqlWhere}
     ORDER BY c.id DESC
     LIMIT ? OFFSET ?`,
    [...params, query.limit ?? 50, query.offset ?? 0]
  );
  return { rows: rows.map(applyStatus), total };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT c.*, t.full_name AS tenant_name, t.phone AS tenant_phone, t.email AS tenant_email, t.id_number,
            r.code AS room_code, r.name AS room_name, r.area, p.name AS property_name, p.address AS property_address,
            cc.tenant_confirmed_at, cc.owner_confirmed_at
     FROM contracts c
     JOIN tenants t ON t.id = c.tenant_id
     JOIN rooms r ON r.id = c.room_id
     JOIN properties p ON p.id = r.property_id
     LEFT JOIN contract_confirmations cc ON cc.contract_id = c.id
     WHERE c.id = ? LIMIT 1`,
    [id]
  );
  return applyStatus(rows[0] || null);
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO contracts (code, tenant_id, room_id, start_date, end_date, rent_amount, deposit_amount, payment_day, terms, file_url, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.code,
      data.tenant_id,
      data.room_id,
      data.start_date,
      data.end_date,
      data.rent_amount,
      data.deposit_amount || 0,
      data.payment_day || 5,
      data.terms || null,
      data.file_url || null,
      data.status || "pending",
    ]
  );
  await pool.query("INSERT INTO contract_confirmations (contract_id) VALUES (?)", [result.insertId]);
  return findById(result.insertId);
}

async function update(id, data) {
  await pool.query(
    `UPDATE contracts SET tenant_id = ?, room_id = ?, start_date = ?, end_date = ?, rent_amount = ?, deposit_amount = ?, payment_day = ?, terms = ?, file_url = COALESCE(?, file_url), status = ? WHERE id = ?`,
    [
      data.tenant_id,
      data.room_id,
      data.start_date,
      data.end_date,
      data.rent_amount,
      data.deposit_amount || 0,
      data.payment_day || 5,
      data.terms || null,
      data.file_url || null,
      data.status,
      id,
    ]
  );
  return findById(id);
}

async function setStatus(id, status) {
  await pool.query("UPDATE contracts SET status = ? WHERE id = ?", [status, id]);
  return findById(id);
}

async function confirm(id, who) {
  const column = who === "tenant" ? "tenant_confirmed_at" : "owner_confirmed_at";
  await pool.query(`UPDATE contract_confirmations SET ${column} = NOW() WHERE contract_id = ?`, [id]);
  return findById(id);
}

async function findOpenByRoom(roomId) {
  const [rows] = await pool.query(
    `SELECT * FROM contracts
     WHERE room_id = ? AND status IN ('pending','active','expiring')
     ORDER BY id DESC LIMIT 1`,
    [roomId]
  );
  return rows[0] || null;
}

async function findPendingByTenantAndRoom(tenantId, roomId) {
  const [rows] = await pool.query(
    `SELECT * FROM contracts
     WHERE tenant_id = ? AND room_id = ? AND status = 'pending'
     LIMIT 1`,
    [tenantId, roomId]
  );
  return rows[0] || null;
}

async function countByStatus() {
  const [rows] = await pool.query(
    `SELECT
       SUM(status IN ('active','expiring')) AS active_count,
       SUM(status = 'expiring' OR (status = 'active' AND end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY))) AS expiring_count,
       SUM(status = 'pending') AS pending_count,
       SUM(status = 'expired') AS expired_count,
       SUM(status = 'terminated') AS terminated_count
     FROM contracts`
  );
  return {
    active: rows[0].active_count,
    expiring: rows[0].expiring_count,
    pending: rows[0].pending_count,
    expired: rows[0].expired_count,
    terminated: rows[0].terminated_count,
  };
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  setStatus,
  confirm,
  findOpenByRoom,
  findPendingByTenantAndRoom,
  countByStatus,
};
