const { pool } = require("../config/db");

async function findAll(query = {}) {
  const where = [];
  const params = [];
  if (query.search) {
    where.push("(i.code LIKE ? OR t.full_name LIKE ? OR r.code LIKE ?)");
    params.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
  }
  if (query.status) {
    where.push("i.status = ?");
    params.push(query.status);
  }
  if (query.tenant_id) {
    where.push("i.tenant_id = ?");
    params.push(query.tenant_id);
  }
  if (query.period) {
    where.push("i.period = ?");
    params.push(query.period);
  }
  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM invoices i
     JOIN tenants t ON t.id = i.tenant_id
     JOIN rooms r ON r.id = i.room_id ${sqlWhere}`,
    params
  );
  const [rows] = await pool.query(
    `SELECT i.*, t.full_name AS tenant_name, r.code AS room_code, p.name AS property_name
     FROM invoices i
     JOIN tenants t ON t.id = i.tenant_id
     JOIN rooms r ON r.id = i.room_id
     JOIN properties p ON p.id = r.property_id
     ${sqlWhere}
     ORDER BY i.id DESC
     LIMIT ? OFFSET ?`,
    [...params, query.limit ?? 50, query.offset ?? 0]
  );
  return { rows, total };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT i.*, t.full_name AS tenant_name, t.phone AS tenant_phone, t.email AS tenant_email,
            r.code AS room_code, r.name AS room_name, p.name AS property_name
     FROM invoices i
     JOIN tenants t ON t.id = i.tenant_id
     JOIN rooms r ON r.id = i.room_id
     JOIN properties p ON p.id = r.property_id
     WHERE i.id = ? LIMIT 1`,
    [id]
  );
  if (!rows[0]) return null;
  const [items] = await pool.query("SELECT * FROM invoice_items WHERE invoice_id = ?", [id]);
  rows[0].items = items;
  return rows[0];
}

async function create(data, items) {
  const [result] = await pool.query(
    `INSERT INTO invoices (code, contract_id, room_id, tenant_id, period, rent_amount, electric_amount, water_amount, service_amount, other_amount, discount, total, paid_amount, due_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.code,
      data.contract_id || null,
      data.room_id,
      data.tenant_id,
      data.period,
      data.rent_amount,
      data.electric_amount,
      data.water_amount,
      data.service_amount,
      data.other_amount,
      data.discount,
      data.total,
      data.paid_amount || 0,
      data.due_date,
      data.status || "unpaid",
    ]
  );
  for (const item of items) {
    await pool.query("INSERT INTO invoice_items (invoice_id, name, amount, type) VALUES (?, ?, ?, ?)", [
      result.insertId,
      item.name,
      item.amount,
      item.type,
    ]);
  }
  return findById(result.insertId);
}

async function updateAmounts(id, paidAmount, status) {
  await pool.query("UPDATE invoices SET paid_amount = ?, status = ? WHERE id = ?", [paidAmount, status, id]);
  return findById(id);
}

async function markOverdue() {
  await pool.query(
    `UPDATE invoices SET status = 'overdue'
     WHERE status IN ('unpaid','partial') AND due_date < CURDATE()`
  );
}

async function stats() {
  const [rows] = await pool.query(
    `SELECT
       SUM(status = 'unpaid') AS unpaid,
       SUM(status = 'overdue') AS overdue,
       SUM(status = 'partial') AS partial,
       SUM(status = 'paid') AS paid,
       COALESCE(SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END), 0) AS paid_total,
       COALESCE(SUM(CASE WHEN status IN ('unpaid','partial','overdue') THEN (total - paid_amount) ELSE 0 END), 0) AS outstanding
     FROM invoices`
  );
  return rows[0];
}

async function revenueByMonth(year) {
  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(paid_at, '%Y-%m') AS month, SUM(amount) AS total
     FROM payments
     WHERE YEAR(paid_at) = ?
     GROUP BY DATE_FORMAT(paid_at, '%Y-%m')
     ORDER BY month`,
    [year]
  );
  return rows;
}

module.exports = { findAll, findById, create, updateAmounts, markOverdue, stats, revenueByMonth };
