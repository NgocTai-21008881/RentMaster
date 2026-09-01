const invoiceService = require("../services/invoiceService");
const pdfService = require("../services/pdfService");
const { asyncHandler } = require("../middleware/errorHandler");

module.exports = {
  list: asyncHandler(async (req, res) => {
    const query = { ...req.query };
    if (req.user.role === "tenant" && req.tenant) query.tenant_id = req.tenant.id;
    res.json({ success: true, data: await invoiceService.listInvoices(query) });
  }),
  getOne: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await invoiceService.getInvoice(req.params.id) });
  }),
  create: asyncHandler(async (req, res) => {
    const data = await invoiceService.createManual(req.user.id, req.body);
    res.status(201).json({ success: true, message: "Đã tạo hóa đơn.", data });
  }),
  pdf: asyncHandler(async (req, res) => {
    const { filename, buffer } = await pdfService.invoicePdf(req.params.id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.send(buffer);
  }),
};
