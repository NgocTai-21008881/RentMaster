const paymentService = require("../services/paymentService");
const { asyncHandler } = require("../middleware/errorHandler");

module.exports = {
  list: asyncHandler(async (req, res) => {
    const query = { ...req.query };
    if (req.user.role === "tenant" && req.tenant) query.tenant_id = req.tenant.id;
    res.json({ success: true, data: await paymentService.listPayments(query) });
  }),
  create: asyncHandler(async (req, res) => {
    const data = await paymentService.createPayment(req.user.id, req.body);
    res.status(201).json({ success: true, message: "Đã ghi nhận thanh toán.", data });
  }),
  qr: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await paymentService.paymentQr(req.params.invoiceId) });
  }),
};
