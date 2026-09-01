const invoiceRepository = require("../repositories/invoiceRepository");
const contractRepository = require("../repositories/contractRepository");
const utilityRepository = require("../repositories/utilityRepository");
const serviceRepository = require("../repositories/serviceRepository");
const tenantRepository = require("../repositories/tenantRepository");
const { httpError, paginate, monthKey } = require("../utils/helpers");
const { notifyUser, notifyStaff } = require("./notifyService");
const { logActivity } = require("./activityService");

function invoiceStatus(total, paid, dueDate) {
  if (paid >= total && total > 0) return "paid";
  const overdue = new Date(dueDate) < new Date(new Date().toISOString().slice(0, 10));
  if (paid > 0 && paid < total) return overdue ? "overdue" : "partial";
  return overdue ? "overdue" : "unpaid";
}

async function listInvoices(query) {
  await invoiceRepository.markOverdue();
  const paging = paginate(query);
  const result = await invoiceRepository.findAll({ ...query, ...paging });
  return { items: result.rows, total: result.total, page: paging.page, limit: paging.limit };
}

async function getInvoice(id) {
  const item = await invoiceRepository.findById(id);
  if (!item) throw httpError(404, "Không tìm thấy hóa đơn.");
  return item;
}

async function generateFromContract(actorId, { contract_id, period, other_amount = 0, discount = 0, due_date }) {
  const contract = await contractRepository.findById(contract_id);
  if (!contract) throw httpError(400, "Hợp đồng không tồn tại.");
  const month = period || monthKey();
  const utility = await utilityRepository.findByRoomPeriod(contract.room_id, month);
  const serviceAmount = await serviceRepository.sumRoomServices(contract.room_id);
  const rent = Number(contract.rent_amount);
  const electric = Number(utility?.electric_amount || 0);
  const water = Number(utility?.water_amount || 0);
  const other = Number(other_amount) || 0;
  const disc = Number(discount) || 0;
  const total = rent + electric + water + serviceAmount + other - disc;
  const due = due_date || `${month}-10`;
  const code = `HDN-${month.replace("-", "")}-${String(contract.id).padStart(3, "0")}`;
  const items = [
    { name: "Tiền thuê phòng", amount: rent, type: "rent" },
    { name: "Tiền điện", amount: electric, type: "electric" },
    { name: "Tiền nước", amount: water, type: "water" },
    { name: "Dịch vụ", amount: serviceAmount, type: "service" },
  ];
  if (other) items.push({ name: "Phí khác", amount: other, type: "other" });
  if (disc) items.push({ name: "Giảm giá", amount: -disc, type: "discount" });

  const invoice = await invoiceRepository.create(
    {
      code,
      contract_id: contract.id,
      room_id: contract.room_id,
      tenant_id: contract.tenant_id,
      period: month,
      rent_amount: rent,
      electric_amount: electric,
      water_amount: water,
      service_amount: serviceAmount,
      other_amount: other,
      discount: disc,
      total,
      paid_amount: 0,
      due_date: due,
      status: invoiceStatus(total, 0, due),
    },
    items
  );
  const tenant = await tenantRepository.findById(contract.tenant_id);
  if (tenant?.user_id) {
    await notifyUser(tenant.user_id, {
      title: "Hóa đơn mới",
      message: `Hóa đơn ${invoice.code} đã được phát hành. Tổng tiền ${total.toLocaleString("vi-VN")}đ.`,
      type: "invoice_new",
      link: "/portal/invoices",
      email: tenant.email,
      phone: tenant.phone,
    });
  }
  await notifyStaff({
    title: "Hóa đơn mới",
    message: `Đã tạo hóa đơn ${invoice.code} cho ${tenant.full_name}.`,
    type: "invoice_new",
    link: "/dashboard/invoices",
  });
  await logActivity({ userId: actorId, action: "create", entity: "invoices", entityId: invoice.id, detail: invoice.code });
  return invoice;
}

async function createManual(actorId, payload) {
  if (!payload.contract_id) throw httpError(400, "Vui lòng chọn hợp đồng.");
  return generateFromContract(actorId, payload);
}

module.exports = { listInvoices, getInvoice, generateFromContract, createManual, invoiceStatus };
