const { pool } = require("../config/db");

async function findAll(query = {}) {
  const where = [];
  const params = [];
  if (query.invoice_id) {
    where.push("p.invoice_id = ?");
    params.push(query.invoice_id);
  }
  if (query.tenant_id) {
    where.push("i.tenant_id = ?");
    params.push(query.tenant_id);
  }
  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM payments p JOIN invoices i ON i.id = p.invoice_id ${sqlWhere}`,
    params
  );
  const [rows] = await pool.query(
    `SELECT p.*, i.code AS invoice_code, t.full_name AS tenant_name, u.name AS confirmed_name
     FROM payments p
     JOIN invoices i ON i.id = p.invoice_id
     JOIN tenants t ON t.id = i.tenant_id
     LEFT JOIN users u ON u.id = p.confirmed_by
     ${sqlWhere}
     ORDER BY p.id DESC
     LIMIT ? OFFSET ?`,
    [...params, query.limit ?? 50, query.offset ?? 0]
  );
  return { rows, total };
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO payments (invoice_id, amount, method, note, confirmed_by, paid_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.invoice_id, data.amount, data.method, data.note || null, data.confirmed_by || null, data.paid_at]
  );
  const [rows] = await pool.query("SELECT * FROM payments WHERE id = ?", [result.insertId]);
  return rows[0];
}

async function revenueBetween(from, to) {
  const [rows] = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE paid_at BETWEEN ? AND ?`,
    [from, to]
  );
  return Number(rows[0].total) || 0;
}

async function revenueByProperty(from, to) {
  const [rows] = await pool.query(
    `SELECT pr.id, pr.name, COALESCE(SUM(p.amount), 0) AS total
     FROM properties pr
     LEFT JOIN rooms r ON r.property_id = pr.id
     LEFT JOIN invoices i ON i.room_id = r.id
     LEFT JOIN payments p ON p.invoice_id = i.id AND p.paid_at BETWEEN ? AND ?
     GROUP BY pr.id
     ORDER BY total DESC`,
    [from, to]
  );
  return rows;
}

module.exports = { findAll, create, revenueBetween, revenueByProperty };
