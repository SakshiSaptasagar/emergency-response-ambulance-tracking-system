import { useState } from "react";

const API =
    import.meta.env.VITE_API_URL ||
    "https://emergency-response-backend-gf1v.onrender.com";

export default function Login({ onLogin, onCancel }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${API}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            if (!data.token || !data.user) {
                throw new Error("Invalid login response.");
            }

            if (data.user.role !== "PATIENT") {
                throw new Error("Please use a PATIENT account.");
            }

            onLogin(data);
        } catch (err) {
            setError(err.message || "Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main
            className="dashboard"
            style={{ maxWidth: "520px", margin: "40px auto" }}
        >
            <h1>Patient Login</h1>
            <p>Log in to submit and track emergency requests.</p>

            <form onSubmit={handleSubmit}>
                <label htmlFor="patient-email">Email</label>
                <input
                    id="patient-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    style={{
                        display: "block",
                        width: "100%",
                        padding: "12px",
                        margin: "8px 0 18px",
                        boxSizing: "border-box",
                    }}
                />

                <label htmlFor="patient-password">Password</label>
                <input
                    id="patient-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    style={{
                        display: "block",
                        width: "100%",
                        padding: "12px",
                        margin: "8px 0 18px",
                        boxSizing: "border-box",
                    }}
                />

                {error && (
                    <p role="alert" style={{ color: "#dc2626" }}>
                        {error}
                    </p>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    style={{
                        marginLeft: "10px",
                        background: "#374151",
                    }}
                >
                    Cancel
                </button>
            </form>
        </main>
    );
}