const propertyRepository = require("../repositories/propertyRepository");
const roomRepository = require("../repositories/roomRepository");
const tenantRepository = require("../repositories/tenantRepository");
const contractRepository = require("../repositories/contractRepository");
const invoiceRepository = require("../repositories/invoiceRepository");
const paymentRepository = require("../repositories/paymentRepository");
const { monthKey } = require("../utils/helpers");

async function getSummary() {
  await invoiceRepository.markOverdue();
  const [propertyCount, roomStats, tenantCount, contractStats, invoiceStats] = await Promise.all([
    propertyRepository.countAll(),
    roomRepository.countStats(),
    tenantRepository.countAll(),
    contractRepository.countByStatus(),
    invoiceRepository.stats(),
  ]);
  const now = new Date();
  const from = `${monthKey(now)}-01 00:00:00`;
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const monthRevenue = await paymentRepository.revenueBetween(from, to.toISOString().slice(0, 19).replace("T", " "));
  const revenueMonths = await invoiceRepository.revenueByMonth(now.getFullYear());

  return {
    total_properties: Number(propertyCount) || 0,
    total_rooms: Number(roomStats.total) || 0,
    vacant_rooms: Number(roomStats.vacant) || 0,
    occupied_rooms: Number(roomStats.occupied) || 0,
    reserved_rooms: Number(roomStats.reserved) || 0,
    maintenance_rooms: Number(roomStats.maintenance) || 0,
    total_tenants: Number(tenantCount) || 0,
    active_contracts: Number(contractStats.active) || 0,
    expiring_contracts: Number(contractStats.expiring) || 0,
    unpaid_invoices: Number(invoiceStats.unpaid) || 0,
    overdue_invoices: Number(invoiceStats.overdue) || 0,
    month_revenue: monthRevenue,
    revenue_by_month: revenueMonths,
    occupancy: {
      vacant: Number(roomStats.vacant) || 0,
      occupied: Number(roomStats.occupied) || 0,
      reserved: Number(roomStats.reserved) || 0,
      maintenance: Number(roomStats.maintenance) || 0,
    },
    invoices: {
      paid: Number(invoiceStats.paid) || 0,
      unpaid: Number(invoiceStats.unpaid) || 0,
      partial: Number(invoiceStats.partial) || 0,
      overdue: Number(invoiceStats.overdue) || 0,
    },
  };
}

module.exports = { getSummary };
