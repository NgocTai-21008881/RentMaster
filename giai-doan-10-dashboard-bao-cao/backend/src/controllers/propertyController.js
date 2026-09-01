const propertyService = require("../services/propertyService");
const { asyncHandler } = require("../middleware/errorHandler");

module.exports = {
  list: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await propertyService.listProperties(req.query) });
  }),
  getOne: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await propertyService.getProperty(req.params.id) });
  }),
  create: asyncHandler(async (req, res) => {
    const data = await propertyService.createProperty(req.user.id, req.body, req.file?.filename);
    res.status(201).json({ success: true, message: "Đã thêm bất động sản.", data });
  }),
  update: asyncHandler(async (req, res) => {
    const data = await propertyService.updateProperty(req.user.id, req.params.id, req.body, req.file?.filename);
    res.json({ success: true, message: "Đã cập nhật bất động sản.", data });
  }),
  remove: asyncHandler(async (req, res) => {
    await propertyService.deleteProperty(req.user.id, req.params.id);
    res.json({ success: true, message: "Đã xóa bất động sản." });
  }),
};
