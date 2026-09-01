const { pool } = require("../config/db");

async function findAll(query = {}) {
  const where = [];
  const params = [];
  if (query.status) {
    where.push("m.status = ?");
    params.push(query.status);
  }
  if (query.tenant_id) {
    where.push("m.tenant_id = ?");
    params.push(query.tenant_id);
  }
  if (query.search) {
    where.push("(m.title LIKE ? OR t.full_name LIKE ?)");
    params.push(`%${query.search}%`, `%${query.search}%`);
  }
  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM maintenance_requests m JOIN tenants t ON t.id = m.tenant_id ${sqlWhere}`,
    params
  );
  const [rows] = await pool.query(
    `SELECT m.*, t.full_name AS tenant_name, r.code AS room_code, p.name AS property_name
     FROM maintenance_requests m
     JOIN tenants t ON t.id = m.tenant_id
     JOIN rooms r ON r.id = m.room_id
     JOIN properties p ON p.id = r.property_id
     ${sqlWhere}
     ORDER BY FIELD(m.priority,'high','medium','low'), m.id DESC
     LIMIT ? OFFSET ?`,
    [...params, query.limit ?? 50, query.offset ?? 0]
  );
  return { rows, total };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT m.*, t.full_name AS tenant_name, r.code AS room_code
     FROM maintenance_requests m
     JOIN tenants t ON t.id = m.tenant_id
     JOIN rooms r ON r.id = m.room_id
     WHERE m.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO maintenance_requests (tenant_id, room_id, title, content, category, priority, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.tenant_id, data.room_id, data.title, data.content, data.category, data.priority, data.image_url || null]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  await pool.query(
    `UPDATE maintenance_requests SET status = ?, response = ?, responded_by = ?, responded_at = NOW() WHERE id = ?`,
    [data.status, data.response || null, data.responded_by || null, id]
  );
  return findById(id);
}

module.exports = { findAll, findById, create, update };
