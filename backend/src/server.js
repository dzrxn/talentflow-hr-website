import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import googleSheetRoutes from "./routes/googleSheetRoutes.js";
import hospitalityRoutes from "./routes/hospitalityRoutes.js";

dotenv.config();

/* =========================
   DEFAULT GOOGLE SHEET ENV
========================= */

process.env.SUBMISSION_SHEET_ID =
  process.env.SUBMISSION_SHEET_ID ||
  "1r7NF_hJjSnSkscCmKq1U8-H1yvJ_9NWkrQQ1i6ouNGI";

process.env.SUBMISSIONS_SHEET_ID =
  process.env.SUBMISSIONS_SHEET_ID ||
  "1r7NF_hJjSnSkscCmKq1U8-H1yvJ_9NWkrQQ1i6ouNGI";

process.env.SUBMISSION_RANGE =
  process.env.SUBMISSION_RANGE || "Sheet1!A:Z";

process.env.SUBMISSIONS_RANGE =
  process.env.SUBMISSIONS_RANGE || "Sheet1!A:Z";

process.env.INTERNSHIP_SHEET_ID =
  process.env.INTERNSHIP_SHEET_ID ||
  "1iiMDOwAj5E0Y6B2TufOBk8y6SPps6s9Dq9nVJt-RLl0";

process.env.INTERNSHIP_RANGE =
  process.env.INTERNSHIP_RANGE || "Sheet1!A:Z";

process.env.OFFER_SHEET_ID =
  process.env.OFFER_SHEET_ID ||
  "1-1oh2ZwP5qbt86JX54pM-O769NRwjGoWFV-fxE0gHHU";

process.env.OFFERS_SHEET_ID =
  process.env.OFFERS_SHEET_ID ||
  "1-1oh2ZwP5qbt86JX54pM-O769NRwjGoWFV-fxE0gHHU";

process.env.OFFER_RANGE =
  process.env.OFFER_RANGE || "Sheet5!A:Z";

process.env.OFFERS_RANGE =
  process.env.OFFERS_RANGE || "Sheet5!A:Z";

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* =========================
   SAFE ROUTE MOUNTER
========================= */

function mountRoute(path, route) {
  if (!route) {
    console.error(`❌ Route missing: ${path}`);
    return;
  }

  app.use(path, route);
  console.log(`✅ Mounted route: ${path}`);
}

/* =========================
   BASIC ROUTES
========================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TalentFlow backend is running",
    port: PORT,
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working fine",
    port: PORT,
  });
});

/* =========================
   ENV CHECK
========================= */

app.get("/api/env-check", (req, res) => {
  res.json({
    success: true,

    PORT: process.env.PORT || "5000",

    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID ? "SET" : "MISSING",
    GOOGLE_SHEET_RANGE: process.env.GOOGLE_SHEET_RANGE || "MISSING",

    GOOGLE_SERVICE_ACCOUNT_JSON: process.env.GOOGLE_SERVICE_ACCOUNT_JSON
      ? "SET"
      : "MISSING",

    GOOGLE_SERVICE_ACCOUNT_BASE64: process.env.GOOGLE_SERVICE_ACCOUNT_BASE64
      ? "SET"
      : "MISSING",

    GOOGLE_SERVICE_ACCOUNT_FILE: process.env.GOOGLE_SERVICE_ACCOUNT_FILE
      ? "SET"
      : "MISSING",

    SUBMISSION_SHEET_ID: process.env.SUBMISSION_SHEET_ID ? "SET" : "MISSING",
    SUBMISSIONS_SHEET_ID: process.env.SUBMISSIONS_SHEET_ID ? "SET" : "MISSING",
    SUBMISSION_RANGE: process.env.SUBMISSION_RANGE || "MISSING",
    SUBMISSIONS_RANGE: process.env.SUBMISSIONS_RANGE || "MISSING",

    INTERNSHIP_SHEET_ID: process.env.INTERNSHIP_SHEET_ID ? "SET" : "MISSING",
    INTERNSHIP_RANGE: process.env.INTERNSHIP_RANGE || "MISSING",

    OFFER_SHEET_ID: process.env.OFFER_SHEET_ID ? "SET" : "MISSING",
    OFFERS_SHEET_ID: process.env.OFFERS_SHEET_ID ? "SET" : "MISSING",
    OFFER_RANGE: process.env.OFFER_RANGE || "MISSING",
    OFFERS_RANGE: process.env.OFFERS_RANGE || "MISSING",

    HOSPITALITY_SHEET_ID: process.env.HOSPITALITY_SHEET_ID ? "SET" : "MISSING",
    HOSPITALITY_SHEET_RANGE:
      process.env.HOSPITALITY_SHEET_RANGE || "MISSING",
  });
});

/* =========================
   MAIN ROUTES
========================= */

mountRoute("/api/auth", authRoutes);
mountRoute("/api/users", userRoutes);
mountRoute("/api/dashboard", dashboardRoutes);
mountRoute("/api/reports", reportRoutes);

mountRoute("/api/sheets", googleSheetRoutes);
mountRoute("/api/hospitality", hospitalityRoutes);

/* =========================
   TEST ROUTES
========================= */

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Test route working successfully",
  });
});

app.get("/api/test-sheets", (req, res) => {
  res.json({
    success: true,
    message: "Google Sheets test route working successfully",
    testUrls: {
      sheetsRoot: "/api/sheets",
      tabs: "/api/sheets/tabs",

      dashboard: "/api/sheets/dashboard",

      submissions: "/api/sheets/submissions",
      reports: "/api/sheets/reports",

      internship: "/api/sheets/internship",
      internships: "/api/sheets/internships",

      offers: "/api/sheets/offers",

      allData: "/api/sheets/all-data",

      hospitalityDashboard: "/api/hospitality/dashboard",
      hospitalityReports: "/api/hospitality/reports",
    },
  });
});

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

/* =========================
   ERROR HANDLER
========================= */

app.use((error, req, res, next) => {
  console.error("SERVER ERROR:", error);

  res.status(500).json({
    success: false,
    error: error.message || "Internal server error",
  });
});

/* =========================
   SERVER START
========================= */

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Health: http://localhost:${PORT}/api/health`);
  console.log(`✅ Env Check: http://localhost:${PORT}/api/env-check`);
  console.log(`✅ Sheets: http://localhost:${PORT}/api/sheets`);
  console.log(`✅ Submissions: http://localhost:${PORT}/api/sheets/submissions`);
  console.log(`✅ Internship: http://localhost:${PORT}/api/sheets/internship`);
  console.log(`✅ Internships: http://localhost:${PORT}/api/sheets/internships`);
  console.log(`✅ Offers: http://localhost:${PORT}/api/sheets/offers`);
});