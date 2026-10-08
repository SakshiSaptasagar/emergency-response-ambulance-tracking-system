
import { useState } from "react";
import DriverDashboard from "./DriverDashboard";
import AdminDashboard from "./AdminDashboard";
import LiveTracking from "./LiveTracking";

export default function App() {
    const [page, setPage] = useState("driver");

    const navButton = (value, label) => (
        <button
            onClick={() => setPage(value)}
            style={{
                background: page === value ? "#dc2626" : "#374151",
            }}
        >
            {label}
        </button>
    );

    return (
        <>
            <nav
                style={{
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    padding: "16px",
                    background: "#111827",
                }}
            >
                {navButton("driver", "Driver Dashboard")}
                {navButton("admin", "Admin Dashboard")}
                {navButton("tracking", "Live Tracking")}
            </nav>

            {page === "driver" && <DriverDashboard />}
            {page === "admin" && <AdminDashboard />}
            {page === "tracking" && <main className="dashboard"><LiveTracking /></main>}
        </>
    );
}
