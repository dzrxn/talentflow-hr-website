import { useEffect, useMemo, useRef, useState } from "react";
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

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  "https://talentflow-hr-website-m3yb.onrender.com"
).replace(/\/$/, "");

const DASHBOARD_FILTERS = [
  "All Dashboard",
  "Total Positions",
  "Joined",
  "Yet to Join",
  "Open Number",
  "On Hold",
  "Closed by Vendors",
  "Closed by TA Team",
  "Closed by Internal referral",
];

const TIME_FILTERS = [
  "All Time",
  "Today",
  "Yesterday",
  "This Week",
  "This Month",
  "90 Days",
  "This Year",
];

const REMOVED_ENTITIES = ["chalukya samrat"];

export default function Reports() {
  const [jobs, setJobs] = useState([]);
  const didLoad = useRef(false);
  const [selectedFunction, setSelectedFunction] = useState("All Functions");
  const [selectedEntity, setSelectedEntity] = useState("All Entities");
  const [selectedDashboard, setSelectedDashboard] = useState("All Dashboard");
  const [selectedTime, setSelectedTime] = useState("All Time");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);
  const [maximizedChart, setMaximizedChart] = useState(null);

  const clean = (value) => String(value ?? "").trim();

  const normalize = (value) => clean(value).toLowerCase().replace(/\s+/g, " ");

  const toNumber = (value) => {
    const num = Number(clean(value).replace(/,/g, ""));
    return Number.isFinite(num) ? num : 0;
  };

  const getValue = (item, keys) => {
    for (const key of keys) {
      if (item?.[key] !== undefined && item?.[key] !== null) return item[key];
    }
    return "";
  };

  const getSlNo = (item) => getValue(item, ["Sl No.", "Sl No", "S No"]);

  const getDesignation = (item) =>
    clean(getValue(item, ["Designation", "Role", "Position"]));

  const getFunction = (item) =>
    clean(getValue(item, ["Function", "Department", "FUNCTION"]));

  const getEntity = (item) => clean(getValue(item, ["Entity", "ENTITY"]));

  const getStatus = (item) => clean(getValue(item, ["Status", "STATUS"]));

  const getCreatedDate = (item) =>
    getValue(item, ["Created Date", "CreatedAt", "Date", "Opening Date"]);

  const getClosedDate = (item) =>
    getValue(item, ["Closed Date", "ClosedAt", "Closing Date"]);

  const getTotalPositions = (item) =>
    toNumber(getValue(item, ["Total Positions", "Total Position", "Total"]));

  const getJoined = (item) => toNumber(getValue(item, ["Joined"]));

  const getYTJ = (item) =>
    toNumber(getValue(item, ["Yet to join", "Yet to Join", "YTJ"]));

  const getOpen = (item) =>
    toNumber(getValue(item, ["Open Number", "Open", "Openings"]));

  const getHold = (item) => toNumber(getValue(item, ["On Hold", "Hold"]));

  const getVendors = (item) =>
    toNumber(getValue(item, ["Closed by vendors", "Closed by Vendors"]));

  const getTA = (item) =>
    toNumber(getValue(item, ["Closed by TA Team", "TA Team"]));

  const getInternal = (item) =>
    toNumber(
      getValue(item, [
        "Closed by Internal referral",
        "Closed by Internal Referral",
        "Internal Referral",
      ])
    );

  const isRemovedEntity = (entity) => {
    const value = normalize(entity);
    return REMOVED_ENTITIES.some((removed) => value.includes(removed));
  };

  const parseDate = (value) => {
    if (!value) return null;

    if (typeof value === "number") {
      const date = new Date(Math.round((value - 25569) * 86400 * 1000));
      return Number.isNaN(date.getTime()) ? null : date;
    }

    const text = clean(value);
    const match = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);

    if (match) {
      const date = new Date(
        Number(match[3]),
        Number(match[2]) - 1,
        Number(match[1])
      );
      return Number.isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatDate = (value) => {
    const date = parseDate(value);
    if (!date) return clean(value);
    return date.toLocaleDateString("en-IN");
  };

  const isWithinTime = (createdDate, closedDate) => {
    if (selectedTime === "All Time") return true;

    const dates = [parseDate(createdDate), parseDate(closedDate)].filter(
      Boolean
    );

    if (dates.length === 0) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return dates.some((date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today - d) / (1000 * 60 * 60 * 24));

      if (selectedTime === "Today") return diffDays === 0;
      if (selectedTime === "Yesterday") return diffDays === 1;
      if (selectedTime === "This Week") return diffDays >= 0 && diffDays <= 7;
      if (selectedTime === "This Month") return diffDays >= 0 && diffDays <= 30;
      if (selectedTime === "90 Days") return diffDays >= 0 && diffDays <= 90;
      if (selectedTime === "This Year") return diffDays >= 0 && diffDays <= 365;

      return true;
    });
  };

  const extractRows = (result) => {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result?.rows)) return result.rows;
    if (Array.isArray(result?.reports)) return result.reports;
    if (Array.isArray(result?.dashboard)) return result.dashboard;
    if (Array.isArray(result?.data?.rows)) return result.data.rows;
    if (Array.isArray(result?.data?.reports)) return result.data.reports;
    if (Array.isArray(result?.data?.dashboard)) return result.data.dashboard;
    return [];
  };

  const removeBadRows = (rows) => {
    return rows.filter((item) => {
      if (!item) return false;

      const slNo = clean(getSlNo(item)).toLowerCase();
      const entity = getEntity(item);

      const text = [
        getDesignation(item),
        getFunction(item),
        entity,
        getStatus(item),
      ]
        .join(" ")
        .toLowerCase();

      if (slNo === "total" || slNo === "grand total") return false;
      if (text.includes("grand total")) return false;
      if (isRemovedEntity(entity)) return false;

      return (
        getDesignation(item) ||
        getFunction(item) ||
        entity ||
        getStatus(item) ||
        getTotalPositions(item) > 0 ||
        getJoined(item) > 0 ||
        getYTJ(item) > 0 ||
        getOpen(item) > 0 ||
        getHold(item) > 0
      );
    });
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      setErrorMsg("");


      const res = await fetch(`${API_BASE}/api/sheets/dashboard`, {
        headers: { Accept: "application/json" },
      });

      const urls = [`${API_BASE}/api/sheets/reports`, `${API_BASE}/api/sheets/dashboard`];





      const text = await res.text();
      let result = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Backend returned invalid JSON.");
      }

      if (!res.ok || result.success === false) {
        throw new Error(result.error || "Dashboard API failed.");
      }

      const rows = removeBadRows(extractRows(result));
      setJobs(rows);

      if (rows.length === 0) {
        setErrorMsg("No Nambiar Builders dashboard data found.");
      }
    } catch (error) {
      console.error("NB DASHBOARD LOAD ERROR:", error);
      setJobs([]);
      setErrorMsg(error.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didLoad.current) return;

    didLoad.current = true;

    loadReports();
  }, []);

  const functions = useMemo(() => {
    const list = jobs.map(getFunction).filter(Boolean);
    return ["All Functions", ...Array.from(new Set(list)).sort()];
  }, [jobs]);

  const entities = useMemo(() => {
    const list = jobs
      .map(getEntity)
      .filter(Boolean)
      .filter((entity) => !isRemovedEntity(entity));

    return ["All Entities", ...Array.from(new Set(list)).sort()];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    let rows = [...jobs];

    rows = rows.filter((item) => !isRemovedEntity(getEntity(item)));

    if (selectedFunction !== "All Functions") {
      rows = rows.filter((item) => getFunction(item) === selectedFunction);
    }

    if (selectedEntity !== "All Entities") {
      rows = rows.filter((item) => getEntity(item) === selectedEntity);
    }

    rows = rows.filter((item) =>
      isWithinTime(getCreatedDate(item), getClosedDate(item))
    );

    if (selectedDashboard !== "All Dashboard") {
      rows = rows.filter((item) => {
        if (selectedDashboard === "Total Positions")
          return getTotalPositions(item) > 0;
        if (selectedDashboard === "Joined") return getJoined(item) > 0;
        if (selectedDashboard === "Yet to Join") return getYTJ(item) > 0;
        if (selectedDashboard === "Open Number") return getOpen(item) > 0;
        if (selectedDashboard === "On Hold") return getHold(item) > 0;
        if (selectedDashboard === "Closed by Vendors") return getVendors(item) > 0;
        if (selectedDashboard === "Closed by TA Team") return getTA(item) > 0;
        if (selectedDashboard === "Closed by Internal referral")
          return getInternal(item) > 0;

        return true;
      });
    }

    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();

      rows = rows.filter((item) =>
        [
          getSlNo(item),
          getDesignation(item),
          getFunction(item),
          getEntity(item),
          getStatus(item),
          getCreatedDate(item),
          getClosedDate(item),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    return rows;
  }, [
    jobs,
    selectedFunction,
    selectedEntity,
    selectedDashboard,
    selectedTime,
    searchText,
  ]);

  const summary = useMemo(() => {
    return filteredJobs.reduce(
      (acc, item) => {
        acc.total += getTotalPositions(item);
        acc.joined += getJoined(item);
        acc.ytj += getYTJ(item);
        acc.open += getOpen(item);
        acc.hold += getHold(item);
        acc.vendors += getVendors(item);
        acc.ta += getTA(item);
        acc.internal += getInternal(item);
        return acc;
      },
      {
        total: 0,
        joined: 0,
        ytj: 0,
        open: 0,
        hold: 0,
        vendors: 0,
        ta: 0,
        internal: 0,
      }
    );
  }, [filteredJobs]);

  const functionSummary = useMemo(() => {
    const map = {};

    filteredJobs.forEach((item) => {
      const fn = getFunction(item) || "Unknown";
      map[fn] = (map[fn] || 0) + getTotalPositions(item);
    });

    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [filteredJobs]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { enabled: true },
      legend: { display: true },
    },
  };

  const statusBarData = {
    labels: [
      "Total",
      "Joined",
      "YTJ",
      "Open",
      "On Hold",
      "Vendors",
      "TA Team",
      "Internal",
    ],
    datasets: [
      {
        label: "Count",
        data: [
          summary.total,
          summary.joined,
          summary.ytj,
          summary.open,
          summary.hold,
          summary.vendors,
          summary.ta,
          summary.internal,
        ],
        backgroundColor: "#16a34a",
        borderRadius: 6,
      },
    ],
  };

  const statusPieData = {
    labels: [
      "Joined",
      "Yet to Join",
      "Open",
      "On Hold",
      "Closed by Vendors",
      "Closed by TA Team",
      "Internal Referral",
    ],
    datasets: [
      {
        data: [
          summary.joined,
          summary.ytj,
          summary.open,
          summary.hold,
          summary.vendors,
          summary.ta,
          summary.internal,
        ],
        backgroundColor: [
          "#22c55e",
          "#3b82f6",
          "#f97316",
          "#8b5cf6",
          "#14b8a6",
          "#06b6d4",
          "#ec4899",
        ],
        borderWidth: 0,
      },
    ],
  };

  const functionBarData = {
    labels: functionSummary.map(([name]) => name),
    datasets: [
      {
        label: "Total Positions",
        data: functionSummary.map(([, value]) => value),
        backgroundColor: "#22c55e",
        borderRadius: 6,
      },
    ],
  };

  const exportCSV = () => {
    const rows = [
      [
        "Sl No.",
        "Designation",
        "Function",
        "Entity",
        "Created Date",
        "Closed Date",
        "Status",
        "Total Positions",
        "Joined",
        "Yet to join",
        "Open Number",
        "On Hold",
        "Closed by vendors",
        "Closed by TA Team",
        "Closed by Internal referral",
      ],
      ...filteredJobs.map((r) => [
        getSlNo(r),
        getDesignation(r),
        getFunction(r),
        getEntity(r),
        formatDate(getCreatedDate(r)),
        formatDate(getClosedDate(r)),
        getStatus(r),
        getTotalPositions(r),
        getJoined(r),
        getYTJ(r),
        getOpen(r),
        getHold(r),
        getVendors(r),
        getTA(r),
        getInternal(r),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")
      )
      .join("\n");

    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "nambiar-builders-dashboard.csv";
    a.click();
  };

  const renderChart = (type, isFull = false) => {
    const chartHeight = isFull ? "70vh" : "360px";

    if (type === "bar") {
      return (
        <div style={{ height: chartHeight }}>
          <Bar data={statusBarData} options={chartOptions} />
        </div>
      );
    }

    if (type === "pie") {
      return (
        <div style={{ height: chartHeight }}>
          <Doughnut data={statusPieData} options={chartOptions} />
        </div>
      );
    }

    return (
      <div style={{ height: chartHeight }}>
        <Bar data={functionBarData} options={chartOptions} />
      </div>
    );
  };

  return (
    <>
      <h1 className="page-title">NB Reports</h1>

      <p className="page-subtitle">
        Live Nambiar Builders dashboard recruitment data.
      </p>

      <div className="report-filters">
        <select
          className="filter-select"
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
          className="filter-select"
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value)}
        >
          {entities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={selectedDashboard}
          onChange={(e) => setSelectedDashboard(e.target.value)}
        >
          {DASHBOARD_FILTERS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
        >
          {TIME_FILTERS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <input
          className="filter-select"
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <button
          className="export-btn"
          onClick={() => setShowDashboard(!showDashboard)}
        >
          {showDashboard ? "Hide Dashboard" : "Open Dashboard"}
        </button>

        <button className="export-btn" onClick={exportCSV}>
          Export CSV
        </button>

        <button className="export-btn" onClick={loadReports}>
          Refresh
        </button>
      </div>

      {errorMsg && (
        <p style={{ color: "red", fontWeight: "700", marginBottom: "16px" }}>
          {errorMsg}
        </p>
      )}

      {showDashboard && (
        <div className="charts-grid" style={{ marginBottom: "24px" }}>
          <div className="chart-card">
            <div className="table-header">
              <h3>Status Bar Graph</h3>
              <button
                className="export-btn"
                onClick={() => setMaximizedChart("bar")}
              >
                Maximize
              </button>
            </div>
            {renderChart("bar")}
          </div>

          <div className="chart-card">
            <div className="table-header">
              <h3>Status Pie Chart</h3>
              <button
                className="export-btn"
                onClick={() => setMaximizedChart("pie")}
              >
                Maximize
              </button>
            </div>
            {renderChart("pie")}
          </div>

          <div className="chart-card">
            <div className="table-header">
              <h3>Function Bar Graph</h3>
              <button
                className="export-btn"
                onClick={() => setMaximizedChart("function")}
              >
                Maximize
              </button>
            </div>
            {renderChart("function")}
          </div>
        </div>
      )}

      {maximizedChart && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            zIndex: 9999,
            padding: "30px",
          }}
        >
          <div
            className="chart-card"
            style={{
              height: "90vh",
              width: "100%",
              overflow: "auto",
            }}
          >
            <div className="table-header">
              <h3>
                {maximizedChart === "bar" && "Status Bar Graph"}
                {maximizedChart === "pie" && "Status Pie Chart"}
                {maximizedChart === "function" && "Function Bar Graph"}
              </h3>

              <button
                className="export-btn"
                onClick={() => setMaximizedChart(null)}
              >
                Close
              </button>
            </div>

            {renderChart(maximizedChart, true)}
          </div>
        </div>
      )}

      <div className="reports-table">
        <div className="table-header">
          <h3>Nambiar Builders Recruitment Reports</h3>
          <span>{filteredJobs.length} Records</span>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Sl No.</th>
                <th>Designation</th>
                <th>Function</th>
                <th>Entity</th>
                <th>Created Date</th>
                <th>Closed Date</th>
                <th>Status</th>
                <th>Total</th>
                <th>Joined</th>
                <th>YTJ</th>
                <th>Open</th>
                <th>Hold</th>
                <th>Vendors</th>
                <th>TA Team</th>
                <th>Internal</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="15" style={{ textAlign: "center" }}>
                    Loading...
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan="15" style={{ textAlign: "center" }}>
                    No data found
                  </td>
                </tr>
              ) : (
                filteredJobs.map((r, index) => (
                  <tr key={index}>
                    <td>{getSlNo(r)}</td>
                    <td>
                      <strong>{getDesignation(r)}</strong>
                    </td>
                    <td>{getFunction(r)}</td>
                    <td>{getEntity(r)}</td>
                    <td>{formatDate(getCreatedDate(r))}</td>
                    <td>{formatDate(getClosedDate(r))}</td>
                    <td>{getStatus(r)}</td>
                    <td>{getTotalPositions(r)}</td>
                    <td>{getJoined(r)}</td>
                    <td>{getYTJ(r)}</td>
                    <td>{getOpen(r)}</td>
                    <td>{getHold(r)}</td>
                    <td>{getVendors(r)}</td>
                    <td>{getTA(r)}</td>
                    <td>{getInternal(r)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}