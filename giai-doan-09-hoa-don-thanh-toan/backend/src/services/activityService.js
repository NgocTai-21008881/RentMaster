const { pool } = require("../config/db");

async function logActivity({ userId, action, entity, entityId, detail }) {
  try {
    await pool.query(
      "INSERT INTO activity_logs (user_id, action, entity, entity_id, detail) VALUES (?, ?, ?, ?, ?)",
      [userId || null, action, entity || null, entityId || null, detail || null]
    );
  } catch (error) {
    console.error("[activity]", error.message);
  }
}

module.exports = { logActivity };
