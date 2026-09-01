const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");
const tenantRepository = require("../repositories/tenantRepository");
const { httpError, publicUser } = require("../utils/helpers");
const { sendEmail } = require("./notifyService");
const { logActivity } = require("./activityService");
const { fileUrl } = require("../middleware/upload");

function signAccess(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

function signRefresh(user) {
  return jwt.sign({ id: user.id, type: "refresh" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function register(payload) {
  const name = (payload.name || "").trim();
  const email = (payload.email || "").trim().toLowerCase();
  const password = payload.password || "";
  const phone = (payload.phone || "").trim();
  if (!name) throw httpError(400, "Họ tên không được để trống.");
  if (!validateEmail(email)) throw httpError(400, "Email không hợp lệ.");
  if (password.length < 6) throw httpError(400, "Mật khẩu phải từ 6 ký tự.");
  if (await userRepository.findByEmail(email)) throw httpError(409, "Email đã được sử dụng.");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepository.create({
    name,
    email,
    password: passwordHash,
    role: "tenant",
    phone,
    status: "active",
  });
  await tenantRepository.create({
    user_id: user.id,
    full_name: name,
    phone: phone || "0000000000",
    email,
  });
  await logActivity({ userId: user.id, action: "register", entity: "users", entityId: user.id, detail: "Đăng ký người thuê" });
  return login(email, password);
}

async function login(email, password) {
  if (!email || !password) throw httpError(400, "Vui lòng nhập email và mật khẩu.");
  const user = await userRepository.findByEmail(String(email).trim().toLowerCase());
  if (!user) throw httpError(401, "Email hoặc mật khẩu không đúng.");
  if (user.status === "locked") throw httpError(403, "Tài khoản đã bị khóa.");
  const matched = await bcrypt.compare(password, user.password);
  if (!matched) throw httpError(401, "Email hoặc mật khẩu không đúng.");

  const token = signAccess(user);
  const refreshToken = signRefresh(user);
  await userRepository.setRefreshToken(user.id, refreshToken);
  await logActivity({ userId: user.id, action: "login", entity: "users", entityId: user.id, detail: "Đăng nhập" });
  return { token, refreshToken, user: publicUser(user) };
}

async function refresh(refreshToken) {
  if (!refreshToken) throw httpError(400, "Thiếu refresh token.");
  try {
    jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch {
    throw httpError(401, "Refresh token không hợp lệ.");
  }
  const user = await userRepository.findByRefreshToken(refreshToken);
  if (!user || user.status === "locked") throw httpError(401, "Phiên đăng nhập đã hết hạn.");
  const token = signAccess(user);
  const nextRefresh = signRefresh(user);
  await userRepository.setRefreshToken(user.id, nextRefresh);
  return { token, refreshToken: nextRefresh, user: publicUser(user) };
}

async function logout(userId) {
  await userRepository.setRefreshToken(userId, null);
}

async function getProfile(userId) {
  const user = await userRepository.findById(userId);
  if (!user) throw httpError(404, "Không tìm thấy tài khoản.");
  const tenant = user.role === "tenant" ? await tenantRepository.findByUserId(userId) : null;
  let room = null;
  if (tenant?.room_id) {
    const roomRepository = require("../repositories/roomRepository");
    room = await roomRepository.findById(tenant.room_id);
  }
  return { ...user, tenant_id: tenant?.id || null, tenant, room };
}

async function updateProfile(userId, payload, filename) {
  const current = await userRepository.findById(userId);
  if (!current) throw httpError(404, "Không tìm thấy tài khoản.");
  const name = (payload.name || current.name).trim();
  if (!name) throw httpError(400, "Họ tên không được để trống.");
  return userRepository.update(userId, {
    name,
    phone: payload.phone,
    avatar: filename ? fileUrl(filename) : null,
    role: current.role,
    status: current.status,
  });
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await userRepository.findAuthById(userId);
  if (!user) throw httpError(404, "Không tìm thấy tài khoản.");
  if (!(await bcrypt.compare(currentPassword || "", user.password))) {
    throw httpError(400, "Mật khẩu hiện tại không đúng.");
  }
  if (!newPassword || newPassword.length < 6) throw httpError(400, "Mật khẩu mới phải từ 6 ký tự.");
  await userRepository.updatePassword(userId, await bcrypt.hash(newPassword, 10));
}

async function forgotPassword(email) {
  const user = await userRepository.findByEmail(String(email || "").trim().toLowerCase());
  if (!user) return { message: "Nếu email tồn tại, hệ thống đã gửi hướng dẫn đặt lại mật khẩu." };
  const token = crypto.randomBytes(24).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  await userRepository.setResetToken(user.id, token, expires);
  const resetUrl = `${process.env.APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: "Đặt lại mật khẩu RentHub",
    text: `Bạn vừa yêu cầu đặt lại mật khẩu. Truy cập: ${resetUrl} (hết hạn sau 1 giờ).`,
  });
  const response = { message: "Nếu email tồn tại, hệ thống đã gửi hướng dẫn đặt lại mật khẩu." };
  if (process.env.NODE_ENV !== "production") response.resetToken = token;
  return response;
}

async function resetPassword(token, newPassword) {
  if (!token) throw httpError(400, "Thiếu mã đặt lại mật khẩu.");
  if (!newPassword || newPassword.length < 6) throw httpError(400, "Mật khẩu mới phải từ 6 ký tự.");
  const user = await userRepository.findByResetToken(token);
  if (!user) throw httpError(400, "Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
  await userRepository.updatePassword(user.id, await bcrypt.hash(newPassword, 10));
  await userRepository.setResetToken(user.id, null, null);
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};
