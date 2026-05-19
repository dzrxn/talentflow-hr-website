import { useEffect, useRef, useState, useMemo } from "react";
import StatCard from "../components/StatCard";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://talentflow-hr-website-1jga.onrender.com";

export default function InternshipData() {
  const [rows, setRows] = useState([]);
  const didLoad = useRef(false);
  const [loading, setLoading] = useState(true);

  const cleanText = (value) => String(value || "").trim();

  const getStatus = (item) =>
    cleanText(
      item["Status"] ||
      item["Internship Status"] ||
      item["Joining Status"]
    );

  const loadInternshipData = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/sheets/internships`);
      const result = await res.json();

      setRows(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.log("INTERNSHIP DATA ERROR:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didLoad.current) return;

    didLoad.current = true;

    loadInternshipData();
  }, []);

  const summary = useMemo(() => {
    let joined = 0;

    rows.forEach((item) => {
      const status = getStatus(item).toLowerCase();

      if (status.includes("joined")) {
        joined += 1;
      }
    });

    return {
      total: rows.length,
      joined,
    };
  }, [rows]);

  return (
    <>
      <h1 className="page-title">NB Internship Data</h1>

      <p className="page-subtitle">
        Internship dashboard with total and joined candidates.
      </p>

      {loading ? (
        <p>Loading internship data...</p>
      ) : (
        <>
          <div className="cards-grid">
            <StatCard
              label="Total"
              value={summary.total}
              change="Total internship records"
              colorClass="c1"
            />

            <StatCard
              label="Joined"
              value={summary.joined}
              change="Joined internship candidates"
              colorClass="c2"
            />
          </div>

          <div style={styles.reportCard}>
            <h3 style={styles.reportTitle}>NB Internship Report</h3>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Metric</th>
                    <th style={styles.th}>Count</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td style={styles.td}>Total</td>
                    <td style={styles.td}>{summary.total}</td>
                  </tr>

                  <tr>
                    <td style={styles.td}>Joined</td>
                    <td style={styles.td}>{summary.joined}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}

const styles = {
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
};