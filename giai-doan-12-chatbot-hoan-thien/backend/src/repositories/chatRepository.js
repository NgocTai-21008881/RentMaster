const { pool } = require("../config/db");

async function getOrCreateSession(userId) {
  const [existing] = await pool.query("SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY id DESC LIMIT 1", [userId]);
  if (existing[0]) return existing[0];
  const [result] = await pool.query("INSERT INTO chat_sessions (user_id) VALUES (?)", [userId]);
  const [rows] = await pool.query("SELECT * FROM chat_sessions WHERE id = ?", [result.insertId]);
  return rows[0];
}

async function addMessage(sessionId, role, content) {
  await pool.query("INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)", [sessionId, role, content]);
}

async function recentMessages(sessionId, limit = 12) {
  const [rows] = await pool.query(
    "SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY id DESC LIMIT ?",
    [sessionId, limit]
  );
  return rows.reverse();
}

module.exports = { getOrCreateSession, addMessage, recentMessages };
