const nodemailer = require("nodemailer");
const notificationRepository = require("../repositories/notificationRepository");

let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendEmail({ to, subject, text }) {
  if (!to) return { sent: false, reason: "missing_to" };
  if (!transporter) {
    console.log(`[EMAIL MOCK] to=${to} | ${subject} | ${text}`);
    return { sent: false, mock: true };
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "RentHub <no-reply@renthub.local>",
    to,
    subject,
    text,
  });
  return { sent: true };
}

async function sendSms({ to, text }) {
  console.log(`[SMS MOCK] to=${to} | ${text}`);
  return { sent: false, mock: true, provider: process.env.SMS_PROVIDER || "mock" };
}

async function notifyUser(userId, { title, message, type, link, email, phone }) {
  await notificationRepository.create({ userId, title, message, type, link });
  if (email) await sendEmail({ to: email, subject: title, text: message });
  if (phone) await sendSms({ to: phone, text: `${title}: ${message}` });
}

async function notifyStaff(payload) {
  const ids = await notificationRepository.staffUserIds();
  await Promise.all(ids.map((id) => notificationRepository.create({ userId: id, ...payload })));
}

module.exports = { sendEmail, sendSms, notifyUser, notifyStaff };
