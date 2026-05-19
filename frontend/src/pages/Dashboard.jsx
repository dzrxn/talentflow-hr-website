
import { useEffect, useMemo, useRef, useState } from "react";
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

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://talentflow-hr-website-1jga.onrender.com";

const valueLabelPlugin = {
  id: "valueLabelPlugin",

  afterDatasetsDraw(chart) {
    const { ctx } = chart;

    ctx.save();

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);

      meta.data.forEach((element, index) => {
        const value = Number(dataset.data[index] || 0);

        if (value <= 0) return;

        ctx.font = "700 12px Inter, Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (chart.config.type === "bar") {
          const position = element.tooltipPosition();

          ctx.fillStyle = "#111827";
          ctx.fillText(value, position.x, position.y - 10);
        }

        if (chart.config.type === "doughnut") {
          const props = element.getProps(
            [
              "x",
              "y",
              "startAngle",
              "endAngle",
              "innerRadius",
              "outerRadius",
            ],
            true
          );

          const angle = (props.startAngle + props.endAngle) / 2;
          const radius = (props.innerRadius + props.outerRadius) / 2;

          const x = props.x + Math.cos(angle) * radius;
          const y = props.y + Math.sin(angle) * radius;

          ctx.lineWidth = 3;
          ctx.strokeStyle = "#111827";
          ctx.fillStyle = "#ffffff";

          ctx.strokeText(value, x, y);
          ctx.fillText(value, x, y);
        }
      });
    });

    ctx.restore();
  },
};

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  valueLabelPlugin
);

const ENTITIES = [
  "All Entities",
  "Nambiar Ensemble residential Projects LLP",
  "Sentrise Construction LLP",
  "Nambiar Builders Private Limited",
  "Nambiar Builders LLP",
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
  const didLoad = useRef(false);

  const toNumber = (value) => {
    const num = Number(String(value || "0").replace(/,/g, ""));
    return Number.isNaN(num) ? 0 : num;
  };

  const cleanText = (value) => String(value || "").trim();

  const normalizeEntity = (value) => {
    const text = cleanText(value);

    if (text.toLowerCase() === "sentries construction llp") {
      return "Sentrise Construction LLP";
    }

    return text;
  };

  const getEntity = (item) => {
    return (
      normalizeEntity(item["Entity"]) ||
      normalizeEntity(item["Entities"]) ||
      normalizeEntity(item["Company"]) ||
      normalizeEntity(item["Company Name"]) ||
      normalizeEntity(item["Business Entity"]) ||
      "Unknown"
    );
  };

  const parseDate = (value) => {
    if (!value) return null;

    const normalDate = new Date(value);

    if (!Number.isNaN(normalDate.getTime())) {
      return normalDate;
    }

    if (typeof value === "string" && value.includes("-")) {
      const parts = value.split("-");

      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;

        const d = new Date(`${yyyy}-${mm}-${dd}`);

        if (!Number.isNaN(d.getTime())) return d;
      }
    }

    if (typeof value === "string" && value.includes("/")) {
      const parts = value.split("/");

      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;

        const d = new Date(`${yyyy}-${mm}-${dd}`);

        if (!Number.isNaN(d.getTime())) return d;
      }
    }

    return null;
  };

  const getRowDate = (item) => {
    return (
      parseDate(item["Date"]) ||
      parseDate(item["Created Date"]) ||
      parseDate(item["Created At"]) ||
      parseDate(item["Requirement Date"]) ||
      parseDate(item["Open Date"]) ||
      parseDate(item["Joining Date"]) ||
      parseDate(item["Joined Date"])
    );
  };

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

      if (!res.ok) {
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
    if (didLoad.current) return;

    didLoad.current = true;

    loadDashboard();
  }, []);

  const filteredJobs = useMemo(() => {
    let rows = jobs.filter((item) => item["Sl No."] !== "Total");

    if (selectedEntity !== "All Entities") {
      rows = rows.filter((item) => getEntity(item) === selectedEntity);
    }

    if (selectedFunction !== "All Functions") {
      rows = rows.filter(
        (item) => String(item["Function"] || "").trim() === selectedFunction
      );
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
        acc.total += toNumber(item["Total Positions"]);

        acc.closed += toNumber(
          item["Closed"] ||
          item["Joined"] ||
          item["Total Closed"] ||
          item["Closed Positions"]
        );

        acc.ytj += toNumber(item["Yet to join"]);
        acc.open += toNumber(item["Open Number"]);
        acc.hold += toNumber(item["On Hold"]);
        acc.closedByVendors += toNumber(item["Closed by vendors"]);

        acc.closedByInternalReferral += toNumber(
          item["Closed by Internal referral"]
        );

        acc.closedByTATeam += toNumber(item["Closed by TA Team"]);

        const status = String(item["Status"] || "")
          .trim()
          .toLowerCase();

        if (status.includes("offer accepted")) {
          acc.accepted += toNumber(item["Yet to join"]) || 1;
        }

        return acc;
      },
      {
        total: 0,
        closed: 0,
        accepted: 0,
        ytj: 0,
        open: 0,
        hold: 0,
        closedByVendors: 0,
        closedByInternalReferral: 0,
        closedByTATeam: 0,
      }
    );
  }, [filteredJobs]);

  const cards = [
    ["Total Positions", summary.total, "From selected filters", "c1"],
    ["Closed", summary.closed, "Live sheet count", "c2"],
    ["Offer Accepted", summary.accepted, "Accepted candidates", "c3"],
    ["Yet to Join", summary.ytj, "Pending joining", "c4"],
    ["Open Number", summary.open, "Current openings", "c5"],
    ["On Hold", summary.hold, "Hold positions", "c6"],
    ["Closed by Vendors", summary.closedByVendors, "Vendor closed", "c7"],
    [
      "Closed by Internal referral",
      summary.closedByInternalReferral,
      "Internal referral closure",
      "c8",
    ],
    ["Closed by TA Team", summary.closedByTATeam, "TA team closure", "c1"],
  ];

  const functionSummary = useMemo(() => {
    const map = {};

    filteredJobs.forEach((item) => {
      const fn = String(item["Function"] || "Unknown").trim();

      map[fn] = (map[fn] || 0) + toNumber(item["Total Positions"]);
    });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [filteredJobs]);

  const entitySummary = useMemo(() => {
    const map = {};

    filteredJobs.forEach((item) => {
      const entity = getEntity(item);

      map[entity] = (map[entity] || 0) + toNumber(item["Total Positions"]);
    });

    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredJobs]);

  const barData = {
    labels: functionSummary.map(([name]) => name),

    datasets: [
      {
        label: "Total Positions",
        data: functionSummary.map(([, value]) => value),
        backgroundColor: "#16a34a",
        hoverBackgroundColor: "#16a34a",
        borderRadius: 8,
      },
    ],
  };

  const entityBarData = {
    labels: entitySummary.map(([name]) => name),

    datasets: [
      {
        label: "Entity Positions",
        data: entitySummary.map(([, value]) => value),
        backgroundColor: "#22c55e",
        hoverBackgroundColor: "#22c55e",
        borderRadius: 8,
      },
    ],
  };

  const pieData = {
    labels: [
      "Closed",
      "Yet to Join",
      "Open",
      "On Hold",
      "Closed by Vendors",
      "Internal Referral",
      "TA Team",
    ],

    datasets: [
      {
        data: [
          summary.closed,
          summary.ytj,
          summary.open,
          summary.hold,
          summary.closedByVendors,
          summary.closedByInternalReferral,
          summary.closedByTATeam,
        ],

        backgroundColor: [
          "#22c55e",
          "#f59e0b",
          "#3b82f6",
          "#f97316",
          "#8b5cf6",
          "#14b8a6",
          "#ec4899",
        ],

        hoverBackgroundColor: [
          "#22c55e",
          "#f59e0b",
          "#3b82f6",
          "#f97316",
          "#8b5cf6",
          "#14b8a6",
          "#ec4899",
        ],

        borderWidth: 0,
        hoverOffset: 0,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    events: [],

    plugins: {
      tooltip: {
        enabled: false,
      },

      legend: {
        display: true,
      },
    },

    animation: {
      duration: 0,
    },
  };

  const barOptions = {
    ...commonOptions,

    layout: {
      padding: {
        top: 28,
      },
    },

    plugins: {
      tooltip: {
        enabled: false,
      },

      legend: {
        display: false,
      },
    },

    scales: {
      x: {
        ticks: {
          font: {
            size: 10,
          },
        },

        grid: {
          display: false,
        },
      },

      y: {
        beginAtZero: true,
        grace: "15%",

        ticks: {
          precision: 0,

          font: {
            size: 10,
          },
        },
      },
    },
  };

  const entityBarOptions = {
    ...barOptions,

    indexAxis: "y",

    scales: {
      x: {
        beginAtZero: true,
        grace: "15%",

        ticks: {
          precision: 0,
          font: {
            size: 10,
          },
        },
      },

      y: {
        ticks: {
          font: {
            size: 10,
          },
        },

        grid: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions = {
    ...commonOptions,

    cutout: "68%",

    plugins: {
      tooltip: {
        enabled: false,
      },

      legend: {
        position: "bottom",

        labels: {
          boxWidth: 12,
          padding: 12,

          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <>
      <h1 className="page-title">NB Dashboard</h1>

      <p className="page-subtitle">
        Live recruitment dashboard connected with Google Sheets.
      </p>

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
          <br />
          Check Render environment variables and Google Sheet permission.
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

          <div style={styles.chartsGrid}>
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Positions by Function</h3>

              <div style={styles.barChartBox}>
                <Bar data={barData} options={barOptions} />
              </div>
            </div>

            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Status Breakdown</h3>

              <div style={styles.pieChartBox}>
                <Doughnut data={pieData} options={doughnutOptions} />
              </div>
            </div>
          </div>

          <div style={styles.entityChartCard}>
            <h3 style={styles.chartTitle}>Positions by Entity</h3>

            <div style={styles.entityChartBox}>
              <Bar data={entityBarData} options={entityBarOptions} />
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
    fontWeight: "600",
  },

  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "1.35fr 0.85fr",
    gap: "22px",
    marginTop: "26px",
    alignItems: "start",
  },

  chartCard: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "20px",
    minHeight: "340px",
    boxShadow: "0 4px 18px rgba(34,197,94,0.10)",
    border: "1px solid #bbf7d0",
    boxSizing: "border-box",
  },

  entityChartCard: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "20px",
    height: "360px",
    boxShadow: "0 4px 18px rgba(34,197,94,0.10)",
    border: "1px solid #bbf7d0",
    boxSizing: "border-box",
    marginTop: "26px",
  },

  chartTitle: {
    margin: "0 0 14px",
    fontSize: "18px",
    fontWeight: "800",
    color: "#14532d",
  },

  barChartBox: {
    width: "100%",
    height: "260px",
  },

  pieChartBox: {
    width: "240px",
    height: "240px",
    margin: "0 auto",
  },

  entityChartBox: {
    width: "100%",
    height: "285px",
  },
};
