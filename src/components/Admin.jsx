import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ✅ Connect to your Render backend securely

const socket = io("https://mini-bus-tracker-backend.onrender.com", {
  transports: ["websocket"],
  withCredentials: true,
  secure: true,
  reconnection: true,
  rejectUnauthorized: false,
});


// ✅ Fix marker icon path issue for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default function Admin() {
  const mapRef = useRef();
  const [markers, setMarkers] = useState({});

  useEffect(() => {
    // ✅ Request last saved locations (from MongoDB)
    socket.emit("request-last-locations");

    // ✅ Listen for previously saved locations
    socket.on("last-locations", (locs) => {
      const all = {};
      locs.forEach((loc) => (all[loc.busId] = [loc.lat, loc.lng]));
      setMarkers(all);
    });

    // ✅ Listen for live bus location updates
    socket.on("bus-location", (data) => {
      console.log("🆕 New live location:", data);
      setMarkers((prev) => ({ ...prev, [data.busId]: [data.lat, data.lng] }));
      if (mapRef.current) {
        mapRef.current.setView([data.lat, data.lng], 14);
      }
    });

    return () => {
      socket.off("bus-location");
      socket.off("last-locations");
    };
  }, []);

  return (
    <div className="page-container">
      <div className="card map-card">
        <h2>🗺️ Admin Dashboard</h2>
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{
            height: "500px",
            width: "100%",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
          whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* ✅ Render live markers */}
          {Object.entries(markers).map(([busId, [lat, lng]]) => (
            <Marker key={busId} position={[lat, lng]}>
              <Popup>
                <b>Bus ID:</b> {busId}
                <br />
                <b>Lat:</b> {lat.toFixed(4)}, <b>Lng:</b> {lng.toFixed(4)}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
