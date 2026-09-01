const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/userRepository");
const { httpError, paginate } = require("../utils/helpers");
const { pool } = require("../config/db");
const { logActivity } = require("./activityService");

async function listUsers(query) {
  const paging = paginate(query);
  const result = await userRepository.list({ ...query, ...paging });
  return { items: result.rows, total: result.total, page: paging.page, limit: paging.limit };
}

async function createUser(actorId, payload) {
  const name = (payload.name || "").trim();
  const email = (payload.email || "").trim().toLowerCase();
  const role = payload.role || "manager";
  if (!name || !email) throw httpError(400, "Tên và email là bắt buộc.");
  if (!["admin", "owner", "manager", "tenant"].includes(role)) throw httpError(400, "Vai trò không hợp lệ.");
  if (await userRepository.findByEmail(email)) throw httpError(409, "Email đã tồn tại.");
  const password = payload.password || "Demo@123";
  const user = await userRepository.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role,
    phone: payload.phone,
    status: "active",
  });
  await logActivity({ userId: actorId, action: "create", entity: "users", entityId: user.id, detail: `Tạo tài khoản ${email}` });
  return user;
}

async function updateUser(actorId, id, payload) {
  const current = await userRepository.findById(id);
  if (!current) throw httpError(404, "Không tìm thấy tài khoản.");
  const user = await userRepository.update(id, {
    name: payload.name || current.name,
    phone: payload.phone,
    role: payload.role || current.role,
    status: payload.status || current.status,
  });
  await logActivity({ userId: actorId, action: "update", entity: "users", entityId: id, detail: "Cập nhật tài khoản" });
  return user;
}

async function toggleLock(actorId, id) {
  const current = await userRepository.findById(id);
  if (!current) throw httpError(404, "Không tìm thấy tài khoản.");
  if (Number(id) === Number(actorId)) throw httpError(400, "Không thể khóa chính mình.");
  const next = current.status === "locked" ? "active" : "locked";
  const user = await userRepository.setStatus(id, next);
  await logActivity({ userId: actorId, action: next === "locked" ? "lock" : "unlock", entity: "users", entityId: id });
  return user;
}

async function removeUser(actorId, id) {
  if (Number(id) === Number(actorId)) throw httpError(400, "Không thể xóa chính mình.");
  const deleted = await userRepository.remove(id);
  if (!deleted) throw httpError(404, "Không tìm thấy tài khoản.");
  await logActivity({ userId: actorId, action: "delete", entity: "users", entityId: id });
}

async function activityLogs(query) {
  const paging = paginate(query);
  const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM activity_logs");
  const [rows] = await pool.query(
    `SELECT a.*, u.name AS user_name, u.email FROM activity_logs a
     LEFT JOIN users u ON u.id = a.user_id
     ORDER BY a.id DESC LIMIT ? OFFSET ?`,
    [paging.limit, paging.offset]
  );
  return { items: rows, total, page: paging.page, limit: paging.limit };
}

module.exports = { listUsers, createUser, updateUser, toggleLock, removeUser, activityLogs };
