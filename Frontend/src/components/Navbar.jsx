import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LuNotebook } from "react-icons/lu";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <div className="auth-brand-icon">
            <LuNotebook size={100} color="#555" />
          </div>
          <span className="auth-brand-name navbar-brand-name">Noted.</span>
        </Link>

        <nav className="navbar-nav">
          <Link
            to="/dashboard"
            className={`navbar-link${location.pathname === "/dashboard" ? " navbar-link--active" : ""}`}
          >
            Notes
          </Link>
          <Link
            to="/profile"
            className={`navbar-link${location.pathname === "/profile" ? " navbar-link--active" : ""}`}
          >
            Profile
          </Link>
          <button onClick={handleLogout} className="navbar-logout">
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
