
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

/* =========================================
   CLEAN ENDPOINT
========================================= */

function cleanEndpoint(endpoint = "") {
  let value = String(endpoint || "").trim();

  value = value.replace(API_URL, "");
  value = value.replace("http://localhost:5000", "");
  value = value.replace("https://talentflow-hr-website-m3yb.onrender.com", "");
  value = value.replace("https://talentflow-backend-ohup.onrender.com", "");

  value = value.replace(/\/api\/sheets\/\/api\/sheets/g, "/api/sheets");
  value = value.replace(/\/api\/sheets\/http:\/\/localhost:5000/g, "");
  value = value.replace(/\/api\/sheets\/https:\/\/[^/]+/g, "");

  if (!value.startsWith("/")) {
    value = `/${value}`;
  }

  return value;
}

/* =========================================
   COMMON FETCH HANDLER
========================================= */

async function fetchAPI(endpoint) {
  const cleanPath = cleanEndpoint(endpoint);


  const res = await fetch(
    "https://talentflow-backend-ohup.onrender.com/api/sheets/dashboard"
  );

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://talentflow-hr-website-m3yb.onrender.com";



  try {
    const response = await fetch(`${API_URL}${cleanPath}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const text = await response.text();

    let result = {};

    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(
        `Invalid JSON response from backend (${response.status})`
      );
    }

    if (!response.ok) {
      throw new Error(
        result.error ||
        result.message ||
        `Backend request failed (${response.status})`
      );
    }

    return {
      success: result.success !== false,
      data: Array.isArray(result.data) ? result.data : [],
      total: result.total || result.count || 0,
      sheetName: result.sheetName || "",
      type: result.type || "",
      raw: result,
    };
  } catch (error) {
    console.error(`API ERROR [${cleanPath}]`, error);

    return {
      success: false,
      error: error.message,
      data: [],
      total: 0,
      sheetName: "",
      type: "",
      raw: null,
    };
  }
}

/* =========================================
   DASHBOARD
========================================= */

export async function getDashboardData() {
  return fetchAPI("/api/sheets/dashboard");
}

/* =========================================
   REPORTS / SUBMISSIONS
========================================= */

export async function getReportsData() {
  return fetchAPI("/api/sheets/reports");
}

export async function getSubmissionsData() {
  return fetchAPI("/api/sheets/submissions");
}

/* =========================================
   INTERNSHIP
========================================= */

export async function getInternshipsData() {
  return fetchAPI("/api/sheets/internship");
}

export async function getInternshipData() {
  return fetchAPI("/api/sheets/internship");
}

/* =========================================
   OFFERS
========================================= */

export async function getOffersData() {
  return fetchAPI("/api/sheets/offers");
}

/* =========================================
   ALL DATA
========================================= */

export async function getAllSheetsData() {
  return fetchAPI("/api/sheets/all-data");
}

/* =========================================
   HOSPITALITY
========================================= */

export async function getHospitalityDashboard() {
  return fetchAPI("/api/hospitality/dashboard");
}

export async function getHospitalityReports() {
  return fetchAPI("/api/hospitality/reports");
}

/* =========================================
   TEST / HEALTH
========================================= */

export async function getHealthCheck() {
  return fetchAPI("/api/health");
}

export async function getEnvCheck() {
  return fetchAPI("/api/env-check");
}

export { API_URL, fetchAPI };