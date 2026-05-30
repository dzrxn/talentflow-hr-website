import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";

const RAW_API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://talentflow-backend-ohup.onrender.com";

const API_BASE = RAW_API_BASE
  .replace(/\/$/, "")
  .replace(/\/api\/sheets$/i, "")
  .replace(/\/api$/i, "");

const COLUMNS = ["Total", "Joined"];

export default function InternshipData() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const cleanText = (value) => String(value || "").trim();

  const normalizeText = (value) =>
    cleanText(value).toLowerCase().replace(/\s+/g, " ");

  const getValueByKey = (item, key) => {
    const matchedKey = Object.keys(item || {}).find(
      (k) => normalizeText(k) === normalizeText(key)
    );

    return matchedKey ? item[matchedKey] : "";
  };

  const getNumber = (value) => {
    const num = Number(String(value || "0").replace(/,/g, ""));
    return Number.isNaN(num) ? 0 : num;
  };

  const parseDate = (value) => {
    if (!value) return null;

    const text = String(value).trim();

    if (text.includes("/")) {
      const parts = text.split("/");
      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
        if (!Number.isNaN(parsed.getTime())) return parsed;
      }
    }

    if (text.includes("-")) {
      const parts = text.split("-");
      if (parts.length === 3) {
        const [yyyy, mm, dd] = parts;
        const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
        if (!Number.isNaN(parsed.getTime())) return parsed;
      }
    }

    const directDate = new Date(value);
    if (!Number.isNaN(directDate.getTime())) return directDate;

    return null;
  };

  const getDateOnlyTime = (date) => {
    if (!date) return null;

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();
  };

  const getDateValue = (item) =>
    getValueByKey(item, "Date") ||
    getValueByKey(item, "Internship Date") ||
    getValueByKey(item, "Joining Date") ||
    getValueByKey(item, "Created Date") ||
    getValueByKey(item, "Month");

  const getDate = (item) => parseDate(getDateValue(item));

  const isDateInRange = (itemDate) => {
    if (!fromDate && !toDate) return true;
    if (!itemDate) return false;

    const rowTime = getDateOnlyTime(itemDate);
    const fromTime = fromDate ? getDateOnlyTime(parseDate(fromDate)) : null;
    const toTime = toDate ? getDateOnlyTime(parseDate(toDate)) : null;

    if (fromTime && rowTime < fromTime) return false;
    if (toTime && rowTime > toTime) return false;

    return true;
  };

  const loadInternshipData = async () => {
    try {
      setLoading(true);
      setApiError("");

      const res = await fetch(`${API_BASE}/api/sheets/internships`, {
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
        throw new Error(`Invalid JSON response from backend (${res.status})`);
      }

      if (!res.ok || result.success === false) {
        throw new Error(
          result.error ||
          result.message ||
          `Backend request failed (${res.status})`
        );
      }

      const data = Array.isArray(result.data) ? result.data : [];

      const validRows = data.filter((item) => {
        const hasAnyValue = Object.values(item || {}).some((value) =>
          cleanText(value)
        );

        const monthValue = getValueByKey(item, "Month");

        return hasAnyValue && normalizeText(monthValue) !== "total";
      });

      setRows(validRows);
    } catch (error) {
      console.error("INTERNSHIP DATA ERROR:", error);
      setApiError(error.message || "Unable to load internship data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInternshipData();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((item) => isDateInRange(getDate(item)));
  }, [rows, fromDate, toDate]);

  const summary = useMemo(() => {
    const result = {
      Total: 0,
      Joined: 0,
    };

    filteredRows.forEach((item) => {
      result.Total += getNumber(getValueByKey(item, "Total"));
      result.Joined += getNumber(getValueByKey(item, "Joined"));
    });

    return result;
  }, [filteredRows]);

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
  };

  return (
    <>
      <h1 className="page-title">NB Internship Data</h1>

      <p className="page-subtitle">
        Internship dashboard with total and joined candidates.
      </p>

      {apiError && (
        <div style={styles.errorBox}>
          <strong>Backend Error:</strong> {apiError}
          <br />
          <small>Check backend route: {API_BASE}/api/sheets/internships</small>
        </div>
      )}

      <div style={styles.filterBar}>
        <div style={styles.dateGroup}>
          <label style={styles.label}>From Date</label>
          <input
            style={styles.input}
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div style={styles.dateGroup}>
          <label style={styles.label}>To Date</label>
          <input
            style={styles.input}
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <button style={styles.refreshBtn} onClick={loadInternshipData}>
          Refresh
        </button>

        <button style={styles.clearBtn} onClick={clearFilters}>
          Clear
        </button>
      </div>

      {loading ? (
        <p>Loading internship data...</p>
      ) : (
        <>
          <div className="cards-grid">
            <StatCard
              label="Total"
              value={summary.Total}
              change="Filtered total"
              colorClass="c1"
            />

            <StatCard
              label="Joined"
              value={summary.Joined}
              change="Filtered joined"
              colorClass="c2"
            />
          </div>

          <div style={styles.reportCard}>
            <h3 style={styles.reportTitle}>NB Internship Report</h3>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date / Month</th>

                    {COLUMNS.map((col) => (
                      <th key={col} style={styles.th}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map((row, index) => (
                    <tr key={`${index}`}>
                      <td style={styles.td}>{getDateValue(row) || "-"}</td>

                      {COLUMNS.map((col) => (
                        <td key={col} style={styles.td}>
                          {getNumber(getValueByKey(row, col))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr>
                    <td style={styles.totalTd}>Total</td>
                    <td style={styles.totalTd}>{summary.Total}</td>
                    <td style={styles.totalTd}>{summary.Joined}</td>
                  </tr>
                </tfoot>
              </table>

              {!filteredRows.length && (
                <p style={styles.emptyText}>No internship report data found.</p>
              )}
            </div>
          </div>
        </>
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
    lineHeight: "1.6",
  },

  filterBar: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-end",
    flexWrap: "wrap",
    margin: "18px 0 24px",
    padding: "14px",
    background: "#ffffff",
    borderRadius: "18px",
    boxShadow: "0 4px 16px rgba(34,197,94,0.08)",
    border: "1px solid #bbf7d0",
  },

  dateGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  label: {
    fontSize: "12px",
    fontWeight: "800",
    color: "#14532d",
  },

  input: {
    height: "42px",
    minWidth: "180px",
    padding: "0 12px",
    borderRadius: "12px",
    border: "1px solid #bbf7d0",
    background: "#f9fafb",
    color: "#111827",
    fontSize: "14px",
    fontWeight: "700",
    outline: "none",
  },

  refreshBtn: {
    height: "42px",
    padding: "0 20px",
    border: "none",
    borderRadius: "12px",
    background: "#16a34a",
    color: "#ffffff",
    fontSize: "14px",
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
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
  },

  reportCard: {
    marginTop: "26px",
    background: "#ffffff",
    borderRadius: "22px",
    padding: "20px",
    border: "1px solid #bbf7d0",
    boxShadow: "0 4px 18px rgba(34,197,94,0.10)",
  },

  reportTitle: {
    margin: "0 0 16px",
    fontSize: "20px",
    fontWeight: "900",
    color: "#14532d",
  },

  tableWrap: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "500px",
  },

  th: {
    background: "#dcfce7",
    color: "#14532d",
    padding: "13px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "900",
    borderBottom: "1px solid #bbf7d0",
  },

  td: {
    padding: "12px 13px",
    borderBottom: "1px solid #e5e7eb",
    color: "#111827",
    fontSize: "14px",
    fontWeight: "600",
  },

  totalTd: {
    padding: "13px",
    background: "#f0fdf4",
    color: "#14532d",
    fontSize: "14px",
    fontWeight: "900",
    borderTop: "2px solid #86efac",
  },

  emptyText: {
    marginTop: "16px",
    color: "#6b7280",
    fontWeight: "700",
  },
};