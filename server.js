require("dotenv").config();

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const { readdirSync } = require("fs");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

// ✅ ดึงค่า ALLOWED_ORIGINS จาก .env และแปลงเป็น array
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // อนุญาต Postman/curl
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// middleware
app.use(morgan("dev"));
app.use(bodyParser.json());

const UPLOAD_BASE_PATH = process.env.UPLOAD_BASE_PATH;

// Static Middleware (ถ้าจำเป็น)
app.use("/uploads", express.static(UPLOAD_BASE_PATH));

// File route
app.get("/upload/user/:filename", (req, res) => {
  const filePath = path.join(UPLOAD_BASE_PATH, "user", req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

app.get("/upload/notice/:filename", (req, res) => {
  const filePath = path.join(UPLOAD_BASE_PATH, "notice", req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

app.get("/upload/organize/:filename", (req, res) => {
  const filePath = path.join(UPLOAD_BASE_PATH, "organize", req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

app.get("/upload/activity/:filename", (req, res) => {
  const filePath = path.join(UPLOAD_BASE_PATH, "activity", req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

// Other middleware and routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Step 3 Routing
readdirSync("./routers").map((r) => app.use("/api", require("./routers/" + r)));

// Step 2 Start Server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
