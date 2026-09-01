const serviceRepository = require("../repositories/serviceRepository");
const { asyncHandler } = require("../middleware/errorHandler");
const { httpError } = require("../utils/helpers");

module.exports = {
  list: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await serviceRepository.listTypes() });
  }),
  create: asyncHandler(async (req, res) => {
    if (!req.body.name) throw httpError(400, "Tên dịch vụ không được để trống.");
    const data = await serviceRepository.createType(req.body);
    res.status(201).json({ success: true, data });
  }),
  update: asyncHandler(async (req, res) => {
    const data = await serviceRepository.updateType(req.params.id, req.body);
    res.json({ success: true, data });
  }),
  remove: asyncHandler(async (req, res) => {
    await serviceRepository.removeType(req.params.id);
    res.json({ success: true, message: "Đã xóa dịch vụ." });
  }),
  room: asyncHandler(async (req, res) => {
    const ids = Array.isArray(req.body.service_ids) ? req.body.service_ids : [];
    const data = await serviceRepository.setRoomServices(req.params.roomId, ids);
    res.json({ success: true, data });
  }),
};
