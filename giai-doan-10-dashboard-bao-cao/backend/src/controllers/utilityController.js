const utilityService = require("../services/utilityService");
const { asyncHandler } = require("../middleware/errorHandler");

module.exports = {
  list: asyncHandler(async (req, res) => {
    const query = { ...req.query };
    if (req.user.role === "tenant" && req.tenant?.room_id) query.room_id = req.tenant.room_id;
    res.json({ success: true, data: await utilityService.listUtilities(query) });
  }),
  upsert: asyncHandler(async (req, res) => {
    const data = await utilityService.upsertUtility(req.body);
    res.json({ success: true, message: "Đã lưu chỉ số điện nước.", data });
  }),
  remove: asyncHandler(async (req, res) => {
    await utilityService.deleteUtility(req.params.id);
    res.json({ success: true, message: "Đã xóa bản ghi." });
  }),
};
