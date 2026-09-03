import React from "react";
import { LuNotebook } from "react-icons/lu";
import wavesSvg from "../assets/waves.svg";

const AuthLayout = ({ title, subtitle, error, children }) => {
  return (
    <div className="auth-page">
      <div className="auth-content">
        <div className="auth-brand">
          <h2 className="auth-brand-name">Noted.</h2>
          <div className="auth-brand-icon">
            <LuNotebook size={40} color="#555" />
          </div>
        </div>

        <div className="auth-card-header">
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {children}
      </div>

      <div className="auth-waves" aria-hidden="true">
        <img src={wavesSvg} alt="" className="waves-img" />
      </div>
    </div>
  );
};

export default AuthLayout;
