
import { useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000";

export default function DriverDashboard() {
    const [token, setToken] = useState("");
    const [assignments, setAssignments] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const login = async () => {
        try {
            setLoading(true);
            setMessage("Logging in...");

            const response = await axios.post(`${API}/api/auth/login`, {
                email: "driver@test.com",
                password: "Driver@123",
            });

            const newToken = response.data.token;
            setToken(newToken);
            await loadAssignments(newToken);
        } catch (error) {
            setMessage(error.response?.data?.message || "Login failed.");
        } finally {
            setLoading(false);
        }
    };

    const loadAssignments = async (currentToken = token) => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${API}/api/assignments/driver`,
                {
                    headers: {
                        Authorization: `Bearer ${currentToken}`,
                    },
                }
            );

            setAssignments(response.data.assignments || []);
            setMessage("Assignments loaded successfully.");
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to load assignments."
            );
        } finally {
            setLoading(false);
        }
    };

    const updateAssignment = async (id, action) => {
        try {
            setLoading(true);

            const response = await axios.patch(
                `${API}/api/assignments/${id}/${action}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMessage(response.data.message);
            await loadAssignments();
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to update assignment."
            );
        } finally {
            setLoading(false);
        }
    };

    const completed = assignments.filter(
        (item) => item.status === "COMPLETED"
    ).length;

    const active = assignments.filter(
        (item) => ["PENDING", "ACCEPTED"].includes(item.status)
    ).length;

    return (
        <main className="dashboard">
            <header className="dashboard-header">
                <div>
                    <p className="eyebrow">EMERGENCY SERVICES</p>
                    <h1>Ambulance Response System</h1>
                    <p className="subtitle">Driver Operations Dashboard</p>
                </div>
                <div className="header-icon">🚑</div>
            </header>

            {!token ? (
                <section className="login-panel">
                    <h2>Driver Login</h2>
                    <p>Sign in to view and manage your ambulance assignments.</p>
                    <button onClick={login} disabled={loading}>
                        {loading ? "Please wait..." : "Login as Driver"}
                    </button>
                </section>
            ) : (
                <>
                    <section className="stats">
                        <div className="stat-card">
                            <span>Total Assignments</span>
                            <strong>{assignments.length}</strong>
                        </div>
                        <div className="stat-card">
                            <span>Active Assignments</span>
                            <strong>{active}</strong>
                        </div>
                        <div className="stat-card">
                            <span>Completed</span>
                            <strong>{completed}</strong>
                        </div>
                    </section>

                    <div className="section-heading">
                        <div>
                            <h2>My Assignments</h2>
                            <p>Review emergency details and update progress.</p>
                        </div>
                        <button
                            className="secondary-button"
                            onClick={() => loadAssignments()}
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "↻ Refresh"}
                        </button>
                    </div>

                    <section className="assignment-list">
                        {assignments.map((item) => (
                            <article className="assignment-card" key={item.id}>
                                <div className="assignment-top">
                                    <div>
                                        <span className="assignment-label">
                                            ASSIGNMENT #{item.id}
                                        </span>
                                        <h3>{item.emergency_type || "Emergency"}</h3>
                                    </div>
                                    <span
                                        className={`status status-${String(item.status).toLowerCase()}`}
                                    >
                                        {item.status.replace("_", " ")}
                                    </span>
                                </div>

                                <div className="details-grid">
                                    <div>
                                        <span>Emergency ID</span>
                                        <strong>{item.emergency_id}</strong>
                                    </div>
                                    <div>
                                        <span>Ambulance</span>
                                        <strong>{item.vehicle_number}</strong>
                                    </div>
                                    <div>
                                        <span>Ambulance Type</span>
                                        <strong>{item.ambulance_type}</strong>
                                    </div>
                                    <div>
                                        <span>Priority</span>
                                        <strong>{item.priority || "—"}</strong>
                                    </div>
                                </div>

                                <div className="pickup-address">
                                    <span>Pickup Location</span>
                                    <p>{item.pickup_address || "Address unavailable"}</p>
                                </div>

                                {item.description && (
                                    <p className="description">{item.description}</p>
                                )}

                                {item.status === "PENDING" && (
                                    <button
                                        onClick={() => updateAssignment(item.id, "accept")}
                                        disabled={loading}
                                    >
                                        Accept Assignment
                                    </button>
                                )}

                                {item.status === "ACCEPTED" && (
                                    <button
                                        onClick={() => updateAssignment(item.id, "complete")}
                                        disabled={loading}
                                    >
                                        Complete Assignment
                                    </button>
                                )}
                            </article>
                        ))}

                        {assignments.length === 0 && (
                            <div className="empty-state">
                                <span>🚑</span>
                                <h3>No assignments found</h3>
                                <p>New assignments will appear here.</p>
                            </div>
                        )}
                    </section>
                </>
            )}

            {message && <p className="message">{message}</p>}

            <footer>Emergency Response & Ambulance Tracking System</footer>
        </main>
    );
}
