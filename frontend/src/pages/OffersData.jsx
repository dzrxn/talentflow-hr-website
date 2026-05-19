import { useEffect, useRef, useState } from "react";
import StatCard from "../components/StatCard";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://talentflow-hr-website-1jga.onrender.com";

const OFFER_STATUS_OPTIONS = [
  "Offers Released",
  "Joined",
  "Offers Declined",
  "Offers Revoked",
  "Yet to join",
];

export default function OffersData() {
  const [rows, setRows] = useState([]);
  const didLoad = useRef(false);
  const [loading, setLoading] = useState(true);

  const loadOffersData = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/sheets/offers`);
      const result = await res.json();

      setRows(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.log("OFFERS DATA ERROR:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didLoad.current) return;

    didLoad.current = true;

    loadOffersData();
  }, []);

  const totalsRow = rows.find(
    (item) =>
      String(item.Month || "").trim().toLowerCase() === "total"
  );

  const statusCounts = {
    "Offers Released": Number(totalsRow?.["Offers Released"] || 0),
    Joined: Number(totalsRow?.["Joined"] || 0),
    "Offers Declined": Number(totalsRow?.["Offers Declined"] || 0),
    "Offers Revoked": Number(totalsRow?.["Offers Revoked"] || 0),
    "Yet to join": Number(totalsRow?.["Yet to join"] || 0),
  };

  return (
    <>
      <h1 className="page-title">NB Offer Data</h1>

      <p className="page-subtitle">
        Offer dashboard with released, joined, declined, revoked and yet to join
        status counts.
      </p>

      {loading ? (
        <p>Loading offers data...</p>
      ) : (
        <>
          <div className="cards-grid">
            <StatCard
              label="Total Offers"
              value={
                Object.values(statusCounts).reduce((a, b) => a + b, 0)
              }
              change="All offer records"
              colorClass="c1"
            />

            {OFFER_STATUS_OPTIONS.map((status, index) => (
              <StatCard
                key={status}
                label={status}
                value={statusCounts[status] || 0}
                change="Status count"
                colorClass={`c${(index % 8) + 2}`}
              />
            ))}
          </div>

          <div style={styles.reportCard}>
            <h3 style={styles.reportTitle}>NB Offer Status Report</h3>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Count</th>
                  </tr>
                </thead>

                <tbody>
                  {OFFER_STATUS_OPTIONS.map((status) => (
                    <tr key={status}>
                      <td style={styles.td}>{status}</td>
                      <td style={styles.td}>{statusCounts[status] || 0}</td>
                    </tr>
                  ))}
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