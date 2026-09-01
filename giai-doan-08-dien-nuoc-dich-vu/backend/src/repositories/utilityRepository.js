const { pool } = require("../config/db");

async function findAll(query = {}) {
  const where = [];
  const params = [];
  if (query.room_id) {
    where.push("u.room_id = ?");
    params.push(query.room_id);
  }
  if (query.period) {
    where.push("u.period = ?");
    params.push(query.period);
  }
  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM utilities u ${sqlWhere}`, params);
  const [rows] = await pool.query(
    `SELECT u.*, r.code AS room_code, r.name AS room_name, p.name AS property_name
     FROM utilities u
     JOIN rooms r ON r.id = u.room_id
     JOIN properties p ON p.id = r.property_id
     ${sqlWhere}
     ORDER BY u.period DESC, u.id DESC
     LIMIT ? OFFSET ?`,
    [...params, query.limit ?? 50, query.offset ?? 0]
  );
  return { rows, total };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT u.*, r.code AS room_code FROM utilities u JOIN rooms r ON r.id = u.room_id WHERE u.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findByRoomPeriod(roomId, period) {
  const [rows] = await pool.query("SELECT * FROM utilities WHERE room_id = ? AND period = ? LIMIT 1", [roomId, period]);
  return rows[0] || null;
}

async function upsert(data) {
  const [result] = await pool.query(
    `INSERT INTO utilities (room_id, period, electric_old, electric_new, electric_rate, electric_amount, water_old, water_new, water_rate, water_amount)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE electric_old = VALUES(electric_old), electric_new = VALUES(electric_new), electric_rate = VALUES(electric_rate),
       electric_amount = VALUES(electric_amount), water_old = VALUES(water_old), water_new = VALUES(water_new), water_rate = VALUES(water_rate), water_amount = VALUES(water_amount)`,
    [
      data.room_id,
      data.period,
      data.electric_old,
      data.electric_new,
      data.electric_rate,
      data.electric_amount,
      data.water_old,
      data.water_new,
      data.water_rate,
      data.water_amount,
    ]
  );
  if (result.insertId) return findById(result.insertId);
  return findByRoomPeriod(data.room_id, data.period);
}

async function remove(id) {
  const [result] = await pool.query("DELETE FROM utilities WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, findByRoomPeriod, upsert, remove };
