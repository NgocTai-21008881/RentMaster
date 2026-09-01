require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { testConnection } = require("./config/db");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const { startReminderJob } = require("./jobs/reminderJob");

const app = express();
const port = Number(process.env.PORT) || 5000;
const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads");

const corsOrigin = process.env.CORS_ORIGIN;
const allowAnyOrigin =
  process.env.NODE_ENV !== "production" || !corsOrigin || corsOrigin === "*" || corsOrigin === "true";
app.use(
  cors({
    origin: allowAnyOrigin
      ? true
      : corsOrigin.split(",").map((item) => item.trim()).filter(Boolean),
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(uploadDir));

app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    await testConnection();
    app.listen(port, () => {
      console.log(`Backend đang chạy tại http://localhost:${port}`);
      startReminderJob();
    });
  } catch (error) {
    console.error("Không kết nối được MySQL. Kiểm tra file .env và chạy npm run seed.");
    console.error(error.message);
    process.exit(1);
  }
}

start();
