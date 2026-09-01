const path = require("path");
const fs = require("fs");
const multer = require("multer");

const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".doc", ".docx"].includes(ext) ? ext : "";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

function fileFilter(_req, file, cb) {
  const allowed = /jpeg|jpg|png|webp|pdf|msword|officedocument/;
  if (allowed.test(file.mimetype) || allowed.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error("Định dạng tệp không được hỗ trợ."));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
});

function fileUrl(filename) {
  if (!filename) return null;
  if (String(filename).startsWith("http")) return filename;
  return `/uploads/${filename}`;
}

module.exports = { upload, uploadDir, fileUrl };
