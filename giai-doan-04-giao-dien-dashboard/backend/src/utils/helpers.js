function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function paginate(query = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  return { page, limit, offset: (page - 1) * limit };
}

function like(value) {
  if (!value) return null;
  return `%${String(value).trim()}%`;
}

function nowSql() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateOnly(value) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 10);
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
    status: user.status,
    created_at: user.created_at,
  };
}

function isStaff(role) {
  return ["admin", "owner", "manager"].includes(role);
}

module.exports = {
  httpError,
  paginate,
  like,
  nowSql,
  monthKey,
  addDays,
  toDateOnly,
  publicUser,
  isStaff,
};
