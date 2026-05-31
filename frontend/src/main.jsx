import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import "./styles/global.css";
import "./styles/auth.css";
import "./styles/layout.css";
import "./styles/dashboard.css";
import "./styles/reports.css";
import BGVDashboard from "./pages/BGVDashboard";

ReactDOM.createRoot(document.getElementById("root")).render(

  <App />


);
