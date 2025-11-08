import React, { useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Change this to your Render backend URL after deployment

export default function Driver() {
  const [busId, setBusId] = useState("");
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [sharing, setSharing] = useState(false);
  const [watchId, setWatchId] = useState(null);

  const startSharing = () => {
    if (!busId.trim()) return alert("Please enter a Bus ID!");
    if (!navigator.geolocation) return alert("Geolocation not supported!");

    setSharing(true);

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        socket.emit("location-update", {
          busId,
          lat: latitude,
          lng: longitude,
        });
      },
      (err) => alert("Error fetching location: " + err.message),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
    );
    setWatchId(id);
  };

  const stopSharing = () => {
    if (watchId) navigator.geolocation.clearWatch(watchId);
    setSharing(false);
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>Driver Panel</h2>
        <div className="input-group">
          <label>Bus ID</label>
          <input
            type="text"
            placeholder="e.g. BUS-101"
            value={busId}
            onChange={(e) => setBusId(e.target.value)}
            disabled={sharing}
          />
        </div>

        <div className="status-box">
          <p>
            <strong>Status:</strong>{" "}
            <span className={sharing ? "active" : ""}>
              {sharing ? "Sharing" : "Not Sharing"}
            </span>
          </p>
          <p>
            Lat: {coords.lat ? coords.lat.toFixed(5) : "—"} | Lng:{" "}
            {coords.lng ? coords.lng.toFixed(5) : "—"}
          </p>
        </div>

        <div className="btn-group">
          {!sharing ? (
            <button className="btn btn-start" onClick={startSharing}>
              Start Sharing
            </button>
          ) : (
            <button className="btn btn-stop" onClick={stopSharing}>
              Stop Sharing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
