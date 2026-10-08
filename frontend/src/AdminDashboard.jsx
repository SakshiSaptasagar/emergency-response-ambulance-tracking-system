
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

export default function AdminDashboard() {
    const [token, setToken] = useState("");
    const [emergencies, setEmergencies] = useState([]);
    const [ambulances, setAmbulances] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("admin@test.com");
    const [password, setPassword] = useState("Admin@123");
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        emergencyId: "",
        ambulanceId: "",
    });

    const request = (path, options = {}) =>
        axios({
            url: `${API}${path}`,
            ...options,
            headers: {
                Authorization: `Bearer ${token}`,
                ...options.headers,
            },
        });

    const login = async (event) => {
        event.preventDefault();
        try {
            setLoading(true);
            const response = await axios.post(`${API}/api/auth/login`, {
                email,
                password,
            });
            setToken(response.data.token);
            setMessage("Login successful. Loading dashboard...");
        } catch (error) {
            setMessage(error.response?.data?.message || "Login failed.");
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
                "Could not load dashboard data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) loadDashboard();
    }, [token]);

    const assignAmbulance = async (event) => {
        event.preventDefault();

        if (!form.emergencyId || !form.ambulanceId) {
            setMessage("Select an emergency and an ambulance.");
            return;
        }

        setMessage(
            "Your current assignment API does not yet provide an assignment-creation route. The existing assignments are shown below."
        );
    };

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
                    <button disabled={loading}>
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
                    className="secondary-button"
                    onClick={loadDashboard}
                    disabled={loading}
                >
                    ↻ Refresh
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
                                {item.status}
                            </span>
                        </div>
                        <p><strong>Priority:</strong> {item.priority}</p>
                        <p><strong>Location:</strong> {item.pickup_address}</p>
                        <p>{item.description}</p>
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
                        <p><strong>Driver ID:</strong> {item.driver_id ?? "Not assigned"}</p>
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
                            <span className={`status status-${String(item.status).toLowerCase()}`}>
                                {item.status}
                            </span>
                        </div>
                        <p><strong>Emergency ID:</strong> {item.emergency_id}</p>
                        <p><strong>Ambulance:</strong> {item.vehicle_number}</p>
                    </article>
                ))}
                {assignments.length === 0 && <p>No assignments found.</p>}
            </section>

            <p className="message">{message}</p>
        </main>
    );
}
