const userService = require("../services/userService");
const { asyncHandler } = require("../middleware/errorHandler");

module.exports = {
  list: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await userService.listUsers(req.query) });
  }),
  create: asyncHandler(async (req, res) => {
    const data = await userService.createUser(req.user.id, req.body);
    res.status(201).json({ success: true, message: "Đã tạo tài khoản.", data });
  }),
  update: asyncHandler(async (req, res) => {
    const data = await userService.updateUser(req.user.id, req.params.id, req.body);
    res.json({ success: true, data });
  }),
  lock: asyncHandler(async (req, res) => {
    const data = await userService.toggleLock(req.user.id, req.params.id);
    res.json({ success: true, data });
  }),
  remove: asyncHandler(async (req, res) => {
    await userService.removeUser(req.user.id, req.params.id);
    res.json({ success: true, message: "Đã xóa tài khoản." });
  }),
  logs: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await userService.activityLogs(req.query) });
  }),
};
