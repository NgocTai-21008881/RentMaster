const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Thiếu token xác thực. Vui lòng đăng nhập.",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn.",
    });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền thực hiện thao tác này.",
      });
    }
    return next();
  };
}

const staffOnly = requireRole("admin", "owner", "manager");
const adminOnly = requireRole("admin");
const tenantOnly = requireRole("tenant");

async function attachTenant(req, res, next) {
  if (req.user.role !== "tenant") return next();
  const [rows] = await pool.query("SELECT * FROM tenants WHERE user_id = ? LIMIT 1", [req.user.id]);
  req.tenant = rows[0] || null;
  return next();
}

module.exports = {
  authMiddleware,
  requireRole,
  staffOnly,
  adminOnly,
  tenantOnly,
  attachTenant,
};
