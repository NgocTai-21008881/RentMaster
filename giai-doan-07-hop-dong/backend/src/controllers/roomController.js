const roomService = require("../services/roomService");
const { asyncHandler } = require("../middleware/errorHandler");

module.exports = {
  list: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await roomService.listRooms(req.query) });
  }),
  getOne: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await roomService.getRoom(req.params.id) });
  }),
  create: asyncHandler(async (req, res) => {
    const data = await roomService.createRoom(req.user.id, req.body, req.file?.filename);
    res.status(201).json({ success: true, message: "Đã thêm phòng.", data });
  }),
  update: asyncHandler(async (req, res) => {
    const data = await roomService.updateRoom(req.user.id, req.params.id, req.body, req.file?.filename);
    res.json({ success: true, message: "Đã cập nhật phòng.", data });
  }),
  remove: asyncHandler(async (req, res) => {
    await roomService.deleteRoom(req.user.id, req.params.id);
    res.json({ success: true, message: "Đã xóa phòng." });
  }),
};
