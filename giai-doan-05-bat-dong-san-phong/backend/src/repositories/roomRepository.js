const { pool } = require("../config/db");

async function findAll(query) {
  const where = [];
  const params = [];
  if (query.property_id) {
    where.push("r.property_id = ?");
    params.push(query.property_id);
  }
  if (query.status) {
    where.push("r.status = ?");
    params.push(query.status);
  }
  if (query.search) {
    where.push("(r.code LIKE ? OR r.name LIKE ? OR p.name LIKE ? OR p.address LIKE ?)");
    params.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
  }
  if (query.type) {
    where.push("p.type = ?");
    params.push(query.type);
  }
  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM rooms r JOIN properties p ON p.id = r.property_id ${sqlWhere}`,
    params
  );
  const [rows] = await pool.query(
    `SELECT r.*, p.name AS property_name, p.type AS property_type, p.address AS property_address
     FROM rooms r JOIN properties p ON p.id = r.property_id
     ${sqlWhere}
     ORDER BY r.id DESC
     LIMIT ? OFFSET ?`,
    [...params, query.limit ?? 100, query.offset ?? 0]
  );
  return { rows, total };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT r.*, p.name AS property_name, p.address AS property_address
     FROM rooms r JOIN properties p ON p.id = r.property_id
     WHERE r.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO rooms (property_id, code, name, floor, area, rent_price, deposit, max_occupants, amenities, image_url, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.property_id,
      data.code,
      data.name,
      data.floor || null,
      data.area,
      data.rent_price,
      data.deposit || 0,
      data.max_occupants || 2,
      data.amenities || null,
      data.image_url || null,
      data.status || "vacant",
    ]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  await pool.query(
    `UPDATE rooms SET property_id = ?, code = ?, name = ?, floor = ?, area = ?, rent_price = ?, deposit = ?, max_occupants = ?, amenities = ?, image_url = COALESCE(?, image_url), status = ? WHERE id = ?`,
    [
      data.property_id,
      data.code,
      data.name,
      data.floor || null,
      data.area,
      data.rent_price,
      data.deposit || 0,
      data.max_occupants || 2,
      data.amenities || null,
      data.image_url || null,
      data.status,
      id,
    ]
  );
  return findById(id);
}

async function setStatus(id, status) {
  await pool.query("UPDATE rooms SET status = ? WHERE id = ?", [status, id]);
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query("DELETE FROM rooms WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

async function countStats() {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total,
            SUM(status = 'vacant') AS vacant,
            SUM(status = 'occupied') AS occupied,
            SUM(status = 'reserved') AS reserved,
            SUM(status = 'maintenance') AS maintenance
     FROM rooms`
  );
  return rows[0];
}

async function vacantRooms() {
  const [rows] = await pool.query(
    `SELECT r.*, p.name AS property_name FROM rooms r
     JOIN properties p ON p.id = r.property_id
     WHERE r.status = 'vacant' ORDER BY r.rent_price ASC`
  );
  return rows;
}

module.exports = { findAll, findById, create, update, setStatus, remove, countStats, vacantRooms };
