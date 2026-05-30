// import { useEffect, useMemo, useState } from "react";
// import StatCard from "../components/StatCard";

// const RAW_API_BASE =
//   import.meta.env.VITE_API_URL ||
//   "https://talentflow-hr-website-1jga.onrender.com";

// const API_BASE = RAW_API_BASE
//   .replace(/\/$/, "")
//   .replace(/\/api\/sheets$/i, "")
//   .replace(/\/api$/i, "");

// const STATUS_OPTIONS = [
//   "Screen Selected",
//   "Screen Rejected",
//   "Duplicate Submission",
//   "No Show",
//   "Rejected By Panel",
//   "Offer Accepted",
//   "Offer Declined",
//   "Joined",
//   "Future Reference",
// ];

// const ACTIVE_VENDOR_OPTIONS = [
//   "Sira Consulting India Pvt Ltd",
//   "Talent Corner Hr Services Private Limited",
//   "Adecco India Private Limited",
//   "On Time FS Private Limited",
// ];

// const INACTIVE_VENDOR_OPTIONS = [
//   "Talent Infinity",
//   "Formore Talent",
//   "Cernobia",
//   "R2R Consultants LLP",
//   "SMAVIS Technologies",
// ];

// const TALENT_ACQUISITION_OPTIONS = [
//   "Praveen - Talent Acquisition",
//   "Maniram - Talent Acquisition",
//   "Harish - Talent Acquisition",

// ];

// const ENTITY_OPTIONS = [
//   "Nambiar Ensemble residential Projects LLP",
//   "Sentrise Construction LLP",
//   "Nambiar Builders Private Limited",
//   "Nambiar Enterprises LLP",
// ];

// const FUNCTION_OPTIONS = [
//   "Presales",
//   "Sales",
//   "Legal",
//   "Finance & Accounts",
//   "Audit",
//   "Administration",
//   "Execution",
//   "QA/QC",
//   "MEP",
//   "Planning",
//   "QS Department",
//   "Sales & Marketing",
//   "Store Execution",
//   "Interiors & Finishing",
//   "Projects",
//   "CRM",
//   "IT",
//   "HSE",
//   "Operations",
//   "Marketing",
//   "Design",
//   "Purchase",
//   "HR",
//   "Payroll",
//   "Housekeeping",
// ];

// const WORKFORCE_OPTIONS = ["Blue-collar workforce"];

// export default function SubmissionData() {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [apiError, setApiError] = useState("");

//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   const [selectedActiveVendor, setSelectedActiveVendor] = useState("All");
//   const [selectedInactiveVendor, setSelectedInactiveVendor] = useState("All");
//   const [selectedTalentTeam, setSelectedTalentTeam] = useState("All");
//   const [selectedEntity, setSelectedEntity] = useState("All");
//   const [selectedFunction, setSelectedFunction] = useState("All");
//   const [selectedWorkforce, setSelectedWorkforce] = useState("All");

//   const cleanText = (value) => String(value || "").trim();

//   const normalizeText = (value) =>
//     cleanText(value).toLowerCase().replace(/\s+/g, " ");

//   const getValueByPossibleKeys = (item, keys) => {
//     for (const key of keys) {
//       const matchedKey = Object.keys(item || {}).find(
//         (k) => normalizeText(k) === normalizeText(key)
//       );

//       if (matchedKey) return item[matchedKey];
//     }

//     return "";
//   };

//   const getSubmittedBy = (item) =>
//     cleanText(
//       getValueByPossibleKeys(item, [
//         "Submitted By",
//         "SubmittedBy",
//         "Vendor",
//         "Source",
//         "Consultant",
//         "TA",
//         "Recruiter",
//         "Processed By",
//         "ProcessedBy",
//       ])
//     );

//   const getEntity = (item) =>
//     cleanText(
//       getValueByPossibleKeys(item, [
//         "Entity",
//         "Entities",
//         "Company",
//         "Company Name",
//         "Entity Name",
//         "Business Entity",
//       ])
//     );

//   const getFunction = (item) =>
//     cleanText(
//       getValueByPossibleKeys(item, [
//         "Function",
//         "Functions",
//         "Department",
//         "Dept",
//       ])
//     );

//   const getWorkforce = (item) =>
//     cleanText(
//       getValueByPossibleKeys(item, [
//         "Workforce",
//         "Work Force",
//         "Workforce Type",
//         "Work Force Type",
//         "Category",
//         "Employee Category",
//         "Hiring Category",
//         "Function",
//         "Department",
//       ])
//     );

//   const normalizeStatus = (value) => {
//     const text = normalizeText(value);

//     if (!text) return "";

//     if (
//       text.includes("screen selected") ||
//       text.includes("selected in screening") ||
//       text === "selected"
//     )
//       return "Screen Selected";

//     if (text.includes("screen") && text.includes("reject"))
//       return "Screen Rejected";

//     if (text.includes("duplicate")) return "Duplicate Submission";

//     if (text.includes("no show")) return "No Show";

//     if (
//       text.includes("rejected by panel") ||
//       (text.includes("panel") && text.includes("reject")) ||
//       text.includes("rejected in interview")
//     )
//       return "Rejected By Panel";

//     if (text.includes("offer") && text.includes("accept"))
//       return "Offer Accepted";

//     if (text.includes("offer") && text.includes("declin"))
//       return "Offer Declined";

//     if (text.includes("joined")) return "Joined";

//     if (
//       text.includes("future reference") ||
//       text.includes("future") ||
//       text.includes("hold")
//     )
//       return "Future Reference";

//     return cleanText(value);
//   };

//   const getStatus = (item) =>
//     normalizeStatus(
//       getValueByPossibleKeys(item, [
//         "Status",
//         "Candidate Status",
//         "Submission Status",
//       ])
//     );

//   const parseDate = (value) => {
//     if (!value) return null;

//     const text = String(value).trim();

//     if (text.includes("/")) {
//       const parts = text.split("/");
//       if (parts.length === 3) {
//         const [dd, mm, yyyy] = parts;
//         const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
//         if (!Number.isNaN(parsed.getTime())) return parsed;
//       }
//     }

//     if (text.includes("-")) {
//       const parts = text.split("-");
//       if (parts.length === 3) {
//         const [yyyy, mm, dd] = parts;
//         const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
//         if (!Number.isNaN(parsed.getTime())) return parsed;
//       }
//     }

//     const directDate = new Date(value);
//     if (!Number.isNaN(directDate.getTime())) return directDate;

//     return null;
//   };

//   const getDateValue = (item) =>
//     getValueByPossibleKeys(item, [
//       "Date of Submission",
//       "Submission Date",
//       "Submitted Date",
//       "Date",
//     ]);

//   const getDate = (item) => parseDate(getDateValue(item));

//   const getDateOnlyTime = (date) => {
//     if (!date) return null;

//     return new Date(
//       date.getFullYear(),
//       date.getMonth(),
//       date.getDate()
//     ).getTime();
//   };

//   const isDateInRange = (itemDate) => {
//     if (!fromDate && !toDate) return true;
//     if (!itemDate) return false;

//     const rowTime = getDateOnlyTime(itemDate);
//     const fromTime = fromDate ? getDateOnlyTime(parseDate(fromDate)) : null;
//     const toTime = toDate ? getDateOnlyTime(parseDate(toDate)) : null;

//     if (fromTime && rowTime < fromTime) return false;
//     if (toTime && rowTime > toTime) return false;

//     return true;
//   };

//   const isMatched = (actual, selected) =>
//     selected === "All" || normalizeText(actual) === normalizeText(selected);

//   const loadData = async () => {
//     try {
//       setLoading(true);
//       setApiError("");

//       const res = await fetch(`${API_BASE}/api/sheets/reports`, {
//         method: "GET",
//         headers: {
//           Accept: "application/json",
//         },
//       });

//       const text = await res.text();
//       let result = {};

//       try {
//         result = text ? JSON.parse(text) : {};
//       } catch {
//         throw new Error(`Invalid JSON response (${res.status})`);
//       }

//       if (!res.ok || result.success === false) {
//         throw new Error(
//           result.error ||
//             result.message ||
//             `Backend request failed (${res.status})`
//         );
//       }

//       const data = Array.isArray(result.data) ? result.data : [];

//       const validRows = data.filter((item) =>
//         Object.values(item || {}).some((value) => cleanText(value))
//       );

//       setRows(validRows);
//     } catch (error) {
//       console.error("SUBMISSION DATA ERROR:", error);
//       setApiError(error.message || "Unable to load submission data");
//       setRows([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   const filteredRows = useMemo(() => {
//     return rows.filter((item) => {
//       const submittedBy = getSubmittedBy(item);
//       const entityName = getEntity(item);
//       const functionName = getFunction(item);
//       const workforceName = getWorkforce(item);
//       const itemDate = getDate(item);

//       return (
//         isDateInRange(itemDate) &&
//         isMatched(submittedBy, selectedActiveVendor) &&
//         isMatched(submittedBy, selectedInactiveVendor) &&
//         isMatched(submittedBy, selectedTalentTeam) &&
//         isMatched(entityName, selectedEntity) &&
//         isMatched(functionName, selectedFunction) &&
//         isMatched(workforceName, selectedWorkforce)
//       );
//     });
//   }, [
//     rows,
//     fromDate,
//     toDate,
//     selectedActiveVendor,
//     selectedInactiveVendor,
//     selectedTalentTeam,
//     selectedEntity,
//     selectedFunction,
//     selectedWorkforce,
//   ]);

//   const statusCounts = useMemo(() => {
//     const counts = {};

//     STATUS_OPTIONS.forEach((status) => {
//       counts[status] = 0;
//     });

//     filteredRows.forEach((item) => {
//       const status = getStatus(item);
//       if (counts[status] !== undefined) counts[status] += 1;
//     });

//     return counts;
//   }, [filteredRows]);

//   const clearFilters = () => {
//     setFromDate("");
//     setToDate("");
//     setSelectedActiveVendor("All");
//     setSelectedInactiveVendor("All");
//     setSelectedTalentTeam("All");
//     setSelectedEntity("All");
//     setSelectedFunction("All");
//     setSelectedWorkforce("All");
//   };

//   return (
//     <>
//       <h1 className="page-title">NB Submission Data</h1>

//       <p className="page-subtitle">
//         Submission dashboard with date range, vendor, processed by, entity,
//         function, workforce and status filters.
//       </p>

//       {apiError && (
//         <div style={styles.errorBox}>
//           <strong>Backend Error:</strong> {apiError}
//         </div>
//       )}

//       <div style={styles.filterBar}>
//         <div style={styles.dateGroup}>
//           <label style={styles.label}>From Date</label>
//           <input
//             style={styles.input}
//             type="date"
//             value={fromDate}
//             onChange={(e) => setFromDate(e.target.value)}
//           />
//         </div>

//         <div style={styles.dateGroup}>
//           <label style={styles.label}>To Date</label>
//           <input
//             style={styles.input}
//             type="date"
//             value={toDate}
//             onChange={(e) => setToDate(e.target.value)}
//           />
//         </div>

//         <select
//           style={styles.select}
//           value={selectedActiveVendor}
//           onChange={(e) => {
//             setSelectedActiveVendor(e.target.value);
//             setSelectedInactiveVendor("All");
//             setSelectedTalentTeam("All");
//           }}
//         >
//           <option value="All">Active Vendors</option>
//           {ACTIVE_VENDOR_OPTIONS.map((name) => (
//             <option key={name} value={name}>
//               {name}
//             </option>
//           ))}
//         </select>

//         <select
//           style={styles.select}
//           value={selectedInactiveVendor}
//           onChange={(e) => {
//             setSelectedInactiveVendor(e.target.value);
//             setSelectedActiveVendor("All");
//             setSelectedTalentTeam("All");
//           }}
//         >
//           <option value="All">Inactive Vendors</option>
//           {INACTIVE_VENDOR_OPTIONS.map((name) => (
//             <option key={name} value={name}>
//               {name}
//             </option>
//           ))}
//         </select>

//         <select
//           style={styles.select}
//           value={selectedTalentTeam}
//           onChange={(e) => {
//             setSelectedTalentTeam(e.target.value);
//             setSelectedActiveVendor("All");
//             setSelectedInactiveVendor("All");
//           }}
//         >
//           <option value="All">Processed By</option>
//           {TALENT_ACQUISITION_OPTIONS.map((name) => (
//             <option key={name} value={name}>
//               {name}
//             </option>
//           ))}
//         </select>

//         <select
//           style={styles.select}
//           value={selectedEntity}
//           onChange={(e) => setSelectedEntity(e.target.value)}
//         >
//           <option value="All">All Entities</option>
//           {ENTITY_OPTIONS.map((entity) => (
//             <option key={entity} value={entity}>
//               {entity}
//             </option>
//           ))}
//         </select>

//         <select
//           style={styles.select}
//           value={selectedFunction}
//           onChange={(e) => setSelectedFunction(e.target.value)}
//         >
//           <option value="All">All Functions</option>
//           {FUNCTION_OPTIONS.map((fn) => (
//             <option key={fn} value={fn}>
//               {fn}
//             </option>
//           ))}
//         </select>

//         <select
//           style={styles.select}
//           value={selectedWorkforce}
//           onChange={(e) => setSelectedWorkforce(e.target.value)}
//         >
//           <option value="All">Workforce</option>
//           {WORKFORCE_OPTIONS.map((item) => (
//             <option key={item} value={item}>
//               {item}
//             </option>
//           ))}
//         </select>

//         <button style={styles.refreshBtn} onClick={loadData}>
//           Refresh
//         </button>

//         <button style={styles.clearBtn} onClick={clearFilters}>
//           Clear
//         </button>
//       </div>

//       {loading ? (
//         <p>Loading submission data...</p>
//       ) : (
//         <div className="cards-grid">
//           <StatCard
//             label="Total Submissions"
//             value={filteredRows.length}
//             change="Filtered submissions"
//             colorClass="c1"
//           />

//           {STATUS_OPTIONS.map((status, index) => (
//             <StatCard
//               key={status}
//               label={status}
//               value={statusCounts[status] || 0}
//               change="Status count"
//               colorClass={`c${(index % 8) + 2}`}
//             />
//           ))}
//         </div>
//       )}
//     </>
//   );
// }

// const styles = {
//   errorBox: {
//     background: "#fee2e2",
//     color: "#991b1b",
//     border: "1px solid #fecaca",
//     padding: "14px 16px",
//     borderRadius: "14px",
//     margin: "18px 0",
//     fontWeight: "700",
//   },

//   filterBar: {
//     display: "flex",
//     gap: "12px",
//     alignItems: "flex-end",
//     flexWrap: "wrap",
//     margin: "18px 0 24px",
//     padding: "14px",
//     background: "#ffffff",
//     borderRadius: "18px",
//     border: "1px solid #bbf7d0",
//   },

//   dateGroup: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "6px",
//   },

//   label: {
//     fontSize: "12px",
//     fontWeight: "800",
//     color: "#14532d",
//   },

//   select: {
//     height: "42px",
//     minWidth: "260px",
//     padding: "0 12px",
//     borderRadius: "12px",
//     border: "1px solid #bbf7d0",
//     background: "#f9fafb",
//     fontWeight: "700",
//   },

//   input: {
//     height: "42px",
//     minWidth: "180px",
//     padding: "0 12px",
//     borderRadius: "12px",
//     border: "1px solid #bbf7d0",
//     background: "#f9fafb",
//     fontWeight: "700",
//   },

//   refreshBtn: {
//     height: "42px",
//     padding: "0 20px",
//     border: "none",
//     borderRadius: "12px",
//     background: "#16a34a",
//     color: "#ffffff",
//     fontWeight: "800",
//     cursor: "pointer",
//   },

//   clearBtn: {
//     height: "42px",
//     padding: "0 20px",
//     border: "1px solid #16a34a",
//     borderRadius: "12px",
//     background: "#ffffff",
//     color: "#14532d",
//     fontWeight: "800",
//     cursor: "pointer",
//   },
// };

import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";

const RAW_API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://talentflow-backend-ohup.onrender.com";

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
  "SMAVIS Technologies",
];

const TALENT_ACQUISITION_OPTIONS = [
  "Praveen - Talent Acquisition",
  "Maniram - Talent Acquisition",
  "Harish - Talent Acquisition",

];

const ENTITY_OPTIONS = [
  "Nambiar Ensemble residential Projects LLP",
  "Sentrise Construction LLP",
  "Nambiar Builders Private Limited",
  "Nambiar Enterprises LLP",
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
  "Facility Management",
];

const WORKFORCE_OPTIONS = ["Blue-collar workforce"];

export default function SubmissionData() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selectedActiveVendor, setSelectedActiveVendor] = useState("All");
  const [selectedInactiveVendor, setSelectedInactiveVendor] = useState("All");
  const [selectedTalentTeam, setSelectedTalentTeam] = useState("All");
  const [selectedEntity, setSelectedEntity] = useState("All");
  const [selectedFunction, setSelectedFunction] = useState("All");
  const [selectedWorkforce, setSelectedWorkforce] = useState("All");

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
        "Vendor Name",
        "Source",
        "Consultant",
        "Consultancy",
      ])
    );

  const getProcessedBy = (item) =>
    cleanText(
      getValueByPossibleKeys(item, [
        "Processed By",
        "ProcessedBy",
        "Processed by",
        "Process By",
        "ProcessBy",
        "TA",
        "Talent Acquisition",
        "Recruiter",
        "Handled By",
        "HandledBy",
        "Owner",
      ])
    );

  const getEntity = (item) =>
    cleanText(
      getValueByPossibleKeys(item, [
        "Entity",
        "Entities",
        "Company",
        "Company Name",
        "Entity Name",
        "Business Entity",
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

  const getWorkforce = (item) =>
    cleanText(
      getValueByPossibleKeys(item, [
        "Workforce",
        "Work Force",
        "Workforce Type",
        "Work Force Type",
        "Category",
        "Employee Category",
        "Hiring Category",
        "Function",
        "Department",
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

  const getDateValue = (item) =>
    getValueByPossibleKeys(item, [
      "Date of Submission",
      "Submission Date",
      "Submitted Date",
      "Date",
    ]);

  const getDate = (item) => parseDate(getDateValue(item));

  const getDateOnlyTime = (date) => {
    if (!date) return null;

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();
  };

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
      const processedBy = getProcessedBy(item);
      const entityName = getEntity(item);
      const functionName = getFunction(item);
      const workforceName = getWorkforce(item);
      const itemDate = getDate(item);

      return (
        isDateInRange(itemDate) &&
        isMatched(submittedBy, selectedActiveVendor) &&
        isMatched(submittedBy, selectedInactiveVendor) &&
        isMatched(processedBy, selectedTalentTeam) &&
        isMatched(entityName, selectedEntity) &&
        isMatched(functionName, selectedFunction) &&
        isMatched(workforceName, selectedWorkforce)
      );
    });
  }, [
    rows,
    fromDate,
    toDate,
    selectedActiveVendor,
    selectedInactiveVendor,
    selectedTalentTeam,
    selectedEntity,
    selectedFunction,
    selectedWorkforce,
  ]);

  const statusCounts = useMemo(() => {
    const counts = {};

    STATUS_OPTIONS.forEach((status) => {
      counts[status] = 0;
    });

    filteredRows.forEach((item) => {
      const status = getStatus(item);
      if (counts[status] !== undefined) counts[status] += 1;
    });

    return counts;
  }, [filteredRows]);

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setSelectedActiveVendor("All");
    setSelectedInactiveVendor("All");
    setSelectedTalentTeam("All");
    setSelectedEntity("All");
    setSelectedFunction("All");
    setSelectedWorkforce("All");
  };

  return (
    <>
      <h1 className="page-title">NB Submission Data</h1>

      <p className="page-subtitle">
        Submission dashboard with date range, vendor, processed by, entity,
        function, workforce and status filters.
      </p>

      {apiError && (
        <div style={styles.errorBox}>
          <strong>Backend Error:</strong> {apiError}
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

        <select
          style={styles.select}
          value={selectedActiveVendor}
          onChange={(e) => {
            setSelectedActiveVendor(e.target.value);
            setSelectedInactiveVendor("All");
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
          onChange={(e) => setSelectedTalentTeam(e.target.value)}
        >
          <option value="All">Processed By</option>
          {TALENT_ACQUISITION_OPTIONS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <select
          style={styles.select}
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value)}
        >
          <option value="All">All Entities</option>
          {ENTITY_OPTIONS.map((entity) => (
            <option key={entity} value={entity}>
              {entity}
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

        <select
          style={styles.select}
          value={selectedWorkforce}
          onChange={(e) => setSelectedWorkforce(e.target.value)}
        >
          <option value="All">Workforce</option>
          {WORKFORCE_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {item}
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
    alignItems: "flex-end",
    flexWrap: "wrap",
    margin: "18px 0 24px",
    padding: "14px",
    background: "#ffffff",
    borderRadius: "18px",
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