const authService = require("../services/authService");
const { asyncHandler } = require("../middleware/errorHandler");

const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  res.status(201).json({ success: true, message: "Đăng ký thành công.", data });
});

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body.email, req.body.password);
  res.json({ success: true, message: "Đăng nhập thành công.", data });
});

const refresh = asyncHandler(async (req, res) => {
  const data = await authService.refresh(req.body.refreshToken);
  res.json({ success: true, data });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  res.json({ success: true, message: "Đã đăng xuất." });
});

const me = asyncHandler(async (req, res) => {
  const data = await authService.getProfile(req.user.id);
  res.json({ success: true, data });
});

const updateProfile = asyncHandler(async (req, res) => {
  const data = await authService.updateProfile(req.user.id, req.body, req.file?.filename);
  res.json({ success: true, message: "Đã cập nhật hồ sơ.", data });
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body.current_password, req.body.new_password);
  res.json({ success: true, message: "Đã đổi mật khẩu." });
});

const forgot = asyncHandler(async (req, res) => {
  const data = await authService.forgotPassword(req.body.email);
  res.json({ success: true, ...data });
});

const reset = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.new_password);
  res.json({ success: true, message: "Đặt lại mật khẩu thành công." });
});

module.exports = { register, login, refresh, logout, me, updateProfile, changePassword, forgot, reset };
