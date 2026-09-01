const contractRepository = require("../repositories/contractRepository");
const invoiceRepository = require("../repositories/invoiceRepository");
const tenantRepository = require("../repositories/tenantRepository");
const { notifyUser, notifyStaff } = require("../services/notifyService");

function reminderDays() {
  return String(process.env.REMINDER_DAYS || "1,3,5")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter(Boolean);
}

function daysUntil(dateValue) {
  const target = new Date(dateValue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

async function runReminders() {
  await invoiceRepository.markOverdue();
  const days = reminderDays();
  const invoices = (await invoiceRepository.findAll({ limit: 200, offset: 0 })).rows;
  const contracts = (await contractRepository.findAll({ limit: 200, offset: 0 })).rows;

  for (const invoice of invoices) {
    const remain = daysUntil(invoice.due_date);
    const tenant = await tenantRepository.findById(invoice.tenant_id);
    if (invoice.status === "overdue") {
      await notifyStaff({
        title: "Hóa đơn quá hạn",
        message: `${invoice.code} của ${invoice.tenant_name} đã quá hạn.`,
        type: "invoice_overdue",
        link: "/dashboard/invoices",
      });
      if (tenant?.user_id) {
        await notifyUser(tenant.user_id, {
          title: "Hóa đơn quá hạn",
          message: `Hóa đơn ${invoice.code} đã quá hạn. Vui lòng thanh toán.`,
          type: "invoice_overdue",
          link: "/portal/invoices",
          email: tenant.email,
          phone: tenant.phone,
        });
      }
    } else if (["unpaid", "partial"].includes(invoice.status) && days.includes(remain)) {
      if (tenant?.user_id) {
        await notifyUser(tenant.user_id, {
          title: "Hóa đơn sắp tới hạn",
          message: `Hóa đơn ${invoice.code} đến hạn trong ${remain} ngày.`,
          type: "invoice_due",
          link: "/portal/invoices",
          email: tenant.email,
          phone: tenant.phone,
        });
      }
    }
  }

  for (const contract of contracts) {
    const remain = daysUntil(contract.end_date);
    if (contract.status === "expired" || remain < 0) {
      await notifyStaff({
        title: "Hợp đồng đã hết hạn",
        message: `${contract.code} đã hết hạn.`,
        type: "contract_expired",
        link: "/dashboard/contracts",
      });
    } else if (remain <= 30 && remain >= 0) {
      await notifyStaff({
        title: "Hợp đồng sắp hết hạn",
        message: `${contract.code} sẽ hết hạn trong ${remain} ngày.`,
        type: "contract_expiring",
        link: "/dashboard/contracts",
      });
    }
  }
  console.log("[reminder] Đã quét nhắc hạn hóa đơn/hợp đồng.");
}

function startReminderJob() {
  setInterval(() => {
    runReminders().catch((error) => console.error("[reminder]", error.message));
  }, 6 * 60 * 60 * 1000);
}

module.exports = { startReminderJob, runReminders };
