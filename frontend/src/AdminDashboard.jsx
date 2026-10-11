import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://emergency-response-backend-gf1v.onrender.com";

export default function AdminDashboard() {
    const [token, setToken] = useState("");
    const [emergencies, setEmergencies] = useState([]);
    const [ambulances, setAmbulances] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("admin@test.com");
    const [password, setPassword] = useState("Admin@123");
    const [loading, setLoading] = useState(false);

    const request = (path, options = {}) =>
        axios({
            url: `${API}${path}`,
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`,
            },
        });

    const login = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            const response = await axios.post(`${API}/api/auth/login`, {
                email,
                password,
            });

            if (!response.data?.token) {
                setMessage("Login failed: the server did not return a token.");
                return;
            }

            setToken(response.data.token);
            setMessage("Login successful. Loading dashboard...");
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                (error.response
                    ? `Login failed (HTTP ${error.response.status}).`
                    : "Cannot connect to the backend. Please try again.")
            );
        } finally {
            setLoading(false);
        }
    };

    const loadDashboard = async () => {
        try {
            setLoading(true);

            const [e, a, s] = await Promise.all([
                request("/api/emergency/all"),
                request("/api/ambulances"),
                request("/api/assignments"),
            ]);

            setEmergencies(e.data.emergencies || e.data.requests || []);
            setAmbulances(a.data.ambulances || []);
            setAssignments(s.data.assignments || []);
            setMessage("Dashboard data loaded successfully.");
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                `Could not load dashboard data${error.response ? ` (HTTP ${error.response.status})` : ". Check your internet connection."}`
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            loadDashboard();
        }
    }, [token]);

    if (!token) {
        return (
            <main className="dashboard">
                <header className="dashboard-header">
                    <div>
                        <p className="eyebrow">EMERGENCY SERVICES</p>
                        <h1>Admin Dashboard</h1>
                        <p className="subtitle">
                            Manage emergency requests and ambulances
                        </p>
                    </div>
                    <div className="header-icon">🚑</div>
                </header>

                <form className="login-panel" onSubmit={login}>
                    <h2>Administrator Login</h2>

                    <label>
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </label>

                    <button type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Login"}
                    </button>

                    {message && <p>{message}</p>}
                </form>
            </main>
        );
    }

    return (
        <main className="dashboard">
            <header className="dashboard-header">
                <div>
                    <p className="eyebrow">EMERGENCY SERVICES</p>
                    <h1>Admin Dashboard</h1>
                    <p className="subtitle">
                        Emergency and ambulance overview
                    </p>
                </div>
                <div className="header-icon">🚑</div>
            </header>

            <section className="stats">
                <div className="stat-card">
                    <span>Emergency Requests</span>
                    <strong>{emergencies.length}</strong>
                </div>

                <div className="stat-card">
                    <span>Ambulances</span>
                    <strong>{ambulances.length}</strong>
                </div>

                <div className="stat-card">
                    <span>Assignments</span>
                    <strong>{assignments.length}</strong>
                </div>
            </section>

            <div className="section-heading">
                <div>
                    <h2>Emergency Requests</h2>
                    <p>Review requests received by the system.</p>
                </div>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={loadDashboard}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "↻ Refresh"}
                </button>
            </div>

            <section className="assignment-list">
                {emergencies.map((item) => (
                    <article className="assignment-card" key={item.id}>
                        <div className="assignment-top">
                            <div>
                                <span className="assignment-label">
                                    EMERGENCY #{item.id}
                                </span>
                                <h3>{item.emergency_type || "Emergency"}</h3>
                            </div>

                            <span className="status status-pending">
                                {item.status || "PENDING"}
                            </span>
                        </div>

                        <p><strong>Priority:</strong> {item.priority || "HIGH"}</p>
                        <p><strong>Location:</strong> {item.pickup_address || "Not provided"}</p>
                        <p>{item.description || "No additional description."}</p>
                    </article>
                ))}

                {emergencies.length === 0 && (
                    <p>No emergency requests found.</p>
                )}
            </section>

            <div className="section-heading">
                <div>
                    <h2>Ambulance Fleet</h2>
                    <p>Current ambulance availability and assignments.</p>
                </div>
            </div>

            <section className="assignment-list">
                {ambulances.map((item) => (
                    <article className="assignment-card" key={item.id}>
                        <h3>{item.vehicle_number}</h3>
                        <p><strong>Type:</strong> {item.ambulance_type}</p>
                        <p><strong>Status:</strong> {item.status}</p>
                        <p>
                            <strong>Driver ID:</strong>{" "}
                            {item.driver_id ?? "Not assigned"}
                        </p>
                    </article>
                ))}

                {ambulances.length === 0 && <p>No ambulances found.</p>}
            </section>

            <div className="section-heading">
                <div>
                    <h2>Current Assignments</h2>
                    <p>Track assignment progress.</p>
                </div>
            </div>

            <section className="assignment-list">
                {assignments.map((item) => (
                    <article className="assignment-card" key={item.id}>
                        <div className="assignment-top">
                            <h3>Assignment #{item.id}</h3>

                            <span
                                className={`status status-${String(
                                    item.status || "pending"
                                ).toLowerCase()}`}
                            >
                                {item.status || "PENDING"}
                            </span>
                        </div>

                        <p>
                            <strong>Emergency ID:</strong> {item.emergency_id}
                        </p>
                        <p>
                            <strong>Ambulance:</strong>{" "}
                            {item.vehicle_number || item.ambulance_id}
                        </p>
                    </article>
                ))}

                {assignments.length === 0 && <p>No assignments found.</p>}
            </section>

            <p className="message">{message}</p>
        </main>
    );
}