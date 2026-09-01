const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const contractRepository = require("../repositories/contractRepository");
const invoiceRepository = require("../repositories/invoiceRepository");
const { httpError } = require("../utils/helpers");

const fontDir = path.join(__dirname, "../../assets/fonts");
const fontRegular = path.join(fontDir, "NotoSans-Regular.ttf");
const fontBold = path.join(fontDir, "NotoSans-Bold.ttf");

function resolveFont(preferred, fallbacks) {
  if (fs.existsSync(preferred)) return preferred;
  return fallbacks.find((item) => fs.existsSync(item)) || null;
}

function attachFonts(doc) {
  const regular = resolveFont(fontRegular, [
    "C:\\Windows\\Fonts\\arial.ttf",
    "C:\\Windows\\Fonts\\tahoma.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
  ]);
  const bold = resolveFont(fontBold, [
    "C:\\Windows\\Fonts\\arialbd.ttf",
    "C:\\Windows\\Fonts\\tahomabd.ttf",
    regular,
  ]);
  if (!regular) {
    throw httpError(500, "Thiếu font Unicode để xuất PDF tiếng Việt.");
  }
  doc.registerFont("Sans", regular);
  doc.registerFont("Sans-Bold", bold || regular);
  doc.font("Sans");
  return doc;
}

function bufferFromDoc(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

function money(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

function formatDate(value) {
  if (!value) return "—";
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function formatDateTime(value) {
  if (!value) return "Chưa xác nhận";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return `${formatDate(date)} ${time}`;
}

function line(doc, label, value) {
  doc.font("Sans-Bold").text(`${label}: `, { continued: true });
  doc.font("Sans").text(value == null || value === "" ? "—" : String(value));
}

async function contractPdf(id) {
  const item = await contractRepository.findById(id);
  if (!item) throw httpError(404, "Không tìm thấy hợp đồng.");
  const doc = new PDFDocument({ margin: 50, size: "A4", info: { Title: `Hợp đồng ${item.code}`, Author: "RentHub" } });
  attachFonts(doc);

  doc.font("Sans-Bold").fontSize(11).text("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", { align: "center" });
  doc.font("Sans").fontSize(11).text("Độc lập - Tự do - Hạnh phúc", { align: "center" });
  doc.moveDown(0.2);
  doc.fontSize(10).text("––––––––––––––––––", { align: "center" });
  doc.moveDown(1);
  doc.font("Sans-Bold").fontSize(18).text("HỢP ĐỒNG THUÊ NHÀ", { align: "center" });
  doc.moveDown(0.3);
  doc.font("Sans").fontSize(11).text(`Số: ${item.code}`, { align: "center" });
  doc.moveDown(1.2);

  doc.fontSize(11).text(
    "Hôm nay, các bên thống nhất ký kết hợp đồng thuê nhà với các nội dung sau:",
    { align: "justify" }
  );
  doc.moveDown(0.8);

  doc.font("Sans-Bold").fontSize(12).text("BÊN CHO THUÊ (Bên A)");
  doc.moveDown(0.3);
  doc.fontSize(11);
  line(doc, "Họ tên", "Nguyễn Ngọc Tài / RentHub");
  line(doc, "Đại diện", "Hệ thống quản lý bất động sản cho thuê RentHub");
  doc.moveDown(0.6);

  doc.font("Sans-Bold").fontSize(12).text("BÊN THUÊ (Bên B)");
  doc.moveDown(0.3);
  doc.fontSize(11);
  line(doc, "Họ tên", item.tenant_name);
  line(doc, "Số điện thoại", item.tenant_phone || item.phone);
  line(doc, "Email", item.tenant_email);
  line(doc, "CCCD/CMND", item.id_number);
  doc.moveDown(0.6);

  doc.font("Sans-Bold").fontSize(12).text("ĐIỀU 1. TÀI SẢN THUÊ");
  doc.moveDown(0.3);
  doc.fontSize(11);
  line(doc, "Phòng/căn hộ", `${item.room_code} — ${item.room_name}`);
  line(doc, "Bất động sản", item.property_name);
  line(doc, "Địa chỉ", item.property_address);
  if (item.area) line(doc, "Diện tích", `${item.area} m²`);
  doc.moveDown(0.6);

  doc.font("Sans-Bold").fontSize(12).text("ĐIỀU 2. THỜI HẠN VÀ GIÁ THUÊ");
  doc.moveDown(0.3);
  doc.fontSize(11);
  line(doc, "Thời hạn", `Từ ${formatDate(item.start_date)} đến ${formatDate(item.end_date)}`);
  line(doc, "Tiền thuê", `${money(item.rent_amount)} / tháng`);
  line(doc, "Tiền cọc", money(item.deposit_amount));
  line(doc, "Ngày thanh toán hàng tháng", `Ngày ${item.payment_day}`);
  doc.moveDown(0.6);

  doc.font("Sans-Bold").fontSize(12).text("ĐIỀU 3. ĐIỀU KHOẢN");
  doc.moveDown(0.3);
  doc.font("Sans").fontSize(11).text(
    item.terms ||
      "Bên thuê thanh toán đúng hạn trước ngày quy định hàng tháng. Không cải tạo kết cấu khi chưa được đồng ý. Tiền cọc được hoàn khi bàn giao phòng nguyên trạng.",
    { align: "justify", lineGap: 3 }
  );
  doc.moveDown(0.8);

  doc.font("Sans-Bold").fontSize(12).text("ĐIỀU 4. XÁC NHẬN");
  doc.moveDown(0.3);
  doc.fontSize(11);
  line(doc, "Người thuê xác nhận", formatDateTime(item.tenant_confirmed_at));
  line(doc, "Chủ nhà xác nhận", formatDateTime(item.owner_confirmed_at));
  doc.moveDown(2);

  const signatureY = doc.y;
  doc.font("Sans-Bold").text("BÊN A — CHỦ NHÀ", 70, signatureY, { width: 200, align: "center" });
  doc.text("BÊN B — NGƯỜI THUÊ", 320, signatureY, { width: 200, align: "center" });
  doc.font("Sans").fontSize(9);
  doc.text("(Ký, ghi rõ họ tên)", 70, signatureY + 16, { width: 200, align: "center" });
  doc.text("(Ký, ghi rõ họ tên)", 320, signatureY + 16, { width: 200, align: "center" });

  const buffer = await bufferFromDoc(doc);
  return { filename: `${item.code}.pdf`, buffer };
}

async function invoicePdf(id) {
  const item = await invoiceRepository.findById(id);
  if (!item) throw httpError(404, "Không tìm thấy hóa đơn.");
  const doc = new PDFDocument({ margin: 50, size: "A4", info: { Title: `Hóa đơn ${item.code}`, Author: "RentHub" } });
  attachFonts(doc);

  doc.font("Sans-Bold").fontSize(18).text("HÓA ĐƠN THUÊ PHÒNG", { align: "center" });
  doc.moveDown(0.4);
  doc.font("Sans").fontSize(11).text(`Mã hóa đơn: ${item.code}`, { align: "center" });
  doc.moveDown(1.2);

  line(doc, "Kỳ thanh toán", item.period);
  line(doc, "Người thuê", item.tenant_name);
  line(doc, "Phòng", `${item.room_code} — ${item.property_name || ""}`);
  line(doc, "Hạn thanh toán", formatDate(item.due_date));
  doc.moveDown(0.8);

  doc.font("Sans-Bold").fontSize(12).text("CHI TIẾT");
  doc.moveDown(0.3);
  doc.font("Sans").fontSize(11);
  (item.items || []).forEach((row) => doc.text(`• ${row.name}: ${money(row.amount)}`));
  doc.moveDown(0.8);

  doc.font("Sans-Bold").fontSize(13).text(`Tổng cộng: ${money(item.total)}`);
  doc.font("Sans").fontSize(11);
  doc.text(`Đã thanh toán: ${money(item.paid_amount)}`);
  doc.text(`Còn lại: ${money(Number(item.total) - Number(item.paid_amount))}`);
  doc.text(`Trạng thái: ${item.status}`);

  const buffer = await bufferFromDoc(doc);
  return { filename: `${item.code}.pdf`, buffer };
}

module.exports = { contractPdf, invoicePdf };
