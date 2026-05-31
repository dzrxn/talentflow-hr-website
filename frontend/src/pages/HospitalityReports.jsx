import { useEffect, useMemo, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://talentflow-backend-ohup.onrender.com";

const ROWS_PER_PAGE = 10;


export default function HospitalityReports() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedFunction, setSelectedFunction] = useState("All Functions");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const loadReports = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/hospitality/dashboard`);
      const result = await res.json();

      setRows(Array.isArray(result.data) ? result.data : []);
      setCurrentPage(1);
    } catch (error) {
      console.log("HOSPITALITY REPORTS ERROR:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const getFunctionName = (item) =>
    String(item["Function"] || item["Department"] || "Unknown").trim();

  const getDateValue = (item) => {
    const value =
      item["Date"] ||
      item["date"] ||
      item["Created Date"] ||
      item["Timestamp"] ||
      item["Time Stamp"] ||
      item["createdAt"];

    if (!value) return null;

    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const getDateOnly = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const functions = useMemo(() => {
    const list = rows.map(getFunctionName).filter(Boolean);
    return ["All Functions", ...new Set(list)];
  }, [rows]);

  const columns = useMemo(() => {
    if (!rows.length) return [];
    return Object.keys(rows[0]);
  }, [rows]);

  const filteredRows = useMemo(() => {
    const now = getDateOnly(new Date());

    return rows.filter((item) => {
      const fn = getFunctionName(item);

      const matchesFunction =
        selectedFunction === "All Functions" || fn === selectedFunction;

      const text = Object.values(item).join(" ").toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());

      let matchesTime = true;

      if (timeFilter !== "All Time") {
        const d = getDateValue(item);
        if (!d) return false;

        const rowDate = getDateOnly(d);

        if (timeFilter === "Custom Range") {
          if (!fromDate || !toDate) {
            matchesTime = true;
          } else {
            const from = getDateOnly(new Date(fromDate));
            const to = getDateOnly(new Date(toDate));
            matchesTime = rowDate >= from && rowDate <= to;
          }
        }

        if (timeFilter === "Today") {
          matchesTime = rowDate.getTime() === now.getTime();
        }

        if (timeFilter === "Last 7 Days") {
          const diffDays = Math.floor((now - rowDate) / (1000 * 60 * 60 * 24));
          matchesTime = diffDays >= 0 && diffDays <= 7;
        }

        if (timeFilter === "Last 30 Days") {
          const diffDays = Math.floor((now - rowDate) / (1000 * 60 * 60 * 24));
          matchesTime = diffDays >= 0 && diffDays <= 30;
        }

        if (timeFilter === "This Year") {
          matchesTime = rowDate.getFullYear() === now.getFullYear();
        }
      }

      return matchesFunction && matchesSearch && matchesTime;
    });
  }, [rows, selectedFunction, search, timeFilter, fromDate, toDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedFunction, timeFilter, fromDate, toDate]);

  const totalPages = Math.ceil(filteredRows.length / ROWS_PER_PAGE) || 1;

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredRows.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [filteredRows, currentPage]);

  const dashboardData = useMemo(() => {
    const counts = {};

    filteredRows.forEach((item) => {
      const fn = getFunctionName(item);
      counts[fn] = (counts[fn] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredRows]);

  const totalRecords = filteredRows.length;
  const totalFunctions = dashboardData.length;
  const topFunction = dashboardData[0]?.name || "-";
  const maxCount = Math.max(...dashboardData.map((i) => i.count), 1);

  const exportCSV = () => {
    if (!filteredRows.length) {
      alert("No data available to export");
      return;
    }

    const csvRows = [];
    csvRows.push(columns.join(","));

    filteredRows.forEach((row) => {
      const values = columns.map((col) => {
        const value = row[col] ?? "";
        return `"${String(value).replace(/"/g, '""')}"`;
      });

      csvRows.push(values.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "hospitality-reports.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <>
      <h1 className="page-title">Hospitality Reports</h1>

      <p className="page-subtitle">
        Live hospitality reports connected with Google Sheets.
      </p>

      <div style={styles.filterBar}>
        <input
          style={styles.input}
          type="text"
          placeholder="Search hospitality reports..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          style={styles.select}
          value={selectedFunction}
          onChange={(e) => setSelectedFunction(e.target.value)}
        >
          {functions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          style={styles.select}
          value={timeFilter}
          onChange={(e) => {
            setTimeFilter(e.target.value);

            if (e.target.value !== "Custom Range") {
              setFromDate("");
              setToDate("");
            }
          }}
        >
          <option>All Time</option>
          <option>Custom Range</option>
          <option>Today</option>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Year</option>
        </select>

        {timeFilter === "Custom Range" && (
          <>
            <input
              style={styles.select}
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />

            <input
              style={styles.select}
              type="date"
              value={toDate}
              min={fromDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </>
        )}

        <button style={styles.primaryBtn} onClick={() => setShowDashboard(true)}>
          Open Dashboard
        </button>

        <button style={styles.greenBtn} onClick={exportCSV}>
          Export CSV
        </button>

        <button style={styles.secondaryBtn} onClick={loadReports}>
          Refresh
        </button>
      </div>

      {showDashboard && (
        <div style={styles.dashboard}>
          <div style={styles.dashboardHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Hospitality Dashboard</h2>
              <p style={styles.smallText}>
                Function wise live dashboard based on selected filters.
              </p>
            </div>

            <button style={styles.closeBtn} onClick={() => setShowDashboard(false)}>
              Close Dashboard
            </button>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Total Records</p>
              <h2 style={styles.statValue}>{totalRecords}</h2>
            </div>

            <div style={styles.statCard}>
              <p style={styles.statLabel}>Total Functions</p>
              <h2 style={styles.statValue}>{totalFunctions}</h2>
            </div>

            <div style={styles.statCard}>
              <p style={styles.statLabel}>Top Function</p>
              <h2 style={styles.statValueSmall}>{topFunction}</h2>
            </div>
          </div>

          <div style={styles.chartGrid}>
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Function Wise Bar Chart</h3>

              {dashboardData.length ? (
                dashboardData.map((item) => (
                  <div key={item.name} style={styles.barRow}>
                    <div style={styles.barLabel}>{item.name}</div>

                    <div style={styles.barTrack}>
                      <div
                        style={{
                          ...styles.barFill,
                          width: `${(item.count / maxCount) * 100}%`,
                        }}
                      />
                    </div>

                    <div style={styles.barCount}>{item.count}</div>
                  </div>
                ))
              ) : (
                <p style={styles.emptyText}>No dashboard data found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading hospitality reports...</p>
      ) : (
        <div style={styles.reportCard}>
          <div style={styles.reportHeader}>
            <h2 style={styles.reportTitle}>Hospitality Report Data</h2>

            <span style={styles.countBadge}>
              Showing {paginatedRows.length} of {filteredRows.length} Records
            </span>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column} style={styles.th}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {columns.map((column) => (
                        <td key={column} style={styles.td}>
                          {row[column] || "-"}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length || 1} style={styles.emptyCell}>
                      No hospitality report data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredRows.length > ROWS_PER_PAGE && (
            <div style={styles.pagination}>
              <button
                style={{
                  ...styles.pageBtn,
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                Previous
              </button>

              <span style={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                style={{
                  ...styles.pageBtn,
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                }}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

const styles = {
  filterBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "center",
    marginBottom: "22px",
  },

  input: {
    minWidth: "280px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
    background: "#ffffff",
  },

  select: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
    background: "#ffffff",
  },

  primaryBtn: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "12px 16px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  greenBtn: {
    border: "none",
    background: "#16a34a",
    color: "#ffffff",
    padding: "12px 16px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  secondaryBtn: {
    border: "none",
    background: "#111827",
    color: "#ffffff",
    padding: "12px 16px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  pageBtn: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "10px 16px",
    borderRadius: "10px",
    fontWeight: "800",
  },

  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "14px",
    marginTop: "18px",
  },

  pageInfo: {
    fontWeight: "800",
    color: "#374151",
  },

  dashboard: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "24px",
    padding: "24px",
    marginBottom: "24px",
  },

  dashboardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
    marginBottom: "20px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "24px",
    color: "#111827",
  },

  smallText: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  closeBtn: {
    border: "none",
    background: "#dc2626",
    color: "#ffffff",
    padding: "11px 15px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },

  statCard: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
  },

  statLabel: {
    margin: 0,
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: "700",
  },

  statValue: {
    margin: "10px 0 0",
    fontSize: "34px",
    color: "#111827",
  },

  statValueSmall: {
    margin: "10px 0 0",
    fontSize: "22px",
    color: "#111827",
  },

  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "18px",
  },

  chartCard: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
  },

  chartTitle: {
    marginTop: 0,
    marginBottom: "18px",
    color: "#111827",
  },

  barRow: {
    display: "grid",
    gridTemplateColumns: "140px 1fr 50px",
    gap: "12px",
    alignItems: "center",
    marginBottom: "14px",
  },

  barLabel: {
    fontSize: "14px",
    color: "#374151",
    fontWeight: "700",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  barTrack: {
    height: "14px",
    background: "#e5e7eb",
    borderRadius: "999px",
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    background: "linear-gradient(90deg, #2563eb, #16a34a)",
    borderRadius: "999px",
  },

  barCount: {
    textAlign: "right",
    color: "#111827",
    fontWeight: "800",
  },

  emptyText: {
    color: "#6b7280",
    textAlign: "center",
  },

  reportCard: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
  },

  reportHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "18px",
  },

  reportTitle: {
    margin: 0,
    fontSize: "22px",
    color: "#17172f",
  },

  countBadge: {
    background: "#eef2ff",
    color: "#3730a3",
    padding: "7px 13px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "900px",
    borderCollapse: "collapse",
  },

  th: {
    background: "#f9fafb",
    color: "#374151",
    fontSize: "13px",
    fontWeight: "700",
    textAlign: "left",
    padding: "14px",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },

  td: {
    color: "#4b5563",
    fontSize: "14px",
    padding: "14px",
    borderBottom: "1px solid #f1f5f9",
    whiteSpace: "nowrap",
  },

  emptyCell: {
    padding: "28px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "15px",
  },
};