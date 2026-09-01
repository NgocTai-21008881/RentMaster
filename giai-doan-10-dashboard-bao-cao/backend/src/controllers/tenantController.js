const tenantService = require("../services/tenantService");
const { asyncHandler } = require("../middleware/errorHandler");

module.exports = {
  list: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await tenantService.listTenants(req.query) });
  }),
  getOne: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await tenantService.getTenant(req.params.id) });
  }),
  create: asyncHandler(async (req, res) => {
    const data = await tenantService.createTenant(req.user.id, req.body);
    res.status(201).json({ success: true, message: "Đã thêm người thuê.", data });
  }),
  update: asyncHandler(async (req, res) => {
    const data = await tenantService.updateTenant(req.user.id, req.params.id, req.body);
    res.json({ success: true, message: "Đã cập nhật người thuê.", data });
  }),
  remove: asyncHandler(async (req, res) => {
    await tenantService.deleteTenant(req.user.id, req.params.id);
    res.json({ success: true, message: "Đã xóa người thuê." });
  }),
};
