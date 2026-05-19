import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";

const RAW_API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://talentflow-hr-website-1jga.onrender.com";

const API_BASE = RAW_API_BASE
  .replace(/\/$/, "")
  .replace(/\/api\/sheets$/i, "")
  .replace(/\/api$/i, "");

const STATUS_OPTIONS = [
  "Screen Selected",
  "Screen Rejected",
  "Duplicate Submission",
  "No Show",
  "Rejected By Panel",
  "Offer Accepted",
  "Offer Declined",
  "Joined",
  "Future Reference",
];

const ACTIVE_VENDOR_OPTIONS = [
  "Sira Consulting India Pvt Ltd",
  "Talent Corner Hr Services Private Limited",
  "Adecco India Private Limited",
  "On Time FS Private Limited",
];

const INACTIVE_VENDOR_OPTIONS = [
  "Talent Infinity",
  "Formore Talent",
  "Cernobia",
  "R2R Consultants LLP",
];

const TALENT_ACQUISITION_OPTIONS = [
  "Maniram - Talent Acquisition",
  "Praveen - Talent Acquisition",
  "Internal Referrals",
  "Careers and Linkedin",
];

const FUNCTION_OPTIONS = [
  "Presales",
  "Sales",
  "Legal",
  "Finance & Accounts",
  "Audit",
  "Administration",
  "Execution",
  "QA/QC",
  "MEP",
  "Planning",
  "QS Department",
  "Sales & Marketing",
  "Store Execution",
  "Interiors & Finishing",
  "Projects",
  "CRM",
  "IT",
  "HSE",
  "Operations",
  "Marketing",
  "Design",
  "Purchase",
  "HR",
  "Payroll",
  "Housekeeping",
];

export default function SubmissionData() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedActiveVendor, setSelectedActiveVendor] = useState("All");
  const [selectedInactiveVendor, setSelectedInactiveVendor] = useState("All");
  const [selectedTalentTeam, setSelectedTalentTeam] = useState("All");
  const [selectedFunction, setSelectedFunction] = useState("All");

  const cleanText = (value) => String(value || "").trim();

  const normalizeText = (value) =>
    cleanText(value).toLowerCase().replace(/\s+/g, " ");

  const getValueByPossibleKeys = (item, keys) => {
    for (const key of keys) {
      const matchedKey = Object.keys(item || {}).find(
        (k) => normalizeText(k) === normalizeText(key)
      );

      if (matchedKey) return item[matchedKey];
    }

    return "";
  };

  const getSubmittedBy = (item) =>
    cleanText(
      getValueByPossibleKeys(item, [
        "Submitted By",
        "SubmittedBy",
        "Vendor",
        "Source",
        "Consultant",
        "TA",
        "Recruiter",
      ])
    );

  const getFunction = (item) =>
    cleanText(
      getValueByPossibleKeys(item, [
        "Function",
        "Functions",
        "Department",
        "Dept",
      ])
    );

  const normalizeStatus = (value) => {
    const text = normalizeText(value);

    if (!text) return "";

    if (
      text.includes("screen selected") ||
      text.includes("selected in screening") ||
      text === "selected"
    )
      return "Screen Selected";

    if (text.includes("screen") && text.includes("reject"))
      return "Screen Rejected";

    if (text.includes("duplicate")) return "Duplicate Submission";

    if (text.includes("no show")) return "No Show";

    if (
      text.includes("rejected by panel") ||
      (text.includes("panel") && text.includes("reject")) ||
      text.includes("rejected in interview")
    )
      return "Rejected By Panel";

    if (text.includes("offer") && text.includes("accept"))
      return "Offer Accepted";

    if (text.includes("offer") && text.includes("declin"))
      return "Offer Declined";

    if (text.includes("joined")) return "Joined";

    if (
      text.includes("future reference") ||
      text.includes("future") ||
      text.includes("hold")
    )
      return "Future Reference";

    return cleanText(value);
  };

  const getStatus = (item) =>
    normalizeStatus(
      getValueByPossibleKeys(item, [
        "Status",
        "Candidate Status",
        "Submission Status",
      ])
    );

  const parseDate = (value) => {
    if (!value) return null;

    const directDate = new Date(value);
    if (!Number.isNaN(directDate.getTime())) return directDate;

    const text = String(value).trim();

    if (text.includes("/")) {
      const [dd, mm, yyyy] = text.split("/");
      const parsed = new Date(`${yyyy}-${mm}-${dd}`);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }

    return null;
  };

  const formatDateKey = (date) => {
    if (!date) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getDateValue = (item) =>
    getValueByPossibleKeys(item, [
      "Date of Submission",
      "Submission Date",
      "Submitted Date",
      "Date",
    ]);

  const getDate = (item) => parseDate(getDateValue(item));

  const isMatched = (actual, selected) =>
    selected === "All" || normalizeText(actual) === normalizeText(selected);

  const loadData = async () => {
    try {
      setLoading(true);
      setApiError("");

      const res = await fetch(`${API_BASE}/api/sheets/reports`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const text = await res.text();

      let result = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Invalid JSON response (${res.status})`);
      }

      if (!res.ok || result.success === false) {
        throw new Error(
          result.error ||
            result.message ||
            `Backend request failed (${res.status})`
        );
      }

      const data = Array.isArray(result.data) ? result.data : [];

      const validRows = data.filter((item) =>
        Object.values(item || {}).some((value) => cleanText(value))
      );

      setRows(validRows);
    } catch (error) {
      console.error("SUBMISSION DATA ERROR:", error);
      setApiError(error.message || "Unable to load submission data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((item) => {
      const submittedBy = getSubmittedBy(item);
      const functionName = getFunction(item);

      const itemDate = getDate(item);
      const itemDateKey = formatDateKey(itemDate);

      const dateMatch = !selectedDate || itemDateKey === selectedDate;

      const activeVendorMatch = isMatched(
        submittedBy,
        selectedActiveVendor
      );

      const inactiveVendorMatch = isMatched(
        submittedBy,
        selectedInactiveVendor
      );

      const talentTeamMatch = isMatched(submittedBy, selectedTalentTeam);

      const functionMatch = isMatched(functionName, selectedFunction);

      return (
        dateMatch &&
        activeVendorMatch &&
        inactiveVendorMatch &&
        talentTeamMatch &&
        functionMatch
      );
    });
  }, [
    rows,
    selectedDate,
    selectedActiveVendor,
    selectedInactiveVendor,
    selectedTalentTeam,
    selectedFunction,
  ]);

  const statusCounts = useMemo(() => {
    const counts = {};

    STATUS_OPTIONS.forEach((status) => {
      counts[status] = 0;
    });

    filteredRows.forEach((item) => {
      const status = getStatus(item);

      if (counts[status] !== undefined) {
        counts[status] += 1;
      }
    });

    return counts;
  }, [filteredRows]);

  const clearFilters = () => {
    setSelectedDate("");
    setSelectedActiveVendor("All");
    setSelectedInactiveVendor("All");
    setSelectedTalentTeam("All");
    setSelectedFunction("All");
  };

  return (
    <>
      <h1 className="page-title">NB Submission Data</h1>

      <p className="page-subtitle">
        Submission dashboard with separate vendor, Talent Acquisition, function
        and status filters.
      </p>

      {apiError && (
        <div style={styles.errorBox}>
          <strong>Backend Error:</strong> {apiError}
        </div>
      )}

      <div style={styles.filterBar}>
        <input
          style={styles.input}
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <select
          style={styles.select}
          value={selectedActiveVendor}
          onChange={(e) => {
            setSelectedActiveVendor(e.target.value);
            setSelectedInactiveVendor("All");
            setSelectedTalentTeam("All");
          }}
        >
          <option value="All">Active Vendors</option>
          {ACTIVE_VENDOR_OPTIONS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <select
          style={styles.select}
          value={selectedInactiveVendor}
          onChange={(e) => {
            setSelectedInactiveVendor(e.target.value);
            setSelectedActiveVendor("All");
            setSelectedTalentTeam("All");
          }}
        >
          <option value="All">Inactive Vendors</option>
          {INACTIVE_VENDOR_OPTIONS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <select
          style={styles.select}
          value={selectedTalentTeam}
          onChange={(e) => {
            setSelectedTalentTeam(e.target.value);
            setSelectedActiveVendor("All");
            setSelectedInactiveVendor("All");
          }}
        >
          <option value="All">Talent Acquisition Team</option>
          {TALENT_ACQUISITION_OPTIONS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <select
          style={styles.select}
          value={selectedFunction}
          onChange={(e) => setSelectedFunction(e.target.value)}
        >
          <option value="All">All Functions</option>
          {FUNCTION_OPTIONS.map((fn) => (
            <option key={fn} value={fn}>
              {fn}
            </option>
          ))}
        </select>

        <button style={styles.refreshBtn} onClick={loadData}>
          Refresh
        </button>

        <button style={styles.clearBtn} onClick={clearFilters}>
          Clear
        </button>
      </div>

      {loading ? (
        <p>Loading submission data...</p>
      ) : (
        <div className="cards-grid">
          <StatCard
            label="Total Submissions"
            value={filteredRows.length}
            change="Filtered submissions"
            colorClass="c1"
          />

          {STATUS_OPTIONS.map((status, index) => (
            <StatCard
              key={status}
              label={status}
              value={statusCounts[status] || 0}
              change="Status count"
              colorClass={`c${(index % 8) + 2}`}
            />
          ))}
        </div>
      )}
    </>
  );
}

const styles = {
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    padding: "14px 16px",
    borderRadius: "14px",
    margin: "18px 0",
    fontWeight: "700",
  },

  filterBar: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    margin: "18px 0 24px",
    padding: "14px",
    background: "#ffffff",
    borderRadius: "18px",
    border: "1px solid #bbf7d0",
  },

  select: {
    height: "42px",
    minWidth: "260px",
    padding: "0 12px",
    borderRadius: "12px",
    border: "1px solid #bbf7d0",
    background: "#f9fafb",
    fontWeight: "700",
  },

  input: {
    height: "42px",
    minWidth: "180px",
    padding: "0 12px",
    borderRadius: "12px",
    border: "1px solid #bbf7d0",
    background: "#f9fafb",
    fontWeight: "700",
  },

  refreshBtn: {
    height: "42px",
    padding: "0 20px",
    border: "none",
    borderRadius: "12px",
    background: "#16a34a",
    color: "#ffffff",
    fontWeight: "800",
    cursor: "pointer",
  },

  clearBtn: {
    height: "42px",
    padding: "0 20px",
    border: "1px solid #16a34a",
    borderRadius: "12px",
    background: "#ffffff",
    color: "#14532d",
    fontWeight: "800",
    cursor: "pointer",
  },
};