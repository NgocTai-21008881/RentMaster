const maintenanceService = require("../services/maintenanceService");
const { asyncHandler } = require("../middleware/errorHandler");

module.exports = {
  list: asyncHandler(async (req, res) => {
    const query = { ...req.query };
    if (req.user.role === "tenant" && req.tenant) query.tenant_id = req.tenant.id;
    res.json({ success: true, data: await maintenanceService.listRequests(query) });
  }),
  create: asyncHandler(async (req, res) => {
    const data = await maintenanceService.createRequest(req.user, req.body, req.file?.filename);
    res.status(201).json({ success: true, message: "Đã gửi yêu cầu.", data });
  }),
  update: asyncHandler(async (req, res) => {
    const data = await maintenanceService.updateRequest(req.user, req.params.id, req.body);
    res.json({ success: true, data });
  }),
};
