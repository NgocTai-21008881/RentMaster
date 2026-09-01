const contractService = require("../services/contractService");
const pdfService = require("../services/pdfService");
const { asyncHandler } = require("../middleware/errorHandler");

module.exports = {
  list: asyncHandler(async (req, res) => {
    const query = { ...req.query };
    if (req.user.role === "tenant" && req.tenant) query.tenant_id = req.tenant.id;
    res.json({ success: true, data: await contractService.listContracts(query) });
  }),
  getOne: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await contractService.getContract(req.params.id) });
  }),
  create: asyncHandler(async (req, res) => {
    const data = await contractService.createContract(req.user.id, req.body, req.file?.filename);
    res.status(201).json({ success: true, message: "Đã tạo hợp đồng.", data });
  }),
  update: asyncHandler(async (req, res) => {
    const data = await contractService.updateContract(req.user.id, req.params.id, req.body, req.file?.filename);
    res.json({ success: true, data });
  }),
  activate: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await contractService.activateContract(req.user.id, req.params.id) });
  }),
  terminate: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await contractService.terminateContract(req.user.id, req.params.id) });
  }),
  renew: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await contractService.renewContract(req.user.id, req.params.id, req.body.end_date) });
  }),
  confirm: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await contractService.confirmContract(req.user, req.params.id) });
  }),
  apply: asyncHandler(async (req, res) => {
    const data = await contractService.applyForRoom(req.user, req.body.room_id);
    res.status(201).json({
      success: true,
      message: "Đã gửi yêu cầu thuê. Chủ nhà sẽ xác nhận hợp đồng.",
      data,
    });
  }),
  pdf: asyncHandler(async (req, res) => {
    const { filename, buffer } = await pdfService.contractPdf(req.params.id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.send(buffer);
  }),
};
