// import { useEffect, useMemo, useRef, useState } from "react";
// import StatCard from "../components/StatCard";
// import { Bar, Doughnut } from "react-chartjs-2";

// import {
//   Chart as ChartJS,
//   BarElement,
//   ArcElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(
//   BarElement,
//   ArcElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
//   Legend
// );

// const API_BASE =
//   import.meta.env.VITE_API_URL ||
//   "https://talentflow-hr-website-1jga.onrender.com";

// const DEFAULT_ENTITIES = ["NB Club Bellezea", "Chalukya Samrat"];

// export default function HospitalityDashboard() {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [selectedEntity, setSelectedEntity] = useState("All");
//   const [selectedFunction, setSelectedFunction] = useState("All");
//   const [timeFilter, setTimeFilter] = useState("all");
//   const [customFrom, setCustomFrom] = useState("");
//   const [customTo, setCustomTo] = useState("");

//   const didLoad = useRef(false);

//   const toNumber = (value) => {
//     const num = Number(String(value || "0").replace(/,/g, ""));
//     return Number.isNaN(num) ? 0 : num;
//   };

//   const parseDate = (value) => {
//     if (!value) return null;

//     const text = String(value).trim();
//     const match = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);

//     if (match) {
//       const day = Number(match[1]);
//       const month = Number(match[2]) - 1;
//       const year = Number(match[3]);
//       const date = new Date(year, month, day);
//       return Number.isNaN(date.getTime()) ? null : date;
//     }

//     const d = new Date(text);
//     return Number.isNaN(d.getTime()) ? null : d;
//   };

//   const getEntity = (item) =>
//     String(
//       item["Entity"] ||
//         item["Entities"] ||
//         item["Project"] ||
//         item["Property"] ||
//         item["Hotel"] ||
//         item["Unit"] ||
//         ""
//     ).trim();

//   const getFunction = (item) =>
//     String(item["Function"] || item["Department"] || "").trim();

//   const removeSummaryAndEmptyRows = (data) => {
//     return data.filter((item) => {
//       if (!item) return false;

//       const slNo = String(item["Sl No."] || "").trim();
//       const designation = String(item["Designation"] || "").trim();
//       const fn = getFunction(item);
//       const entity = getEntity(item);
//       const status = String(item["Status"] || "").trim();

//       const isOnlyTotalNumberRow =
//         !slNo && !designation && !fn && !entity && !status;

//       if (isOnlyTotalNumberRow) return false;
//       if (!designation && !fn && !entity) return false;

//       return true;
//     });
//   };

//   const loadHospitality = async () => {
//     try {
//       setLoading(true);

//       const res = await fetch(`${API_BASE}/api/hospitality/dashboard`);
//       const result = await res.json();

//       const rawRows = Array.isArray(result.data) ? result.data : [];
//       const cleanRows = removeSummaryAndEmptyRows(rawRows);

//       setRows(cleanRows);
//     } catch (error) {
//       console.log("HOSPITALITY DASHBOARD ERROR:", error);
//       setRows([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (didLoad.current) return;

//     didLoad.current = true;
//     loadHospitality();
//   }, []);

//   const entities = useMemo(() => {
//     const sheetEntities = rows.map(getEntity).filter(Boolean);

//     return [
//       "All",
//       ...Array.from(new Set([...DEFAULT_ENTITIES, ...sheetEntities])).sort(),
//     ];
//   }, [rows]);

//   const functions = useMemo(() => {
//     const sheetFunctions = rows.map(getFunction).filter(Boolean);

//     return ["All", ...Array.from(new Set(sheetFunctions)).sort()];
//   }, [rows]);

//   const filteredRows = useMemo(() => {
//     const now = new Date();

//     return rows.filter((item) => {
//       const entity = getEntity(item);
//       const fn = getFunction(item);

//       const entityMatch = selectedEntity === "All" || entity === selectedEntity;
//       const functionMatch =
//         selectedFunction === "All" || fn === selectedFunction;

//       const dateValue =
//         item["Date"] ||
//         item["Created Date"] ||
//         item["CreatedAt"] ||
//         item["Updated Date"] ||
//         item["UpdatedAt"] ||
//         item["Joining Date"] ||
//         item["Target Date"];

//       const rowDate = parseDate(dateValue);
//       let timeMatch = true;

//       if (timeFilter !== "all") {
//         if (!rowDate) return false;

//         const diffDays =
//           (now.getTime() - rowDate.getTime()) / (1000 * 60 * 60 * 24);

//         if (timeFilter === "today") {
//           timeMatch =
//             rowDate.getDate() === now.getDate() &&
//             rowDate.getMonth() === now.getMonth() &&
//             rowDate.getFullYear() === now.getFullYear();
//         }

//         if (timeFilter === "7days") timeMatch = diffDays >= 0 && diffDays <= 7;
//         if (timeFilter === "30days") timeMatch = diffDays >= 0 && diffDays <= 30;
//         if (timeFilter === "90days") timeMatch = diffDays >= 0 && diffDays <= 90;

//         if (timeFilter === "custom") {
//           const fromDate = customFrom ? new Date(customFrom) : null;
//           const toDate = customTo ? new Date(customTo) : null;

//           if (toDate) toDate.setHours(23, 59, 59, 999);

//           if (fromDate && rowDate < fromDate) timeMatch = false;
//           if (toDate && rowDate > toDate) timeMatch = false;
//         }
//       }

//       return entityMatch && functionMatch && timeMatch;
//     });
//   }, [rows, selectedEntity, selectedFunction, timeFilter, customFrom, customTo]);

//   const summary = useMemo(() => {
//     return filteredRows.reduce(
//       (acc, item) => {
//         acc.totalPositions += toNumber(item["Total Positions"]);

//         acc.closed += toNumber(
//           item["Closed"] ||
//             item["Joined"] ||
//             item["Total Closed"] ||
//             item["Closed Positions"]
//         );

//         acc.ytj += toNumber(item["Yet to join"]);
//         acc.open += toNumber(item["Open Number"]);
//         acc.hold += toNumber(item["On Hold"]);
//         acc.vendor += toNumber(item["Closed by vendors"]);
//         acc.referral += toNumber(item["Closed by Internal referral"]);
//         acc.ta += toNumber(item["Closed by TA Team"]);

//         return acc;
//       },
//       {
//         totalPositions: 0,
//         closed: 0,
//         ytj: 0,
//         open: 0,
//         hold: 0,
//         vendor: 0,
//         referral: 0,
//         ta: 0,
//       }
//     );
//   }, [filteredRows]);

//   const cards = [
//     ["Total Positions", summary.totalPositions, "Hospitality sheet count", "c1"],
//     ["Closed", summary.closed, "Closed candidates", "c2"],
//     ["Yet to Join", summary.ytj, "Pending joining", "c3"],
//     ["Open Number", summary.open, "Current openings", "c4"],
//     ["On Hold", summary.hold, "Hold positions", "c5"],
//     ["Closed by Vendors", summary.vendor, "Vendor closures", "c6"],
//     ["Internal Referral", summary.referral, "Referral closures", "c7"],
//     ["Closed by TA Team", summary.ta, "TA closures", "c8"],
//   ];

//   const functionSummary = useMemo(() => {
//     const map = {};

//     filteredRows.forEach((item) => {
//       const fn = getFunction(item) || "Unknown";
//       map[fn] = (map[fn] || 0) + toNumber(item["Total Positions"]);
//     });

//     return Object.entries(map)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 10);
//   }, [filteredRows]);

//   const barData = {
//     labels: functionSummary.map(([name]) => name),
//     datasets: [
//       {
//         label: "Total Positions",
//         data: functionSummary.map(([, value]) => value),
//         backgroundColor: "#6c63ff",
//         borderRadius: 8,
//       },
//     ],
//   };

//   const pieData = {
//     labels: [
//       "Closed",
//       "Yet to Join",
//       "Open",
//       "On Hold",
//       "Vendor",
//       "Referral",
//       "TA Team",
//     ],
//     datasets: [
//       {
//         data: [
//           summary.closed,
//           summary.ytj,
//           summary.open,
//           summary.hold,
//           summary.vendor,
//           summary.referral,
//           summary.ta,
//         ],
//         backgroundColor: [
//           "#22c55e",
//           "#f59e0b",
//           "#3b82f6",
//           "#f97316",
//           "#8b5cf6",
//           "#14b8a6",
//           "#ec4899",
//         ],
//         borderWidth: 0,
//         hoverOffset: 0,
//       },
//     ],
//   };

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     events: [],
//     plugins: {
//       tooltip: { enabled: false },
//       legend: { display: false },
//     },
//     animation: { duration: 0 },
//     scales: {
//       y: {
//         beginAtZero: true,
//         ticks: { precision: 0 },
//       },
//     },
//   };

//   const doughnutOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     events: [],
//     cutout: "68%",
//     plugins: {
//       tooltip: { enabled: false },
//       legend: {
//         position: "bottom",
//         labels: {
//           boxWidth: 12,
//           padding: 12,
//           font: { size: 11 },
//         },
//       },
//     },
//     animation: { duration: 0 },
//   };

//   return (
//     <>
//       <h1 className="page-title">Hospitality Dashboard</h1>

//       <p className="page-subtitle">
//         Live hospitality recruitment dashboard connected with Google Sheets.
//       </p>

//       <div style={styles.filterBar}>
//         <select
//           style={styles.select}
//           value={selectedEntity}
//           onChange={(e) => setSelectedEntity(e.target.value)}
//         >
//           {entities.map((entity) => (
//             <option key={entity} value={entity}>
//               {entity === "All" ? "All Entities" : entity}
//             </option>
//           ))}
//         </select>

//         <select
//           style={styles.select}
//           value={selectedFunction}
//           onChange={(e) => setSelectedFunction(e.target.value)}
//         >
//           {functions.map((fn) => (
//             <option key={fn} value={fn}>
//               {fn === "All" ? "All Functions" : fn}
//             </option>
//           ))}
//         </select>

//         <select
//           style={styles.select}
//           value={timeFilter}
//           onChange={(e) => setTimeFilter(e.target.value)}
//         >
//           <option value="all">All Time</option>
//           <option value="today">Today</option>
//           <option value="7days">Last 7 Days</option>
//           <option value="30days">Last 30 Days</option>
//           <option value="90days">Last 90 Days</option>
//           <option value="custom">Custom Date</option>
//         </select>

//         {timeFilter === "custom" && (
//           <>
//             <input
//               style={styles.input}
//               type="date"
//               value={customFrom}
//               onChange={(e) => setCustomFrom(e.target.value)}
//             />

//             <input
//               style={styles.input}
//               type="date"
//               value={customTo}
//               onChange={(e) => setCustomTo(e.target.value)}
//             />
//           </>
//         )}

//         <button style={styles.refreshBtn} onClick={loadHospitality}>
//           Refresh
//         </button>
//       </div>

//       {loading ? (
//         <p>Loading hospitality sheet data...</p>
//       ) : (
//         <>
//           <div className="cards-grid">
//             {cards.map(([label, value, change, cls]) => (
//               <StatCard
//                 key={label}
//                 label={label}
//                 value={value}
//                 change={change}
//                 colorClass={cls}
//               />
//             ))}
//           </div>

//           <div style={styles.chartsGrid}>
//             <div style={styles.barChartCard}>
//               <h3 style={styles.chartTitle}>
//                 Hospitality Positions by Function
//               </h3>

//               <div style={styles.barChartBox}>
//                 <Bar data={barData} options={chartOptions} />
//               </div>
//             </div>

//             <div style={styles.pieChartCard}>
//               <h3 style={styles.chartTitle}>Hospitality Status Breakdown</h3>

//               <div style={styles.pieChartBox}>
//                 <Doughnut data={pieData} options={doughnutOptions} />
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </>
//   );
// }

// const styles = {
//   filterBar: {
//     display: "flex",
//     gap: "12px",
//     alignItems: "center",
//     flexWrap: "wrap",
//     margin: "18px 0 24px",
//     padding: "14px",
//     background: "#ffffff",
//     borderRadius: "18px",
//     boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
//     border: "1px solid #ececec",
//   },

//   select: {
//     height: "42px",
//     minWidth: "190px",
//     padding: "0 12px",
//     borderRadius: "12px",
//     border: "1px solid #d1d5db",
//     background: "#f9fafb",
//     color: "#111827",
//     fontSize: "14px",
//     fontWeight: "600",
//     outline: "none",
//   },

//   input: {
//     height: "42px",
//     padding: "0 12px",
//     borderRadius: "12px",
//     border: "1px solid #d1d5db",
//     background: "#f9fafb",
//     color: "#111827",
//     fontSize: "14px",
//     fontWeight: "600",
//     outline: "none",
//   },

//   refreshBtn: {
//     height: "42px",
//     padding: "0 18px",
//     border: "none",
//     borderRadius: "12px",
//     background: "#17172f",
//     color: "#ffffff",
//     fontSize: "14px",
//     fontWeight: "700",
//     cursor: "pointer",
//   },

//   chartsGrid: {
//     display: "grid",
//     gridTemplateColumns: "1.35fr 0.85fr",
//     gap: "22px",
//     marginTop: "26px",
//     alignItems: "start",
//   },

//   barChartCard: {
//     background: "#ffffff",
//     borderRadius: "24px",
//     padding: "20px",
//     height: "340px",
//     boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
//     border: "1px solid #ececec",
//     boxSizing: "border-box",
//   },

//   pieChartCard: {
//     background: "#ffffff",
//     borderRadius: "24px",
//     padding: "20px",
//     height: "340px",
//     boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
//     border: "1px solid #ececec",
//     boxSizing: "border-box",
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//   },

//   chartTitle: {
//     margin: "0 0 14px",
//     fontSize: "18px",
//     fontWeight: "700",
//     color: "#17172f",
//   },

//   barChartBox: {
//     width: "100%",
//     height: "260px",
//   },

//   pieChartBox: {
//     width: "240px",
//     height: "240px",
//   },
// };

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
  "https://talentflow-backend-ohup.onrender.com"
).replace(/\/$/, "");

const DEFAULT_ENTITIES = ["NB Club Bellezea", "Chalukya Samrat"];

export default function HospitalityDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState("All");
  const [selectedFunction, setSelectedFunction] = useState("All");
  const [timeFilter, setTimeFilter] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const didLoad = useRef(false);

  const clean = (value) => String(value ?? "").trim();

  const toNumber = (value) => {
    const num = Number(clean(value).replace(/,/g, ""));
    return Number.isFinite(num) ? num : 0;
  };

  const parseDate = (value) => {
    if (!value) return null;

    if (typeof value === "number") {
      const d = new Date(Math.round((value - 25569) * 86400 * 1000));
      return Number.isNaN(d.getTime()) ? null : d;
    }

    const text = clean(value);
    const match = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);

    if (match) {
      const d = new Date(
        Number(match[3]),
        Number(match[2]) - 1,
        Number(match[1])
      );
      return Number.isNaN(d.getTime()) ? null : d;
    }

    const d = new Date(text);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const getEntity = (item) =>
    clean(
      item["Entity"] ||
      item["Entities"] ||
      item["Project"] ||
      item["Property"] ||
      item["Hotel"] ||
      item["Unit"]
    ) || "Unknown";

  const getFunction = (item) =>
    clean(item["Function"] || item["Department"]) || "Unknown";

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

  const getVendor = (item) =>
    toNumber(item["Closed by vendors"] || item["Closed by Vendors"]);

  const getReferral = (item) =>
    toNumber(
      item["Closed by Internal referral"] ||
      item["Closed by Internal Referral"] ||
      item["Internal Referral"]
    );

  const getTA = (item) =>
    toNumber(item["Closed by TA Team"] || item["TA Team"]);

  const getRowDate = (item) =>
    parseDate(item["Date"]) ||
    parseDate(item["Created Date"]) ||
    parseDate(item["CreatedAt"]) ||
    parseDate(item["Updated Date"]) ||
    parseDate(item["UpdatedAt"]) ||
    parseDate(item["Joining Date"]) ||
    parseDate(item["Target Date"]);

  const removeSummaryAndEmptyRows = (data) => {
    return data.filter((item) => {
      if (!item) return false;

      const slNo = clean(item["Sl No."]).toLowerCase();
      const designation = clean(item["Designation"]);
      const fn = getFunction(item);
      const entity = getEntity(item);
      const status = clean(item["Status"]);

      if (slNo === "total" || slNo === "grand total") return false;
      if (!designation && !fn && !entity && !status) return false;

      return (
        designation ||
        fn !== "Unknown" ||
        entity !== "Unknown" ||
        getTotal(item) > 0 ||
        getClosed(item) > 0 ||
        getOpen(item) > 0 ||
        getYTJ(item) > 0 ||
        getHold(item) > 0
      );
    });
  };

  const loadHospitality = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const res = await fetch(`${API_BASE}/api/hospitality/dashboard`, {
        headers: { Accept: "application/json" },
      });

      const result = await res.json();

      if (!res.ok || result.success === false) {
        throw new Error(result.error || "Hospitality dashboard API failed.");
      }

      const rawRows = Array.isArray(result.data) ? result.data : [];
      setRows(removeSummaryAndEmptyRows(rawRows));
    } catch (error) {
      console.log("HOSPITALITY DASHBOARD ERROR:", error);
      setRows([]);
      setErrorMsg(error.message || "Unable to load hospitality dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didLoad.current) return;
    didLoad.current = true;
    loadHospitality();
  }, []);

  const entities = useMemo(() => {
    const sheetEntities = rows.map(getEntity).filter(Boolean);
    return [
      "All",
      ...Array.from(new Set([...DEFAULT_ENTITIES, ...sheetEntities])).sort(),
    ];
  }, [rows]);

  const functions = useMemo(() => {
    const sheetFunctions = rows.map(getFunction).filter(Boolean);
    return ["All", ...Array.from(new Set(sheetFunctions)).sort()];
  }, [rows]);

  const filteredRows = useMemo(() => {
    const now = new Date();

    return rows.filter((item) => {
      const entity = getEntity(item);
      const fn = getFunction(item);

      if (selectedEntity !== "All" && entity !== selectedEntity) return false;
      if (selectedFunction !== "All" && fn !== selectedFunction) return false;

      if (timeFilter === "all") return true;

      const rowDate = getRowDate(item);
      if (!rowDate) return false;

      const diffDays =
        (now.getTime() - rowDate.getTime()) / (1000 * 60 * 60 * 24);

      if (timeFilter === "today") {
        return rowDate.toDateString() === now.toDateString();
      }

      if (timeFilter === "7days") return diffDays >= 0 && diffDays <= 7;
      if (timeFilter === "30days") return diffDays >= 0 && diffDays <= 30;
      if (timeFilter === "90days") return diffDays >= 0 && diffDays <= 90;

      if (timeFilter === "custom") {
        if (!customFrom || !customTo) return true;

        const from = new Date(customFrom);
        from.setHours(0, 0, 0, 0);

        const to = new Date(customTo);
        to.setHours(23, 59, 59, 999);

        return rowDate >= from && rowDate <= to;
      }

      return true;
    });
  }, [rows, selectedEntity, selectedFunction, timeFilter, customFrom, customTo]);

  const summary = useMemo(() => {
    return filteredRows.reduce(
      (acc, item) => {
        acc.total += getTotal(item);
        acc.closed += getClosed(item);
        acc.ytj += getYTJ(item);
        acc.open += getOpen(item);
        acc.hold += getHold(item);
        acc.vendor += getVendor(item);
        acc.referral += getReferral(item);
        acc.ta += getTA(item);
        return acc;
      },
      {
        total: 0,
        closed: 0,
        ytj: 0,
        open: 0,
        hold: 0,
        vendor: 0,
        referral: 0,
        ta: 0,
      }
    );
  }, [filteredRows]);

  const functionWise = useMemo(() => {
    const map = {};

    filteredRows.forEach((item) => {
      const fn = getFunction(item);

      if (!map[fn]) {
        map[fn] = {
          total: 0,
          closed: 0,
          ytj: 0,
          open: 0,
          hold: 0,
          vendor: 0,
          referral: 0,
          ta: 0,
        };
      }

      map[fn].total += getTotal(item);
      map[fn].closed += getClosed(item);
      map[fn].ytj += getYTJ(item);
      map[fn].open += getOpen(item);
      map[fn].hold += getHold(item);
      map[fn].vendor += getVendor(item);
      map[fn].referral += getReferral(item);
      map[fn].ta += getTA(item);
    });

    return Object.entries(map)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10);
  }, [filteredRows]);

  const entityWise = useMemo(() => {
    const map = {};

    filteredRows.forEach((item) => {
      const entity = getEntity(item);

      if (!map[entity]) {
        map[entity] = {
          total: 0,
          closed: 0,
          open: 0,
          hold: 0,
          ytj: 0,
        };
      }

      map[entity].total += getTotal(item);
      map[entity].closed += getClosed(item);
      map[entity].open += getOpen(item);
      map[entity].hold += getHold(item);
      map[entity].ytj += getYTJ(item);
    });

    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [filteredRows]);

  const cards = [
    ["Total", summary.total, "Positions", "c1"],
    ["Closed", summary.closed, "Completed", "c2"],
    ["Open", summary.open, "Active", "c3"],
    ["YTJ", summary.ytj, "Pending", "c4"],
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    plugins: {
      tooltip: { enabled: true },
      legend: {
        display: true,
        labels: { boxWidth: 10, padding: 8, font: { size: 10 } },
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
    ...chartOptions,
    indexAxis: "y",
  };

  const stackedOptions = {
    ...chartOptions,
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
    animation: { duration: 0 },
    plugins: {
      tooltip: { enabled: true },
      legend: {
        position: "bottom",
        labels: { boxWidth: 10, padding: 8, font: { size: 10 } },
      },
    },
  };

  const labels = functionWise.map(([name]) => name);

  const functionTotalData = {
    labels,
    datasets: [
      {
        label: "Total",
        data: functionWise.map(([, v]) => v.total),
        backgroundColor: "#6366f1",
        borderRadius: 6,
      },
    ],
  };

  const functionStatusData = {
    labels,
    datasets: [
      {
        label: "Closed",
        data: functionWise.map(([, v]) => v.closed),
        backgroundColor: "#22c55e",
        borderRadius: 6,
      },
      {
        label: "Open",
        data: functionWise.map(([, v]) => v.open),
        backgroundColor: "#3b82f6",
        borderRadius: 6,
      },
      {
        label: "YTJ",
        data: functionWise.map(([, v]) => v.ytj),
        backgroundColor: "#f59e0b",
        borderRadius: 6,
      },
      {
        label: "Hold",
        data: functionWise.map(([, v]) => v.hold),
        backgroundColor: "#ef4444",
        borderRadius: 6,
      },
    ],
  };

  const functionStackedData = {
    labels,
    datasets: [
      {
        label: "Closed",
        data: functionWise.map(([, v]) => v.closed),
        backgroundColor: "#22c55e",
      },
      {
        label: "Open",
        data: functionWise.map(([, v]) => v.open),
        backgroundColor: "#3b82f6",
      },
      {
        label: "YTJ",
        data: functionWise.map(([, v]) => v.ytj),
        backgroundColor: "#f59e0b",
      },
      {
        label: "Hold",
        data: functionWise.map(([, v]) => v.hold),
        backgroundColor: "#ef4444",
      },
    ],
  };

  const closureData = {
    labels,
    datasets: [
      {
        label: "Vendor",
        data: functionWise.map(([, v]) => v.vendor),
        backgroundColor: "#14b8a6",
        borderRadius: 6,
      },
      {
        label: "TA Team",
        data: functionWise.map(([, v]) => v.ta),
        backgroundColor: "#06b6d4",
        borderRadius: 6,
      },
      {
        label: "Referral",
        data: functionWise.map(([, v]) => v.referral),
        backgroundColor: "#ec4899",
        borderRadius: 6,
      },
    ],
  };

  const openClosedData = {
    labels,
    datasets: [
      {
        label: "Closed",
        data: functionWise.map(([, v]) => v.closed),
        backgroundColor: "#16a34a",
        borderRadius: 6,
      },
      {
        label: "Open",
        data: functionWise.map(([, v]) => v.open),
        backgroundColor: "#f97316",
        borderRadius: 6,
      },
    ],
  };

  const ytjHoldData = {
    labels,
    datasets: [
      {
        label: "YTJ",
        data: functionWise.map(([, v]) => v.ytj),
        backgroundColor: "#eab308",
        borderRadius: 6,
      },
      {
        label: "Hold",
        data: functionWise.map(([, v]) => v.hold),
        backgroundColor: "#8b5cf6",
        borderRadius: 6,
      },
    ],
  };

  const entityTotalData = {
    labels: entityWise.map(([name]) => name),
    datasets: [
      {
        label: "Total",
        data: entityWise.map(([, v]) => v.total),
        backgroundColor: "#6366f1",
        borderRadius: 6,
      },
    ],
  };

  const entityStatusData = {
    labels: entityWise.map(([name]) => name),
    datasets: [
      {
        label: "Closed",
        data: entityWise.map(([, v]) => v.closed),
        backgroundColor: "#22c55e",
        borderRadius: 6,
      },
      {
        label: "Open",
        data: entityWise.map(([, v]) => v.open),
        backgroundColor: "#3b82f6",
        borderRadius: 6,
      },
      {
        label: "YTJ",
        data: entityWise.map(([, v]) => v.ytj),
        backgroundColor: "#f59e0b",
        borderRadius: 6,
      },
    ],
  };

  const statusDoughnutData = {
    labels: ["Closed", "Open", "YTJ", "Hold"],
    datasets: [
      {
        data: [summary.closed, summary.open, summary.ytj, summary.hold],
        backgroundColor: ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"],
        borderWidth: 0,
      },
    ],
  };

  const closureDoughnutData = {
    labels: ["Vendor", "TA Team", "Referral"],
    datasets: [
      {
        data: [summary.vendor, summary.ta, summary.referral],
        backgroundColor: ["#14b8a6", "#06b6d4", "#ec4899"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <>
      <h1 className="page-title">Hospitality Dashboard</h1>
      <p className="page-subtitle">Live hospitality recruitment dashboard.</p>

      <div style={styles.filterBar}>
        <select
          style={styles.select}
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value)}
        >
          {entities.map((entity) => (
            <option key={entity} value={entity}>
              {entity === "All" ? "All Entities" : entity}
            </option>
          ))}
        </select>

        <select
          style={styles.select}
          value={selectedFunction}
          onChange={(e) => setSelectedFunction(e.target.value)}
        >
          {functions.map((fn) => (
            <option key={fn} value={fn}>
              {fn === "All" ? "All Functions" : fn}
            </option>
          ))}
        </select>

        <select
          style={styles.select}
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="custom">Custom Date</option>
        </select>

        {timeFilter === "custom" && (
          <>
            <input
              style={styles.input}
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
            />

            <input
              style={styles.input}
              type="date"
              value={customTo}
              min={customFrom}
              onChange={(e) => setCustomTo(e.target.value)}
            />
          </>
        )}

        <button style={styles.refreshBtn} onClick={loadHospitality}>
          Refresh
        </button>
      </div>

      {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

      {loading ? (
        <p>Loading hospitality sheet data...</p>
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
            <ChartCard title="Function Wise Total Positions">
              <Bar data={functionTotalData} options={chartOptions} />
            </ChartCard>

            <ChartCard title="Overall Status Split">
              <Doughnut data={statusDoughnutData} options={doughnutOptions} />
            </ChartCard>

            <ChartCard title="Function Wise Status">
              <Bar data={functionStatusData} options={chartOptions} />
            </ChartCard>

            <ChartCard title="Closure Source Split">
              <Doughnut data={closureDoughnutData} options={doughnutOptions} />
            </ChartCard>

            <ChartCard title="Function Stacked Status">
              <Bar data={functionStackedData} options={stackedOptions} />
            </ChartCard>

            <ChartCard title="Function Closure Source">
              <Bar data={closureData} options={chartOptions} />
            </ChartCard>

            <ChartCard title="Function Open vs Closed">
              <Bar data={openClosedData} options={horizontalOptions} />
            </ChartCard>

            <ChartCard title="Function YTJ vs Hold">
              <Bar data={ytjHoldData} options={horizontalOptions} />
            </ChartCard>

            <ChartCard title="Entity Wise Total Positions">
              <Bar data={entityTotalData} options={horizontalOptions} />
            </ChartCard>

            <ChartCard title="Entity Wise Status">
              <Bar data={entityStatusData} options={chartOptions} />
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
  filterBar: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
    margin: "16px 0 20px",
    padding: "12px",
    background: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
    border: "1px solid #ececec",
  },

  select: {
    height: "40px",
    minWidth: "180px",
    padding: "0 12px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    background: "#f9fafb",
    color: "#111827",
    fontSize: "13px",
    fontWeight: "700",
    outline: "none",
  },

  input: {
    height: "40px",
    padding: "0 12px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    background: "#f9fafb",
    color: "#111827",
    fontSize: "13px",
    fontWeight: "700",
    outline: "none",
  },

  refreshBtn: {
    height: "40px",
    padding: "0 16px",
    border: "none",
    borderRadius: "12px",
    background: "#17172f",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
  },

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
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "16px",
    marginTop: "20px",
  },

  chartCard: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "14px",
    minHeight: "305px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
    border: "1px solid #ececec",
    boxSizing: "border-box",
  },

  chartTitle: {
    margin: "0 0 10px",
    fontSize: "15px",
    fontWeight: "800",
    color: "#17172f",
  },

  chartBox: {
    width: "100%",
    height: "245px",
  },
};