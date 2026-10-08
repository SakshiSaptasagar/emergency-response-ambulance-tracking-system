import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const SOCKET_URL = "http://localhost:5000";

const ambulanceIcon = L.divIcon({
    className: "ambulance-marker",
    html: '<div style="font-size:30px">🚑</div>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

export default function LiveTracking() {
    const [connected, setConnected] = useState(false);
    const [locations, setLocations] = useState([]);
    const [ambulanceId, setAmbulanceId] = useState("1");
    const [latitude, setLatitude] = useState("18.5204");
    const [longitude, setLongitude] = useState("73.8567");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const socket = io(SOCKET_URL);

        socket.on("connect", () => setConnected(true));
        socket.on("disconnect", () => setConnected(false));

        socket.on("ambulance:location:update", (data) => {
            setLocations((previous) => [
                ...previous.filter(
                    (item) => item.ambulanceId !== data.ambulanceId
                ),
                data,
            ]);
            setMessage("Location update received.");
        });

        socket.on("ambulance:location:error", (data) => {
            setMessage(data.message || "Location update failed.");
        });

        return () => socket.disconnect();
    }, []);

    const sendLocation = () => {
        const id = Number(ambulanceId);
        const lat = Number(latitude);
        const lng = Number(longitude);

        if (
            !Number.isInteger(id) || id < 1 ||
            !Number.isFinite(lat) || lat < -90 || lat > 90 ||
            !Number.isFinite(lng) || lng < -180 || lng > 180
        ) {
            setMessage("Enter a valid ambulance ID and coordinates.");
            return;
        }

        const sender = io(SOCKET_URL);

        sender.on("connect", () => {
            sender.emit("ambulance:location", {
                ambulanceId: id,
                latitude: lat,
                longitude: lng,
            });

            setMessage("Location sent. Waiting for update...");
            setTimeout(() => sender.disconnect(), 1000);
        });

        sender.on("connect_error", () => {
            setMessage("Could not connect to the tracking server.");
            sender.disconnect();
        });
    };

    return (
        <section className="assignment-card" style={{ margin: "24px 0" }}>
            <h2>Live Ambulance Tracking</h2>

            <p>
                WebSocket status:{" "}
                <strong style={{ color: connected ? "green" : "crimson" }}>
                    {connected ? "Connected" : "Disconnected"}
                </strong>
            </p>

            <p>
                Demo coordinates only; this is not verified GPS data.
            </p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "12px",
                }}
            >
                <label>
                    Ambulance ID
                    <input
                        value={ambulanceId}
                        onChange={(e) => setAmbulanceId(e.target.value)}
                    />
                </label>

                <label>
                    Latitude
                    <input
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                    />
                </label>

                <label>
                    Longitude
                    <input
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                    />
                </label>
            </div>

            <button onClick={sendLocation} style={{ marginTop: "16px" }}>
                Send Test Location
            </button>

            {message && <p>{message}</p>}

            <h3>Latest location updates</h3>

            <div style={{ height: "400px", width: "100%", marginTop: "16px" }}>
                <MapContainer
                    center={[18.5204, 73.8567]}
                    zoom={12}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {locations.map((item) => (
                        <Marker
                            key={item.ambulanceId}
                            position={[
                                Number(item.latitude),
                                Number(item.longitude),
                            ]}
                            icon={ambulanceIcon}
                        >
                            <Popup>
                                <strong>Ambulance #{item.ambulanceId}</strong>
                                <br />
                                Latitude: {item.latitude}
                                <br />
                                Longitude: {item.longitude}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </section>
    );
}