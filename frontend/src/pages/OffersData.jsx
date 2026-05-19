import { useEffect, useRef, useState, useMemo } from "react";
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

  const cleanText = (value) => String(value || "").trim();

  const getStatus = (item) =>
    cleanText(
      item["Status"] ||
      item["Offer Status"] ||
      item["Offers Status"] ||
      item["OfferStatus"]
    );

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

    loadOffers();
  }, []);

  const statusCounts = useMemo(() => {
    const counts = {};

    OFFER_STATUS_OPTIONS.forEach((status) => {
      counts[status] = 0;
    });

    rows.forEach((item) => {
      const status = getStatus(item).toLowerCase();

      if (status === "offers released" || status === "offer released") {
        counts["Offers Released"] += 1;
      }

      if (status === "joined") {
        counts["Joined"] += 1;
      }

      if (status === "offers declined" || status === "offer declined") {
        counts["Offers Declined"] += 1;
      }

      if (status === "offers revoked" || status === "offer revoked") {
        counts["Offers Revoked"] += 1;
      }

      if (status === "yet to join" || status === "yet to joined") {
        counts["Yet to join"] += 1;
      }
    });

    return counts;
  }, [rows]);

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
              value={rows.length}
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