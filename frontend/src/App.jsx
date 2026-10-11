import { useState } from "react";
import DriverDashboard from "./DriverDashboard";
import AdminDashboard from "./AdminDashboard";
import LiveTracking from "./LiveTracking";
import Login from "./Login";
import EmergencyReport from "./EmergencyReport";

export default function App() {
    const [page, setPage] = useState("driver");
    const [patientSession, setPatientSession] = useState(null);

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

    const handleLogin = (data) => {
        setPatientSession(data);
        setPage("report");
    };

    const handleLogout = () => {
        setPatientSession(null);
        setPage("login");
    };

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
                {navButton("report", "Emergency Report")}
            </nav>

            {page === "driver" && <DriverDashboard />}

            {page === "admin" && <AdminDashboard />}

            {page === "tracking" && (
                <main className="dashboard">
                    <LiveTracking />
                </main>
            )}

            {page === "report" && (
                patientSession ? (
                    <>
                        <div style={{ textAlign: "right", padding: "12px 24px" }}>
                            <span>
                                Patient: {patientSession.user.name}
                            </span>
                            <button
                                onClick={handleLogout}
                                style={{ marginLeft: "12px" }}
                            >
                                Logout
                            </button>
                        </div>
                        <EmergencyReport token={patientSession.token} />
                    </>
                ) : (
                    <Login
                        onLogin={handleLogin}
                        onCancel={() => setPage("driver")}
                    />
                )
            )}

            {page === "login" && (
                <Login
                    onLogin={handleLogin}
                    onCancel={() => setPage("driver")}
                />
            )}
        </>
    );
}