import express from "express";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import process from "process";

const router = express.Router();

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

const CACHE = new Map();

const CACHE_DURATION = 60 * 1000; // 1 minute
/* =========================
   GOOGLE AUTH
========================= */

function getGoogleAuth() {
  const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64?.trim();
  const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  const envFile = process.env.GOOGLE_SERVICE_ACCOUNT_FILE?.trim();

  if (base64) {
    const jsonString = Buffer.from(base64, "base64").toString("utf8");
    const credentials = JSON.parse(jsonString);

    credentials.private_key = credentials.private_key
      .replace(/\\n/g, "\n")
      .replace(/\r/g, "");

    return new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });
  }

  if (rawJson && rawJson.startsWith("{")) {
    const credentials = JSON.parse(rawJson);

    credentials.private_key = credentials.private_key
      .replace(/\\n/g, "\n")
      .replace(/\r/g, "");

    return new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });
  }

  const possibleFiles = [
    envFile,
    "./service-account.json",
    path.join(process.cwd(), "service-account.json"),
    path.join(process.cwd(), "src", "service-account.json"),
    "/etc/secrets/service-account.json",
  ].filter(Boolean);

  for (const filePath of possibleFiles) {
    if (fs.existsSync(filePath)) {
      return new google.auth.GoogleAuth({
        keyFile: filePath,
        scopes: SCOPES,
      });
    }
  }

  throw new Error("Google service account credentials missing");
}

async function getSheetsClient() {
  const auth = getGoogleAuth();
  const client = await auth.getClient();

  return google.sheets({
    version: "v4",
    auth: client,
  });
}

/* =========================
   HELPERS
========================= */

function rowsToJson(rows = []) {
  if (!rows.length) return [];

  const headers = rows[0].map((h) => String(h || "").trim());

  return rows
    .slice(1)
    .filter((row) => row.some((cell) => String(cell || "").trim() !== ""))
    .map((row) => {
      const obj = {};

      headers.forEach((header, index) => {
        if (header) {
          obj[header] = row[index] || "";
        }
      });

      return obj;
    });
}

async function getAvailableTabs({ sheets, spreadsheetId }) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });

  return (
    meta.data.sheets
      ?.map((sheet) => sheet.properties?.title)
      .filter(Boolean) || []
  );
}

function makeRanges(tabs = []) {
  return tabs.flatMap((tab) => [`'${tab}'!A:Z`, `${tab}!A:Z`]);
}

async function readSheet({ spreadsheetId, ranges }) {
  if (!spreadsheetId) {
    throw new Error("Spreadsheet ID is missing in environment variables");
  }

  const cacheKey = `${spreadsheetId}-${ranges.join(",")}`;

  const cached = CACHE.get(cacheKey);

  // Return cached data if valid
  if (
    cached &&
    Date.now() - cached.timestamp < CACHE_DURATION
  ) {
    console.log("Serving from cache:", cacheKey);

    return cached.data;
  }

  const sheets = await getSheetsClient();
  const availableTabs = await getAvailableTabs({
    sheets,
    spreadsheetId,
  });

  let finalRange = "";
  let values = [];

  for (const range of ranges.filter(Boolean)) {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      finalRange = range;
      values = response.data.values || [];
      break;
    } catch {
      // try next range
    }
  }

  if (!finalRange) {
    throw new Error(
      `No matching sheet tab found. Tried: ${ranges
        .filter(Boolean)
        .join(", ")}. Available tabs: ${availableTabs.join(", ")}`
    );
  }

  const data = rowsToJson(values);

  const result = {
    sheetName: finalRange,
    total: data.length,
    data,
  };

  // Save to cache
  CACHE.set(cacheKey, {
    timestamp: Date.now(),
    data: result,
  });

  return result;
}
/* =========================
   ROOT
========================= */

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Google Sheets routes working",
    routes: {
      dashboard: "/api/sheets/dashboard",
      reports: "/api/sheets/reports",
      submissions: "/api/sheets/submissions",
      internship: "/api/sheets/internship",
      internships: "/api/sheets/internships",
      offers: "/api/sheets/offers",
      allData: "/api/sheets/all-data",
      tabs: "/api/sheets/tabs",
      bgv: "/api/sheets/bgv",
    },
  });
});

/* =========================
   TABS
========================= */

router.get("/tabs", async (req, res) => {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheets = await getSheetsClient();
    const tabs = await getAvailableTabs({ sheets, spreadsheetId });

    res.json({
      success: true,
      sheetId: spreadsheetId,
      tabs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      route: "/api/sheets/tabs",
      error: error.message,
    });
  }
});

/* =========================
   DASHBOARD
========================= */

router.get("/dashboard", async (req, res) => {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;

    const result = await readSheet({
      spreadsheetId: sheetId,
      ranges: [
        process.env.NB_DASHBOARD_RANGE,
        process.env.GOOGLE_SHEET_RANGE,
        ...makeRanges(["Dashboard", "NB Dashboard"]),
      ],
    });

    res.json({
      success: true,
      type: "dashboard",
      sheetId,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      route: "/api/sheets/dashboard",
      error: error.message,
    });
  }
});

/* =========================
   SUBMISSION / REPORTS
========================= */

async function submissionHandler(req, res) {
  try {
    const sheetId =
      process.env.SUBMISSIONS_SHEET_ID ||
      process.env.SUBMISSION_SHEET_ID ||
      process.env.GOOGLE_SHEET_ID;

    const result = await readSheet({
      spreadsheetId: sheetId,
      ranges: [
        process.env.SUBMISSIONS_RANGE,
        process.env.SUBMISSION_RANGE,
        process.env.REPORTS_RANGE,
        process.env.REPORT_RANGE,
        ...makeRanges([
          "Submissions Data",
          "Submission Data",
          "Submissions",
          "Submission",
          "Reports",
          "NB Reports",
          "NB Report",
        ]),
      ],
    });

    res.json({
      success: true,
      type: "submissions",
      sheetId,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      route: req.originalUrl,
      error: error.message,
    });
  }
}

router.get("/submissions", submissionHandler);
router.get("/reports", submissionHandler);

/* =========================
   INTERNSHIP
========================= */

async function internshipHandler(req, res) {
  try {
    const sheetId =
      process.env.INTERNSHIP_SHEET_ID || process.env.GOOGLE_SHEET_ID;

    const result = await readSheet({
      spreadsheetId: sheetId,
      ranges: [
        process.env.INTERNSHIP_RANGE,
        ...makeRanges([
          "InternShip Data - Dashboard",
          "Internship Data - Dashboard",
          "Internship Data",
          "InternShip Data",
          "Internship",
          "Internships",
        ]),
      ],
    });

    res.json({
      success: true,
      type: "internship",
      sheetId,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      route: req.originalUrl,
      error: error.message,
    });
  }
}

router.get("/internship", internshipHandler);
router.get("/internships", internshipHandler);

/* =========================
   OFFERS
========================= */

router.get("/offers", async (req, res) => {
  try {
    const sheetId =
      process.env.OFFERS_SHEET_ID ||
      process.env.OFFER_SHEET_ID ||
      process.env.GOOGLE_SHEET_ID;

    const result = await readSheet({
      spreadsheetId: sheetId,
      ranges: [
        process.env.OFFERS_RANGE,
        process.env.OFFER_RANGE,
        ...makeRanges([
          "Offers Data - Dashboard",
          "Offer Data - Dashboard",
          "Offers Data",
          "Offer Data",
          "Offers",
          "Offer",
        ]),
      ],
    });

    res.json({
      success: true,
      type: "offers",
      sheetId,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      route: "/api/sheets/offers",
      error: error.message,
    });
  }
});

router.get("/bgv", async (req, res) => {
  try {
    const sheetId = process.env.BGV_SHEET_ID;

    const result = await readSheet({
      spreadsheetId: sheetId,
      ranges: [
        process.env.BGV_RANGE,
        ...makeRanges([
          "BGV Data",
          "BGV Dashboard",
        ]),
      ],
    });

    res.json({
      success: true,
      type: "bgv",
      sheetId,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      route: "/api/sheets/bgv",
      error: error.message,
    });
  }
});

/* =========================
   ALL DATA
========================= */

router.get("/all-data", async (req, res) => {
  try {
    const submissions = await readSheet({
      spreadsheetId:
        process.env.SUBMISSIONS_SHEET_ID ||
        process.env.SUBMISSION_SHEET_ID ||
        process.env.GOOGLE_SHEET_ID,
      ranges: [
        process.env.SUBMISSIONS_RANGE,
        process.env.SUBMISSION_RANGE,
        ...makeRanges([
          "Submissions Data",
          "Submission Data",
          "Submissions",
          "Submission",
          "Reports",
          "NB Reports",
          "NB Report",
        ]),
      ],
    });

    const internship = await readSheet({
      spreadsheetId:
        process.env.INTERNSHIP_SHEET_ID || process.env.GOOGLE_SHEET_ID,
      ranges: [
        process.env.INTERNSHIP_RANGE,
        ...makeRanges([
          "InternShip Data - Dashboard",
          "Internship Data - Dashboard",
          "Internship Data",
          "InternShip Data",
          "Internship",
          "Internships",
        ]),
      ],
    });

    const offers = await readSheet({
      spreadsheetId:
        process.env.OFFERS_SHEET_ID ||
        process.env.OFFER_SHEET_ID ||
        process.env.GOOGLE_SHEET_ID,
      ranges: [
        process.env.OFFERS_RANGE,
        process.env.OFFER_RANGE,
        ...makeRanges([
          "Offers Data - Dashboard",
          "Offer Data - Dashboard",
          "Offers Data",
          "Offer Data",
          "Offers",
          "Offer",
        ]),
      ],
    });

    res.json({
      success: true,
      counts: {
        submissions: submissions.total,
        internship: internship.total,
        offers: offers.total,
      },
      submissions,
      internship,
      offers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      route: "/api/sheets/all-data",
      error: error.message,
    });
  }
});

export default router;