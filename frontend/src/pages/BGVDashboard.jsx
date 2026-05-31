import { useEffect, useMemo, useState } from "react";

const API_BASE =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

/* =========================================
   STATIC FILTERS
========================================= */

const MONTHS = [
    "All Months",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const CATEGORIES = [
    "All Categories",
    "Experienced",
    "Blue-collar workforce",
    "Fresher",
    "Resigned",
    "Intern",
];

const ENTITIES = [
    "All Entities",
    "Nambiar Ensemble residential Projects LLP",
    "Sentrise Construction LLP",
    "Nambiar Builders Private Limited",
    "Nambiar Enterprises LLP",
    "Chalukya Samrat",
    "NB Club Bellezea",
];

const STATUS_LIST = [
    {
        key: "Initiated - Awaiting Input",
        color: "#7c3aed",
        footer: "Pending Input",
    },
    {
        key: "Yet To Initiate",
        color: "#2563eb",
        footer: "Pending Initiation",
    },
    {
        key: "In Progress",
        color: "#f59e0b",
        footer: "Verification Running",
    },
    {
        key: "Completed",
        color: "#22c55e",
        footer: "Completed Cases",
    },
    {
        key: "Not Cleared",
        color: "#ef4444",
        footer: "Failed Verification",
    },
    {
        key: "Not Required",
        color: "#06b6d4",
        footer: "No Verification",
    },
];

/* =========================================
   COMPONENT
========================================= */

export default function BGVPage() {
    const [bgvData, setBgvData] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [selectedMonth, setSelectedMonth] =
        useState("All Months");

    const [
        selectedCategory,
        setSelectedCategory,
    ] = useState("All Categories");

    const [selectedEntity, setSelectedEntity] =
        useState("All Entities");

    /* =========================================
       FETCH DATA
    ========================================= */

    useEffect(() => {
        fetchBGVData();
    }, []);

    const fetchBGVData = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${API_BASE}/api/sheets/bgv`
            );

            const result =
                await response.json();

            console.log(
                "BGV API RESPONSE:",
                result
            );

            /* =========================================
               FIX FOR ARRAY RESPONSE
            ========================================= */

            if (Array.isArray(result)) {
                setBgvData(result);
            } else if (
                result.success &&
                Array.isArray(result.data)
            ) {
                setBgvData(result.data);
            } else {
                setBgvData([]);
            }
        } catch (error) {
            console.error(
                "BGV Fetch Error:",
                error
            );

            setBgvData([]);
        } finally {
            setLoading(false);
        }
    };

    /* =========================================
       FILTERED DATA
    ========================================= */

    const filteredData = useMemo(() => {
        return bgvData.filter((item) => {
            const month =
                item.Month ||
                item.MONTH ||
                item.month ||
                "";

            const category =
                item.Category ||
                item.CATEGORY ||
                item.category ||
                "";

            const entity =
                item.Entity ||
                item.ENTITY ||
                item.entity ||
                "";

            const monthMatch =
                selectedMonth === "All Months" ||
                month
                    .toLowerCase()
                    .includes(
                        selectedMonth.toLowerCase()
                    );

            const categoryMatch =
                selectedCategory ===
                "All Categories" ||
                category
                    .toLowerCase()
                    .trim() ===
                selectedCategory
                    .toLowerCase()
                    .trim();

            const entityMatch =
                selectedEntity ===
                "All Entities" ||
                entity
                    .toLowerCase()
                    .trim() ===
                selectedEntity
                    .toLowerCase()
                    .trim();

            return (
                monthMatch &&
                categoryMatch &&
                entityMatch
            );
        });
    }, [
        bgvData,
        selectedMonth,
        selectedCategory,
        selectedEntity,
    ]);

    /* =========================================
       STATUS CARDS
    ========================================= */

    const STATUS_CARDS = useMemo(() => {
        return STATUS_LIST.map((status) => {
            const count = filteredData.filter(
                (item) => {
                    const value =
                        item.Status ||
                        item.STATUS ||
                        item.status ||
                        "";

                    return (
                        value
                            .toLowerCase()
                            .trim() ===
                        status.key
                            .toLowerCase()
                            .trim()
                    );
                }
            ).length;

            return {
                ...status,
                count,
            };
        });
    }, [filteredData]);

    /* =========================================
       LOADING
    ========================================= */

    if (loading) {
        return (
            <div style={styles.loader}>
                Loading BGV Dashboard...
            </div>
        );
    }

    /* =========================================
       UI
    ========================================= */

    return (
        <div style={styles.container}>
            {/* HEADER */}

            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        BGV Dashboard
                    </h1>

                    <p style={styles.subtitle}>
                        Background Verification
                        Status Monitoring
                    </p>
                </div>

                <button
                    onClick={fetchBGVData}
                    style={styles.refreshButton}
                >
                    Refresh
                </button>
            </div>

            {/* FILTERS */}

            <div style={styles.filterWrapper}>
                <select
                    value={selectedMonth}
                    onChange={(e) =>
                        setSelectedMonth(
                            e.target.value
                        )
                    }
                    style={styles.select}
                >
                    {MONTHS.map((month) => (
                        <option
                            key={month}
                            value={month}
                        >
                            {month}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedCategory}
                    onChange={(e) =>
                        setSelectedCategory(
                            e.target.value
                        )
                    }
                    style={styles.select}
                >
                    {CATEGORIES.map((item) => (
                        <option
                            key={item}
                            value={item}
                        >
                            {item}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedEntity}
                    onChange={(e) =>
                        setSelectedEntity(
                            e.target.value
                        )
                    }
                    style={styles.select}
                >
                    {ENTITIES.map((item) => (
                        <option
                            key={item}
                            value={item}
                        >
                            {item}
                        </option>
                    ))}
                </select>
            </div>

            {/* SUMMARY */}

            <div style={styles.summaryBar}>
                <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>
                        Total Records:
                    </span>

                    <span style={styles.summaryValue}>
                        {filteredData.length}
                    </span>
                </div>

                <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>
                        Month:
                    </span>

                    <span style={styles.summaryValue}>
                        {selectedMonth}
                    </span>
                </div>

                <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>
                        Category:
                    </span>

                    <span style={styles.summaryValue}>
                        {selectedCategory}
                    </span>
                </div>

                <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>
                        Entity:
                    </span>

                    <span style={styles.summaryValue}>
                        {selectedEntity}
                    </span>
                </div>
            </div>

            {/* STATUS CARDS */}

            <div style={styles.grid}>
                {STATUS_CARDS.map((card) => (
                    <div
                        key={card.key}
                        style={{
                            ...styles.card,
                            borderBottom: `6px solid ${card.color}`,
                        }}
                    >
                        <div style={styles.cardTitle}>
                            {card.key}
                        </div>

                        <div style={styles.cardCount}>
                            {card.count}
                        </div>

                        <div
                            style={{
                                ...styles.cardFooter,
                                color: card.color,
                            }}
                        >
                            {card.footer}
                        </div>
                    </div>
                ))}
            </div>

            {/* TABLE */}

            <div style={styles.tableWrapper}>
                <div style={styles.tableHeader}>
                    BGV Records
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>
                                    Candidate Name
                                </th>

                                <th style={styles.th}>
                                    Category
                                </th>

                                <th style={styles.th}>
                                    Entity
                                </th>

                                <th style={styles.th}>
                                    Month
                                </th>

                                <th style={styles.th}>
                                    Status
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredData.length >
                                0 ? (
                                filteredData.map(
                                    (item, index) => (
                                        <tr key={index}>
                                            <td style={styles.td}>
                                                {item[
                                                    "Candidate Name"
                                                ] ||
                                                    item.Name ||
                                                    item.Candidate ||
                                                    "-"}
                                            </td>

                                            <td style={styles.td}>
                                                {item.Category ||
                                                    item.CATEGORY ||
                                                    "-"}
                                            </td>

                                            <td style={styles.td}>
                                                {item.Entity ||
                                                    item.ENTITY ||
                                                    "-"}
                                            </td>

                                            <td style={styles.td}>
                                                {item.Month ||
                                                    item.MONTH ||
                                                    "-"}
                                            </td>

                                            <td style={styles.td}>
                                                <span
                                                    style={
                                                        styles.statusBadge
                                                    }
                                                >
                                                    {item.Status ||
                                                        item.STATUS ||
                                                        "-"}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                )
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        style={
                                            styles.emptyRow
                                        }
                                    >
                                        No Data Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

/* =========================================
   STYLES
========================================= */

const styles = {
    container: {
        width: "100%",
        minHeight: "100vh",
        padding: "24px",
        background: "#f5f2e9",
        boxSizing: "border-box",
    },

    loader: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "28px",
        fontWeight: "800",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        flexWrap: "wrap",
        gap: "16px",
    },

    title: {
        margin: 0,
        fontSize: "34px",
        fontWeight: "900",
        color: "#1f2937",
    },

    subtitle: {
        marginTop: "8px",
        color: "#6b7280",
        fontWeight: "600",
    },

    refreshButton: {
        border: "none",
        background: "#84cc16",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: "12px",
        fontWeight: "700",
        cursor: "pointer",
        fontSize: "14px",
    },

    filterWrapper: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
        marginBottom: "22px",
    },

    select: {
        height: "50px",
        borderRadius: "14px",
        border: "1px solid #e5e7eb",
        padding: "0 14px",
        fontSize: "14px",
        fontWeight: "600",
        background: "#fff",
        outline: "none",
    },

    summaryBar: {
        display: "flex",
        flexWrap: "wrap",
        gap: "18px",
        background: "#ffffff",
        padding: "16px 20px",
        borderRadius: "20px",
        marginBottom: "24px",
        boxShadow:
            "0 4px 14px rgba(0,0,0,0.05)",
    },

    summaryItem: {
        display: "flex",
        gap: "8px",
        alignItems: "center",
    },

    summaryLabel: {
        fontWeight: "800",
        color: "#374151",
    },

    summaryValue: {
        fontWeight: "700",
        color: "#7c3aed",
    },

    grid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "18px",
        marginBottom: "28px",
    },

    card: {
        background: "#fff",
        borderRadius: "24px",
        padding: "22px",
        minHeight: "180px",
        boxShadow:
            "0 6px 18px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
    },

    cardTitle: {
        fontSize: "18px",
        fontWeight: "700",
        color: "#6b7280",
        lineHeight: "28px",
    },

    cardCount: {
        fontSize: "58px",
        fontWeight: "900",
        color: "#111827",
        lineHeight: "1",
    },

    cardFooter: {
        fontSize: "15px",
        fontWeight: "700",
    },

    tableWrapper: {
        background: "#fff",
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow:
            "0 6px 18px rgba(0,0,0,0.06)",
    },

    tableHeader: {
        padding: "20px",
        fontSize: "22px",
        fontWeight: "900",
        borderBottom: "1px solid #eee",
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        minWidth: "900px",
    },

    th: {
        background: "#f9fafb",
        padding: "16px",
        textAlign: "left",
        fontWeight: "800",
        color: "#374151",
        fontSize: "14px",
    },

    td: {
        padding: "16px",
        borderBottom: "1px solid #eee",
        fontSize: "14px",
        color: "#374151",
        fontWeight: "600",
    },

    statusBadge: {
        padding: "8px 14px",
        borderRadius: "10px",
        background: "#dcfce7",
        color: "#166534",
        fontWeight: "700",
        fontSize: "13px",
        display: "inline-block",
    },

    emptyRow: {
        textAlign: "center",
        padding: "40px",
        fontSize: "18px",
        fontWeight: "700",
        color: "#9ca3af",
    },
};