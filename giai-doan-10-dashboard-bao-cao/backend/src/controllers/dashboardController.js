const dashboardService = require("../services/dashboardService");
const reportService = require("../services/reportService");
const { asyncHandler } = require("../middleware/errorHandler");

module.exports = {
  summary: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await dashboardService.getSummary() });
  }),
  report: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await reportService.getReport(req.query) });
  }),
  export: asyncHandler(async (req, res) => {
    const file = await reportService.exportReport(req.query);
    res.setHeader("Content-Type", file.mime);
    res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
    res.send(file.buffer);
  }),
};
