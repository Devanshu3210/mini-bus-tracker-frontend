import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const path = useLocation().pathname;

  return (
    <nav className="navbar">
      <h1>🚌 Mini Bus Tracker</h1>
      <div className="nav-links">
        <Link
          to="/admin"
          className={path === "/admin" || path === "/" ? "active" : ""}
        >
          Admin
        </Link>
        <Link to="/driver" className={path === "/driver" ? "active" : ""}>
          Driver
        </Link>
      </div>
    </nav>
  );
}
