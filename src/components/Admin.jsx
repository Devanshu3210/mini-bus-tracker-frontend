import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const socket = io("http://localhost:5000"); // Change this to your Render backend URL after deploy

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
    // Request last saved locations
    socket.emit("request-last-locations");

    // Listen for saved locations from DB
    socket.on("last-locations", (locs) => {
      const all = {};
      locs.forEach((loc) => (all[loc.busId] = [loc.lat, loc.lng]));
      setMarkers(all);
    });

    // Listen for live updates
    socket.on("bus-location", (data) => {
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
        <h2>Admin Dashboard</h2>
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: "500px", width: "100%", borderRadius: "12px" }}
          whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {Object.entries(markers).map(([busId, [lat, lng]]) => (
            <Marker key={busId} position={[lat, lng]}>
              <Popup>
                <b>{busId}</b>
                <br />
                Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
