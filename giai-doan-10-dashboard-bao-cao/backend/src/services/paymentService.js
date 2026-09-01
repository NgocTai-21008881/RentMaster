const paymentRepository = require("../repositories/paymentRepository");
const invoiceRepository = require("../repositories/invoiceRepository");
const { httpError, paginate, nowSql } = require("../utils/helpers");
const { invoiceStatus } = require("./invoiceService");
const { logActivity } = require("./activityService");
const { notifyUser } = require("./notifyService");
const tenantRepository = require("../repositories/tenantRepository");

function qrUrl(invoice) {
  const bank = process.env.BANK_CODE || "VCB";
  const account = process.env.BANK_ACCOUNT || "0123456789";
  const remain = Math.max(0, Number(invoice.total) - Number(invoice.paid_amount));
  const info = encodeURIComponent(`Thanh toan ${invoice.code}`);
  return `https://img.vietqr.io/image/${bank}-${account}-compact2.png?amount=${remain}&addInfo=${info}`;
}

async function listPayments(query) {
  const paging = paginate(query);
  const result = await paymentRepository.findAll({ ...query, ...paging });
  return { items: result.rows, total: result.total, page: paging.page, limit: paging.limit };
}

async function createPayment(actorId, payload) {
  const invoice = await invoiceRepository.findById(payload.invoice_id);
  if (!invoice) throw httpError(404, "Không tìm thấy hóa đơn.");
  const amount = Number(payload.amount);
  if (!amount || amount <= 0) throw httpError(400, "Số tiền thanh toán không hợp lệ.");
  const remain = Number(invoice.total) - Number(invoice.paid_amount);
  if (amount > remain) throw httpError(400, "Số tiền vượt quá phần còn lại của hóa đơn.");
  const method = payload.method === "transfer" ? "transfer" : "cash";
  const payment = await paymentRepository.create({
    invoice_id: invoice.id,
    amount,
    method,
    note: payload.note,
    confirmed_by: actorId,
    paid_at: payload.paid_at || nowSql(),
  });
  const paid = Number(invoice.paid_amount) + amount;
  const status = invoiceStatus(Number(invoice.total), paid, invoice.due_date);
  const updated = await invoiceRepository.updateAmounts(invoice.id, paid, status);
  const tenant = await tenantRepository.findById(invoice.tenant_id);
  if (tenant?.user_id) {
    await notifyUser(tenant.user_id, {
      title: "Xác nhận thanh toán",
      message: `Đã ghi nhận ${amount.toLocaleString("vi-VN")}đ cho hóa đơn ${invoice.code}.`,
      type: "payment",
      link: "/portal/invoices",
    });
  }
  await logActivity({ userId: actorId, action: "create", entity: "payments", entityId: payment.id, detail: invoice.code });
  return { payment, invoice: updated };
}

function paymentQr(invoiceId) {
  return invoiceRepository.findById(invoiceId).then((invoice) => {
    if (!invoice) throw httpError(404, "Không tìm thấy hóa đơn.");
    return {
      qr_url: qrUrl(invoice),
      bank_code: process.env.BANK_CODE,
      bank_account: process.env.BANK_ACCOUNT,
      account_name: process.env.BANK_ACCOUNT_NAME,
      remain: Math.max(0, Number(invoice.total) - Number(invoice.paid_amount)),
      invoice_code: invoice.code,
    };
  });
}

module.exports = { listPayments, createPayment, paymentQr };
