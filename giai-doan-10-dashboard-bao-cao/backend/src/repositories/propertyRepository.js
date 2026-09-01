const { pool } = require("../config/db");

function filters(query) {
  const where = [];
  const params = [];
  if (query.search) {
    where.push("(p.name LIKE ? OR p.address LIKE ?)");
    params.push(`%${query.search}%`, `%${query.search}%`);
  }
  if (query.type) {
    where.push("p.type = ?");
    params.push(query.type);
  }
  if (query.status) {
    where.push("p.status = ?");
    params.push(query.status);
  }
  if (query.manager_id) {
    where.push("p.manager_id = ?");
    params.push(query.manager_id);
  }
  return { where, params };
}

async function findAll(query) {
  const { where, params } = filters(query);
  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM properties p ${sqlWhere}`, params);
  const [rows] = await pool.query(
    `SELECT p.*, u.name AS manager_name, COUNT(r.id) AS room_count
     FROM properties p
     LEFT JOIN users u ON u.id = p.manager_id
     LEFT JOIN rooms r ON r.property_id = p.id
     ${sqlWhere}
     GROUP BY p.id
     ORDER BY p.id DESC
     LIMIT ? OFFSET ?`,
    [...params, query.limit, query.offset]
  );
  return { rows, total };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT p.*, u.name AS manager_name, COUNT(r.id) AS room_count
     FROM properties p
     LEFT JOIN users u ON u.id = p.manager_id
     LEFT JOIN rooms r ON r.property_id = p.id
     WHERE p.id = ?
     GROUP BY p.id`,
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO properties (name, type, address, description, image_url, manager_id, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.name, data.type, data.address, data.description || null, data.image_url || null, data.manager_id || null, data.status || "active"]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  await pool.query(
    `UPDATE properties SET name = ?, type = ?, address = ?, description = ?, image_url = COALESCE(?, image_url), manager_id = ?, status = ? WHERE id = ?`,
    [data.name, data.type, data.address, data.description || null, data.image_url || null, data.manager_id || null, data.status, id]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query("DELETE FROM properties WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

async function countAll() {
  const [rows] = await pool.query("SELECT COUNT(*) AS total FROM properties WHERE status = 'active'");
  return rows[0].total;
}

module.exports = { findAll, findById, create, update, remove, countAll };
