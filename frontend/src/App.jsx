import { useState } from "react";

import Sidebar, { SIDEBAR_WIDTH } from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import HospitalityDashboard from "./pages/HospitalityDashboard";
import HospitalityReports from "./pages/HospitalityReports";

import SubmissionData from "./pages/SubmissionData";
import InternshipData from "./pages/InternshipData";
import OffersData from "./pages/OffersData";
import BGVDashboard from "./pages/BGVDashboard";

import "./index.css";

export default function App() {
  const [page, setPage] = useState("dashboard");

  const renderPage = () => {
    switch (page) {
      case "reports":
        return <Reports />;

      case "submission-data":
        return <SubmissionData />;

      case "internship-data":
        return <InternshipData />;

      case "offers-data":
        return <OffersData />;

      case "hospitality":
        return <HospitalityDashboard />;

      case "hospitality-reports":
        return <HospitalityReports />;

      case "dashboard":
      default:
        return <Dashboard />;

      case "bgv-dashboard":
        return <BGVDashboard />;
    }
  };

  return (
    <div style={styles.appLayout}>
      <Sidebar page={page} setPage={setPage} />

      <main style={styles.mainContent}>{renderPage()}</main>
    </div>
  );
}

const styles = {
  appLayout: {
    width: "100%",
    minHeight: "100vh",
    background: "#f7f5f1",
    overflowX: "hidden",
  },

  mainContent: {
    marginLeft: `${SIDEBAR_WIDTH}px`,
    width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
    minHeight: "100vh",
    padding: "32px",
    boxSizing: "border-box",
    overflowX: "hidden",
  },
};
