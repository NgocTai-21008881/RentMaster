const { pool } = require("../config/db");

async function findByEmail(email) {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query(
    "SELECT id, name, email, role, phone, avatar, status, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

async function findAuthById(id) {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

async function findByResetToken(token) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW() LIMIT 1",
    [token]
  );
  return rows[0] || null;
}

async function list({ search, role, status, limit, offset }) {
  const where = [];
  const params = [];
  if (search) {
    where.push("(name LIKE ? OR email LIKE ? OR phone LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (role) {
    where.push("role = ?");
    params.push(role);
  }
  if (status) {
    where.push("status = ?");
    params.push(status);
  }
  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM users ${sqlWhere}`, params);
  const [rows] = await pool.query(
    `SELECT id, name, email, role, phone, avatar, status, created_at FROM users ${sqlWhere} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return { rows, total };
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO users (name, email, password, role, phone, avatar, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.name, data.email, data.password, data.role, data.phone || null, data.avatar || null, data.status || "active"]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  await pool.query(
    `UPDATE users SET name = ?, phone = ?, avatar = COALESCE(?, avatar), role = COALESCE(?, role), status = COALESCE(?, status) WHERE id = ?`,
    [data.name, data.phone || null, data.avatar || null, data.role || null, data.status || null, id]
  );
  return findById(id);
}

async function updatePassword(id, password) {
  await pool.query("UPDATE users SET password = ? WHERE id = ?", [password, id]);
}

async function setRefreshToken(id, token) {
  await pool.query("UPDATE users SET refresh_token = ? WHERE id = ?", [token, id]);
}

async function setResetToken(id, token, expires) {
  await pool.query("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?", [token, expires, id]);
}

async function setStatus(id, status) {
  await pool.query("UPDATE users SET status = ? WHERE id = ?", [status, id]);
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

async function findByRefreshToken(token) {
  const [rows] = await pool.query("SELECT * FROM users WHERE refresh_token = ? LIMIT 1", [token]);
  return rows[0] || null;
}

module.exports = {
  findByEmail,
  findById,
  findAuthById,
  findByResetToken,
  findByRefreshToken,
  list,
  create,
  update,
  updatePassword,
  setRefreshToken,
  setResetToken,
  setStatus,
  remove,
};
