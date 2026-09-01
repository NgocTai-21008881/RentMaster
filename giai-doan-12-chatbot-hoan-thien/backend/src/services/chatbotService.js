const roomRepository = require("../repositories/roomRepository");
const invoiceRepository = require("../repositories/invoiceRepository");
const contractRepository = require("../repositories/contractRepository");
const tenantRepository = require("../repositories/tenantRepository");
const chatRepository = require("../repositories/chatRepository");
const { monthKey } = require("../utils/helpers");

function money(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

async function tenantContext(user) {
  if (user.role !== "tenant") return null;
  const tenant = await tenantRepository.findByUserId(user.id);
  if (!tenant) return null;
  const invoices = await invoiceRepository.findAll({ tenant_id: tenant.id, limit: 20, offset: 0 });
  const contracts = await contractRepository.findAll({ tenant_id: tenant.id, limit: 10, offset: 0 });
  return { tenant, invoices: invoices.rows, contracts: contracts.rows };
}

function answerFromData(question, { user, vacant, invoices, contracts, tenant }) {
  const text = question.toLowerCase();
  if (text.includes("trống") || text.includes("trong") || text.includes("vacant")) {
    if (!vacant.length) return "Hiện không còn phòng trống.";
    return `Hiện có ${vacant.length} phòng trống: ${vacant
      .slice(0, 8)
      .map((room) => `${room.code} (${room.property_name}) ${money(room.rent_price)}/tháng`)
      .join("; ")}.`;
  }
  if (text.includes("giá") || text.includes("gia thue") || text.includes("thuê")) {
    if (tenant?.room_id) {
      const contract = contracts[0];
      if (contract) return `Giá thuê phòng ${contract.room_code} của bạn là ${money(contract.rent_amount)}/tháng.`;
    }
    return vacant.length
      ? `Một số mức giá phòng trống: ${vacant.slice(0, 5).map((room) => `${room.code} ${money(room.rent_price)}`).join(", ")}.`
      : "Chưa có bảng giá phòng trống.";
  }
  if (text.includes("hóa đơn") || text.includes("hoa don") || text.includes("thanh toán") || text.includes("thanh toan")) {
    const mine = user.role === "tenant" ? invoices : invoices;
    const unpaid = mine.filter((row) => ["unpaid", "partial", "overdue"].includes(row.status));
    if (!unpaid.length) return "Không có hóa đơn chưa thanh toán trong phạm vi dữ liệu của bạn.";
    const total = unpaid.reduce((sum, row) => sum + (Number(row.total) - Number(row.paid_amount)), 0);
    return `Bạn đang có ${unpaid.length} hóa đơn chưa hoàn tất, tổng còn lại ${money(total)}. Chi tiết: ${unpaid
      .map((row) => `${row.code} (${row.status}) còn ${money(Number(row.total) - Number(row.paid_amount))}`)
      .join("; ")}.`;
  }
  if (text.includes("hợp đồng") || text.includes("hop dong") || text.includes("hết hạn") || text.includes("het han")) {
    if (!contracts.length) return "Không tìm thấy hợp đồng trong phạm vi tài khoản của bạn.";
    return contracts
      .slice(0, 5)
      .map((row) => `${row.code} phòng ${row.room_code}: ${String(row.start_date).slice(0, 10)} → ${String(row.end_date).slice(0, 10)} [${row.computed_status || row.status}]`)
      .join(". ");
  }
  if (text.includes("sự cố") || text.includes("su co") || text.includes("báo cáo") || text.includes("bao cao") || text.includes("sửa")) {
    return "Để báo sự cố: vào mục Yêu cầu hỗ trợ, chọn loại (điện/nước/internet/điều hòa/thiết bị), mô tả chi tiết và gửi. Chủ nhà sẽ cập nhật trạng thái và phản hồi trên hệ thống.";
  }
  if (text.includes("hướng dẫn") || text.includes("huong dan") || text.includes("dùng")) {
    return "Hệ thống gồm: Bất động sản → Phòng → Người thuê → Hợp đồng → Điện/nước/Dịch vụ → Hóa đơn → Thanh toán → Báo cáo. Người thuê xem phòng, hợp đồng, hóa đơn và gửi yêu cầu hỗ trợ tại cổng Portal.";
  }
  if (text.includes("chính sách") || text.includes("chinh sach")) {
    return "Chính sách thuê: thanh toán đúng hạn theo ngày ghi trên hợp đồng; tiền cọc hoàn lại khi bàn giao nguyên trạng; thông báo trước khi kết thúc hợp đồng; sự cố kỹ thuật gửi qua mục hỗ trợ.";
  }
  return null;
}

async function ask(user, question) {
  const trimmed = (question || "").trim();
  if (!trimmed) {
    const error = new Error("Vui lòng nhập câu hỏi.");
    error.status = 400;
    throw error;
  }

  const session = await chatRepository.getOrCreateSession(user.id);
  await chatRepository.addMessage(session.id, "user", trimmed);

  const ctx = await tenantContext(user);
  const vacant = await roomRepository.vacantRooms();
  const invoices =
    user.role === "tenant"
      ? ctx?.invoices || []
      : (await invoiceRepository.findAll({ limit: 30, offset: 0 })).rows;
  const contracts =
    user.role === "tenant"
      ? ctx?.contracts || []
      : (await contractRepository.findAll({ limit: 20, offset: 0 })).rows;

  const local = answerFromData(trimmed, { user, vacant, invoices, contracts, tenant: ctx?.tenant });
  let reply = local;
  let source = "data";

  if (!reply && process.env.LLM_API_KEY) {
    const facts = [
      user.role === "tenant"
        ? `Người thuê: ${ctx?.tenant?.full_name || user.name}. Phòng hiện tại: ${ctx?.tenant?.room_id || "chưa gán"}.`
        : `Nhân viên ${user.role}. Phòng trống: ${vacant.length}.`,
      `Hóa đơn liên quan: ${invoices
        .slice(0, 8)
        .map((row) => `${row.code} ${row.status} ${row.total}`)
        .join("; ") || "không có"}.`,
      `Hợp đồng: ${contracts
        .slice(0, 5)
        .map((row) => `${row.code} ${row.end_date}`)
        .join("; ") || "không có"}.`,
      "Chỉ trả lời dựa trên dữ liệu trên, không bịa số liệu. Tiếng Việt, ngắn gọn.",
    ].join("\n");
    try {
      const response = await fetch(`${process.env.LLM_BASE_URL || "https://api.openai.com/v1"}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.LLM_API_KEY}` },
        body: JSON.stringify({
          model: process.env.LLM_MODEL || "gpt-4o-mini",
          messages: [
            { role: "system", content: facts },
            { role: "user", content: trimmed },
          ],
          temperature: 0.2,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        reply = data?.choices?.[0]?.message?.content?.trim();
        source = "llm";
      }
    } catch (error) {
      console.error("[LLM]", error.message);
    }
  }

  if (!reply) {
    reply =
      "Tôi có thể hỗ trợ về phòng trống, giá thuê, hóa đơn, hạn thanh toán, hợp đồng và quy trình báo sự cố. Hãy hỏi cụ thể hơn, ví dụ: 'Tôi còn hóa đơn nào chưa thanh toán?'";
    source = "fallback";
  }

  await chatRepository.addMessage(session.id, "assistant", reply);
  return { source, reply, period: monthKey() };
}

module.exports = { ask };
