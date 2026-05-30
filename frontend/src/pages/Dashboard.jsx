import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import { Bar, Doughnut } from "react-chartjs-2";

import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://talentflow-backend-ohup.onrender.com"
).replace(/\/$/, "");

const ENTITIES = [
  "All Entities",
  "Nambiar Ensemble residential Projects LLP",
  "Sentrise Construction LLP",
  "Nambiar Builders Private Limited",
  "Nambiar Enterprises LLP",
];

const FUNCTIONS = [
  "All Functions",
  "Execution",
  "Interiors & Finishing",
  "Sales",
  "Projects",
  "Finance & Accounts",
  "QA/QC",
  "QS Department",
  "Store Execution",
  "MEP",
  "Administration",
  "CRM",
  "Legal",
  "Planning",
  "IT",
  "Marketing",
  "Design",
  "HSE",
  "Presales",
  "Audit",
  "Sales & Marketing",
  "Operations",
  "Execution - Plant & Machinery",
  "Structural Design",
  "Purchase",
  "HR",
  "Talent Acquisition",
  "Payroll",
  "Facility Management",
];

const TIME_FILTERS = [
  "All Time",
  "Today",
  "Yesterday",
  "This Week",
  "This Month",
  "90 Days",
  "This Year",
  "Custom Range",
];

export default function Dashboard() {
  const [selectedEntity, setSelectedEntity] = useState("All Entities");
  const [selectedFunction, setSelectedFunction] = useState("All Functions");
  const [selectedTime, setSelectedTime] = useState("All Time");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const cleanText = (value) => String(value || "").trim();

  const toNumber = (value) => {
    const num = Number(String(value || "0").replace(/,/g, ""));
    return Number.isNaN(num) ? 0 : num;
  };

  const normalizeEntity = (value) => {
    const text = cleanText(value);
    if (text.toLowerCase() === "sentries construction llp") {
      return "Sentrise Construction LLP";
    }
    return text;
  };

  const getEntity = (item) =>
    normalizeEntity(item["Entity"]) ||
    normalizeEntity(item["Entities"]) ||
    normalizeEntity(item["Company"]) ||
    normalizeEntity(item["Company Name"]) ||
    normalizeEntity(item["Business Entity"]) ||
    "Unknown";

  const getFunction = (item) =>
    cleanText(item["Function"] || item["Department"] || "Unknown");

  const getTotal = (item) =>
    toNumber(item["Total Positions"] || item["Total Position"] || item["Total"]);

  const getClosed = (item) =>
    toNumber(
      item["Closed"] ||
      item["Joined"] ||
      item["Total Closed"] ||
      item["Closed Positions"]
    );

  const getYTJ = (item) =>
    toNumber(item["Yet to join"] || item["Yet to Join"] || item["YTJ"]);

  const getOpen = (item) =>
    toNumber(item["Open Number"] || item["Open"] || item["Openings"]);

  const getHold = (item) => toNumber(item["On Hold"] || item["Hold"]);

  const getVendors = (item) =>
    toNumber(item["Closed by vendors"] || item["Closed by Vendors"]);

  const getInternal = (item) =>
    toNumber(
      item["Closed by Internal referral"] ||
      item["Closed by Internal Referral"] ||
      item["Internal Referral"]
    );

  const getTA = (item) =>
    toNumber(item["Closed by TA Team"] || item["TA Team"]);

  const parseDate = (value) => {
    if (!value) return null;

    if (typeof value === "number") {
      const d = new Date(Math.round((value - 25569) * 86400 * 1000));
      return Number.isNaN(d.getTime()) ? null : d;
    }

    const direct = new Date(value);
    if (!Number.isNaN(direct.getTime())) return direct;

    const text = cleanText(value);
    const match = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);

    if (match) {
      const d = new Date(
        Number(match[3]),
        Number(match[2]) - 1,
        Number(match[1])
      );
      return Number.isNaN(d.getTime()) ? null : d;
    }

    return null;
  };

  const getRowDate = (item) =>
    parseDate(item["Date"]) ||
    parseDate(item["Created Date"]) ||
    parseDate(item["Created At"]) ||
    parseDate(item["Requirement Date"]) ||
    parseDate(item["Open Date"]) ||
    parseDate(item["Joining Date"]) ||
    parseDate(item["Joined Date"]);

  const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const endOfDay = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const isInsideTimeFilter = (item) => {
    if (selectedTime === "All Time") return true;

    const rowDate = getRowDate(item);
    if (!rowDate) return false;

    const today = new Date();
    const row = new Date(rowDate);
    let from = null;
    let to = null;

    if (selectedTime === "Today") {
      from = startOfDay(today);
      to = endOfDay(today);
    }

    if (selectedTime === "Yesterday") {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      from = startOfDay(y);
      to = endOfDay(y);
    }

    if (selectedTime === "This Week") {
      const d = new Date(today);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      from = startOfDay(new Date(d.setDate(diff)));
      to = endOfDay(today);
    }

    if (selectedTime === "This Month") {
      from = startOfDay(new Date(today.getFullYear(), today.getMonth(), 1));
      to = endOfDay(today);
    }

    if (selectedTime === "90 Days") {
      from = startOfDay(today);
      from.setDate(from.getDate() - 90);
      to = endOfDay(today);
    }

    if (selectedTime === "This Year") {
      from = startOfDay(new Date(today.getFullYear(), 0, 1));
      to = endOfDay(today);
    }

    if (selectedTime === "Custom Range") {
      if (!customFrom || !customTo) return true;
      from = startOfDay(new Date(customFrom));
      to = endOfDay(new Date(customTo));
    }

    return row >= from && row <= to;
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setApiError("");

      const res = await fetch(`${API_URL}/api/sheets/dashboard`);
      const result = await res.json();

      if (!res.ok || result.success === false) {
        setApiError(result.error || "Backend server error");
        setJobs([]);
        return;
      }

      setJobs(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.log("DASHBOARD ERROR:", error);
      setApiError("Unable to connect backend. Please check Render server.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const filteredJobs = useMemo(() => {
    let rows = jobs.filter((item) => {
      const slNo = cleanText(item["Sl No."]).toLowerCase();
      return slNo !== "total" && slNo !== "grand total";
    });

    if (selectedEntity !== "All Entities") {
      rows = rows.filter((item) => getEntity(item) === selectedEntity);
    }

    if (selectedFunction !== "All Functions") {
      rows = rows.filter((item) => getFunction(item) === selectedFunction);
    }

    return rows.filter(isInsideTimeFilter);
  }, [
    jobs,
    selectedEntity,
    selectedFunction,
    selectedTime,
    customFrom,
    customTo,
  ]);

  const summary = useMemo(() => {
    return filteredJobs.reduce(
      (acc, item) => {
        acc.total += getTotal(item);
        acc.closed += getClosed(item);
        acc.ytj += getYTJ(item);
        acc.open += getOpen(item);
        acc.hold += getHold(item);
        acc.vendors += getVendors(item);
        acc.internal += getInternal(item);
        acc.ta += getTA(item);
        return acc;
      },
      {
        total: 0,
        closed: 0,
        ytj: 0,
        open: 0,
        hold: 0,
        vendors: 0,
        internal: 0,
        ta: 0,
      }
    );
  }, [filteredJobs]);

  const functionWiseSummary = useMemo(() => {
    const map = {};

    filteredJobs.forEach((item) => {
      const fn = getFunction(item);

      if (!map[fn]) {
        map[fn] = {
          total: 0,
          closed: 0,
          ytj: 0,
          open: 0,
          hold: 0,
          vendors: 0,
          internal: 0,
          ta: 0,
        };
      }

      map[fn].total += getTotal(item);
      map[fn].closed += getClosed(item);
      map[fn].ytj += getYTJ(item);
      map[fn].open += getOpen(item);
      map[fn].hold += getHold(item);
      map[fn].vendors += getVendors(item);
      map[fn].internal += getInternal(item);
      map[fn].ta += getTA(item);
    });

    return Object.entries(map)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10);
  }, [filteredJobs]);

  const entitySummary = useMemo(() => {
    const map = {};

    filteredJobs.forEach((item) => {
      const entity = getEntity(item);
      map[entity] = (map[entity] || 0) + getTotal(item);
    });

    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredJobs]);

  const cards = [
    ["Total Positions", summary.total, "From selected filters", "c1"],
    ["Closed", summary.closed, "Completed positions", "c2"],
    ["Yet to Join", summary.ytj, "Pending joining", "c3"],
    ["Open Number", summary.open, "Current openings", "c4"],
    ["On Hold", summary.hold, "Hold positions", "c5"],
  ];

  const chartBaseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    plugins: {
      tooltip: { enabled: true },
      legend: {
        display: true,
        labels: {
          boxWidth: 10,
          padding: 8,
          font: { size: 10 },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 9 } },
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0, font: { size: 9 } },
      },
    },
  };

  const horizontalOptions = {
    ...chartBaseOptions,
    indexAxis: "y",
  };

  const stackedOptions = {
    ...chartBaseOptions,
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { font: { size: 9 } },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: { precision: 0, font: { size: 9 } },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      tooltip: { enabled: true },
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 10,
          padding: 8,
          font: { size: 10 },
        },
      },
    },
  };

  const functionStatusData = {
    labels: functionWiseSummary.map(([name]) => name),
    datasets: [
      {
        label: "Total Positions",
        data: functionWiseSummary.map(([, v]) => v.total),
        backgroundColor: "#16a34a",
        borderRadius: 6,
      },
      {
        label: "Closed",
        data: functionWiseSummary.map(([, v]) => v.closed),
        backgroundColor: "#2563eb",
        borderRadius: 6,
      },
      {
        label: "Open Number",
        data: functionWiseSummary.map(([, v]) => v.open),
        backgroundColor: "#f97316",
        borderRadius: 6,
      },
    ],
  };

  const stackedStatusData = {
    labels: functionWiseSummary.map(([name]) => name),
    datasets: [
      {
        label: "Closed",
        data: functionWiseSummary.map(([, v]) => v.closed),
        backgroundColor: "#22c55e",
      },
      {
        label: "Open Number",
        data: functionWiseSummary.map(([, v]) => v.open),
        backgroundColor: "#3b82f6",
      },
      {
        label: "Yet to Join",
        data: functionWiseSummary.map(([, v]) => v.ytj),
        backgroundColor: "#f59e0b",
      },
      {
        label: "On Hold",
        data: functionWiseSummary.map(([, v]) => v.hold),
        backgroundColor: "#ef4444",
      },
    ],
  };

  const closureSourceData = {
    labels: functionWiseSummary.map(([name]) => name),
    datasets: [
      {
        label: "Vendors",
        data: functionWiseSummary.map(([, v]) => v.vendors),
        backgroundColor: "#14b8a6",
        borderRadius: 6,
      },
      {
        label: "TA Team",
        data: functionWiseSummary.map(([, v]) => v.ta),
        backgroundColor: "#06b6d4",
        borderRadius: 6,
      },
      {
        label: "Internal",
        data: functionWiseSummary.map(([, v]) => v.internal),
        backgroundColor: "#ec4899",
        borderRadius: 6,
      },
    ],
  };

  const openClosedData = {
    labels: functionWiseSummary.map(([name]) => name),
    datasets: [
      {
        label: "Closed",
        data: functionWiseSummary.map(([, v]) => v.closed),
        backgroundColor: "#16a34a",
        borderRadius: 6,
      },
      {
        label: "Open Number",
        data: functionWiseSummary.map(([, v]) => v.open),
        backgroundColor: "#f97316",
        borderRadius: 6,
      },
    ],
  };

  const holdYTJData = {
    labels: functionWiseSummary.map(([name]) => name),
    datasets: [
      {
        label: "Yet to Join",
        data: functionWiseSummary.map(([, v]) => v.ytj),
        backgroundColor: "#eab308",
        borderRadius: 6,
      },
      {
        label: "On Hold",
        data: functionWiseSummary.map(([, v]) => v.hold),
        backgroundColor: "#8b5cf6",
        borderRadius: 6,
      },
    ],
  };

  const entityData = {
    labels: entitySummary.map(([name]) => name),
    datasets: [
      {
        label: "Positions",
        data: entitySummary.map(([, value]) => value),
        backgroundColor: "#22c55e",
        borderRadius: 6,
      },
    ],
  };

  const statusDoughnutData = {
    labels: ["Closed", "Open Number", "Yet to Join", "On Hold"],
    datasets: [
      {
        data: [summary.closed, summary.open, summary.ytj, summary.hold],
        backgroundColor: ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"],
        borderWidth: 0,
      },
    ],
  };

  const closureDoughnutData = {
    labels: ["Vendors", "TA Team", "Internal"],
    datasets: [
      {
        data: [summary.vendors, summary.ta, summary.internal],
        backgroundColor: ["#14b8a6", "#06b6d4", "#ec4899"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <>
      <h1 className="page-title">NB Dashboard</h1>
      <p className="page-subtitle">Live recruitment dashboard.</p>

      <div className="filter-bar">
        <select
          className="filter-select"
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value)}
        >
          {ENTITIES.map((entity) => (
            <option key={entity} value={entity}>
              {entity}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={selectedFunction}
          onChange={(e) => setSelectedFunction(e.target.value)}
        >
          {FUNCTIONS.map((fn) => (
            <option key={fn} value={fn}>
              {fn}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
        >
          {TIME_FILTERS.map((filter) => (
            <option key={filter} value={filter}>
              {filter}
            </option>
          ))}
        </select>

        {selectedTime === "Custom Range" && (
          <>
            <input
              className="filter-select"
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
            />

            <input
              className="filter-select"
              type="date"
              value={customTo}
              min={customFrom}
              onChange={(e) => setCustomTo(e.target.value)}
            />
          </>
        )}

        <button className="date-btn" onClick={loadDashboard}>
          Refresh
        </button>
      </div>

      {apiError && (
        <div style={styles.errorBox}>
          <strong>Backend Error:</strong> {apiError}
        </div>
      )}

      {loading ? (
        <p>Loading Google Sheets data...</p>
      ) : (
        <>
          <div className="cards-grid">
            {cards.map(([label, value, change, cls]) => (
              <StatCard
                key={label}
                label={label}
                value={value}
                change={change}
                colorClass={cls}
              />
            ))}
          </div>

          <div style={styles.compactGrid}>
            <ChartCard title="Function: Total Positions / Closed / Open Number">
              <Bar data={functionStatusData} options={chartBaseOptions} />
            </ChartCard>

            <ChartCard title="Status Split">
              <Doughnut data={statusDoughnutData} options={doughnutOptions} />
            </ChartCard>

            <ChartCard title="Function Stacked Status">
              <Bar data={stackedStatusData} options={stackedOptions} />
            </ChartCard>

            <ChartCard title="Closure Source Split">
              <Doughnut data={closureDoughnutData} options={doughnutOptions} />
            </ChartCard>

            <ChartCard title="Function Closure Source">
              <Bar data={closureSourceData} options={chartBaseOptions} />
            </ChartCard>

            <ChartCard title="Open Number vs Closed">
              <Bar data={openClosedData} options={horizontalOptions} />
            </ChartCard>

            <ChartCard title="Yet to Join vs On Hold">
              <Bar data={holdYTJData} options={horizontalOptions} />
            </ChartCard>

            <ChartCard title="Entity Wise Positions">
              <Bar data={entityData} options={horizontalOptions} />
            </ChartCard>
          </div>
        </>
      )}
    </>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={styles.chartCard}>
      <h3 style={styles.chartTitle}>{title}</h3>
      <div style={styles.chartBox}>{children}</div>
    </div>
  );
}

const styles = {
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    padding: "12px 14px",
    borderRadius: "14px",
    margin: "14px 0",
    fontWeight: "700",
  },

  compactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "16px",
    marginTop: "20px",
  },

  chartCard: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "14px",
    minHeight: "300px",
    boxShadow: "0 4px 14px rgba(34,197,94,0.10)",
    border: "1px solid #bbf7d0",
    boxSizing: "border-box",
  },

  chartTitle: {
    margin: "0 0 10px",
    fontSize: "15px",
    fontWeight: "800",
    color: "#14532d",
  },

  chartBox: {
    width: "100%",
    height: "245px",
  },
};