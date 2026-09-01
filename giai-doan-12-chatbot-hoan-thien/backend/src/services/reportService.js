const ExcelJS = require("exceljs");
const paymentRepository = require("../repositories/paymentRepository");
const invoiceRepository = require("../repositories/invoiceRepository");
const roomRepository = require("../repositories/roomRepository");
const contractRepository = require("../repositories/contractRepository");
const { httpError } = require("../utils/helpers");

function range(query) {
  const year = Number(query.year) || new Date().getFullYear();
  const from = query.from || `${year}-01-01 00:00:00`;
  const to = query.to || `${year}-12-31 23:59:59`;
  return { year, from, to };
}

async function getReport(query) {
  const { year, from, to } = range(query);
  const [byMonth, byProperty, invoiceStats, roomStats, contracts] = await Promise.all([
    invoiceRepository.revenueByMonth(year),
    paymentRepository.revenueByProperty(from, to),
    invoiceRepository.stats(),
    roomRepository.countStats(),
    contractRepository.findAll({ limit: 500, offset: 0 }),
  ]);
  const newContracts = contracts.rows.filter((row) => String(row.start_date).slice(0, 4) === String(year)).length;
  const expiredContracts = contracts.rows.filter((row) => row.status === "expired" || row.computed_status === "expired").length;
  const occupancyRate = roomStats.total ? Math.round((Number(roomStats.occupied) / Number(roomStats.total)) * 100) : 0;
  const vacantRate = roomStats.total ? Math.round((Number(roomStats.vacant) / Number(roomStats.total)) * 100) : 0;

  return {
    year,
    from,
    to,
    revenue_by_month: byMonth,
    revenue_by_property: byProperty,
    outstanding: Number(invoiceStats.outstanding) || 0,
    overdue_amount: Number(invoiceStats.outstanding) || 0,
    occupancy_rate: occupancyRate,
    vacant_rate: vacantRate,
    new_contracts: newContracts,
    expired_contracts: expiredContracts,
    room_stats: roomStats,
    invoice_stats: invoiceStats,
  };
}

async function exportReport(query) {
  const data = await getReport(query);
  const format = query.format === "xlsx" ? "xlsx" : "csv";
  if (format === "csv") {
    const lines = ["Thang,Doanh thu"];
    for (const row of data.revenue_by_month) lines.push(`${row.month},${row.total}`);
    lines.push("");
    lines.push("Bat dong san,Doanh thu");
    for (const row of data.revenue_by_property) lines.push(`"${row.name}",${row.total}`);
    return { filename: `bao-cao-${data.year}.csv`, mime: "text/csv; charset=utf-8", buffer: Buffer.from(lines.join("\n"), "utf8") };
  }
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Doanh thu thang");
  sheet.addRow(["Tháng", "Doanh thu"]);
  data.revenue_by_month.forEach((row) => sheet.addRow([row.month, Number(row.total)]));
  const sheet2 = workbook.addWorksheet("Theo BDS");
  sheet2.addRow(["Bất động sản", "Doanh thu"]);
  data.revenue_by_property.forEach((row) => sheet2.addRow([row.name, Number(row.total)]));
  const buffer = await workbook.xlsx.writeBuffer();
  return { filename: `bao-cao-${data.year}.xlsx`, mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer };
}

module.exports = { getReport, exportReport };
