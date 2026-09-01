const { pool } = require("../config/db");

async function create({ userId, title, message, type, link }) {
  const [result] = await pool.query(
    "INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)",
    [userId, title, message, type || "system", link || null]
  );
  return result.insertId;
}

async function listByUser(userId, query = {}) {
  const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM notifications WHERE user_id = ?", [userId]);
  const [[{ unread }]] = await pool.query(
    "SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0",
    [userId]
  );
  const [rows] = await pool.query(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT ? OFFSET ?`,
    [userId, query.limit ?? 30, query.offset ?? 0]
  );
  return { rows, total, unread };
}

async function markRead(id, userId) {
  await pool.query("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", [id, userId]);
}

async function markAllRead(userId) {
  await pool.query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [userId]);
}

async function staffUserIds() {
  const [rows] = await pool.query("SELECT id FROM users WHERE role IN ('admin','owner','manager') AND status = 'active'");
  return rows.map((row) => row.id);
}

module.exports = { create, listByUser, markRead, markAllRead, staffUserIds };
