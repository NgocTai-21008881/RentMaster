const { pool } = require("../config/db");

async function listTypes() {
  const [rows] = await pool.query("SELECT * FROM service_types ORDER BY id ASC");
  return rows;
}

async function createType(data) {
  const [result] = await pool.query(
    "INSERT INTO service_types (name, unit_price, description, is_active) VALUES (?, ?, ?, ?)",
    [data.name, data.unit_price, data.description || null, data.is_active ?? 1]
  );
  const [rows] = await pool.query("SELECT * FROM service_types WHERE id = ?", [result.insertId]);
  return rows[0];
}

async function updateType(id, data) {
  await pool.query(
    "UPDATE service_types SET name = ?, unit_price = ?, description = ?, is_active = ? WHERE id = ?",
    [data.name, data.unit_price, data.description || null, data.is_active ?? 1, id]
  );
  const [rows] = await pool.query("SELECT * FROM service_types WHERE id = ?", [id]);
  return rows[0];
}

async function removeType(id) {
  const [result] = await pool.query("DELETE FROM service_types WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

async function roomServices(roomId) {
  const [rows] = await pool.query(
    `SELECT rs.id, rs.room_id, rs.service_type_id, s.name, s.unit_price
     FROM room_services rs JOIN service_types s ON s.id = rs.service_type_id
     WHERE rs.room_id = ?`,
    [roomId]
  );
  return rows;
}

async function setRoomServices(roomId, serviceIds) {
  await pool.query("DELETE FROM room_services WHERE room_id = ?", [roomId]);
  for (const serviceId of serviceIds) {
    await pool.query("INSERT INTO room_services (room_id, service_type_id) VALUES (?, ?)", [roomId, serviceId]);
  }
  return roomServices(roomId);
}

async function sumRoomServices(roomId) {
  const [rows] = await pool.query(
    `SELECT COALESCE(SUM(s.unit_price), 0) AS total
     FROM room_services rs JOIN service_types s ON s.id = rs.service_type_id
     WHERE rs.room_id = ? AND s.is_active = 1`,
    [roomId]
  );
  return Number(rows[0].total) || 0;
}

module.exports = { listTypes, createType, updateType, removeType, roomServices, setRoomServices, sumRoomServices };
