const { pool } = require("../config/db");

async function findAll(query = {}) {
  const where = [];
  const params = [];
  if (query.search) {
    where.push("(t.full_name LIKE ? OR t.phone LIKE ? OR t.email LIKE ? OR t.id_number LIKE ?)");
    params.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
  }
  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM tenants t ${sqlWhere}`, params);
  const [rows] = await pool.query(
    `SELECT t.*, r.code AS room_code, r.name AS room_name, p.name AS property_name
     FROM tenants t
     LEFT JOIN rooms r ON r.id = t.room_id
     LEFT JOIN properties p ON p.id = r.property_id
     ${sqlWhere}
     ORDER BY t.id DESC
     LIMIT ? OFFSET ?`,
    [...params, query.limit ?? 50, query.offset ?? 0]
  );
  return { rows, total };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT t.*, r.code AS room_code, r.name AS room_name, p.name AS property_name, p.address AS property_address
     FROM tenants t
     LEFT JOIN rooms r ON r.id = t.room_id
     LEFT JOIN properties p ON p.id = r.property_id
     WHERE t.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findByUserId(userId) {
  const [rows] = await pool.query("SELECT * FROM tenants WHERE user_id = ? LIMIT 1", [userId]);
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO tenants (user_id, full_name, date_of_birth, gender, id_number, phone, email, permanent_address, emergency_contact, emergency_phone, notes, room_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.user_id || null,
      data.full_name,
      data.date_of_birth || null,
      data.gender || null,
      data.id_number || null,
      data.phone,
      data.email || null,
      data.permanent_address || null,
      data.emergency_contact || null,
      data.emergency_phone || null,
      data.notes || null,
      data.room_id || null,
    ]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  await pool.query(
    `UPDATE tenants SET full_name = ?, date_of_birth = ?, gender = ?, id_number = ?, phone = ?, email = ?, permanent_address = ?, emergency_contact = ?, emergency_phone = ?, notes = ?, room_id = ?, user_id = COALESCE(?, user_id) WHERE id = ?`,
    [
      data.full_name,
      data.date_of_birth || null,
      data.gender || null,
      data.id_number || null,
      data.phone,
      data.email || null,
      data.permanent_address || null,
      data.emergency_contact || null,
      data.emergency_phone || null,
      data.notes || null,
      data.room_id || null,
      data.user_id || null,
      id,
    ]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query("DELETE FROM tenants WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

async function countAll() {
  const [rows] = await pool.query("SELECT COUNT(*) AS total FROM tenants");
  return rows[0].total;
}

module.exports = { findAll, findById, findByUserId, create, update, remove, countAll };
