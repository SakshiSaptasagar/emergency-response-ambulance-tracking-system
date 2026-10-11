import { useState } from "react";

const API =
    import.meta.env.VITE_API_URL ||
    "https://emergency-response-backend-gf1v.onrender.com";

export default function EmergencyReport({ token }) {
    const [form, setForm] = useState({
        emergency_type: "",
        description: "",
        priority: "HIGH",
        pickup_address: "",
        pickup_latitude: "",
        pickup_longitude: "",
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!token) {
            setError("Please log in before submitting an emergency report.");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                emergency_type: form.emergency_type,
                description: form.description,
                priority: form.priority,
                pickup_address: form.pickup_address,
                pickup_latitude:
                    form.pickup_latitude === ""
                        ? null
                        : Number(form.pickup_latitude),
                pickup_longitude:
                    form.pickup_longitude === ""
                        ? null
                        : Number(form.pickup_longitude),
            };

            const response = await fetch(`${API}/api/emergency`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to submit report.");
            }

            setMessage(
                `Emergency report submitted successfully! Request ID: ${data.emergencyId}`
            );

            setForm({
                emergency_type: "",
                description: "",
                priority: "HIGH",
                pickup_address: "",
                pickup_latitude: "",
                pickup_longitude: "",
            });
        } catch (err) {
            setError(err.message || "Unable to submit the report.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main
            className="dashboard"
            style={{ maxWidth: "800px", margin: "32px auto" }}
        >
            <h1>Report an Emergency</h1>
            <p>Provide the emergency details and pickup location.</p>

            <form onSubmit={handleSubmit}>
                <label htmlFor="emergency_type">Emergency Type *</label>
                <select
                    id="emergency_type"
                    name="emergency_type"
                    value={form.emergency_type}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                >
                    <option value="">Select emergency type</option>
                    <option value="Medical">Medical emergency</option>
                    <option value="Accident">Road accident</option>
                    <option value="Injury">Injury</option>
                    <option value="Other">Other</option>
                </select>

                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe what happened"
                    rows={4}
                    style={inputStyle}
                />

                <label htmlFor="priority">Priority *</label>
                <select
                    id="priority"
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                </select>

                <label htmlFor="pickup_address">Pickup Address *</label>
                <textarea
                    id="pickup_address"
                    name="pickup_address"
                    value={form.pickup_address}
                    onChange={handleChange}
                    placeholder="Enter the exact pickup address"
                    rows={3}
                    required
                    style={inputStyle}
                />

                <label htmlFor="pickup_latitude">Latitude (optional)</label>
                <input
                    id="pickup_latitude"
                    name="pickup_latitude"
                    type="number"
                    step="any"
                    value={form.pickup_latitude}
                    onChange={handleChange}
                    style={inputStyle}
                />

                <label htmlFor="pickup_longitude">Longitude (optional)</label>
                <input
                    id="pickup_longitude"
                    name="pickup_longitude"
                    type="number"
                    step="any"
                    value={form.pickup_longitude}
                    onChange={handleChange}
                    style={inputStyle}
                />

                {message && (
                    <p role="status" style={{ color: "green" }}>
                        {message}
                    </p>
                )}

                {error && (
                    <p role="alert" style={{ color: "#dc2626" }}>
                        {error}
                    </p>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Emergency Report"}
                </button>
            </form>
        </main>
    );
}

const inputStyle = {
    display: "block",
    width: "100%",
    padding: "12px",
    margin: "8px 0 18px",
    boxSizing: "border-box",
};