import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import { LuUser } from "react-icons/lu";
import { PASSWORD_REGEX } from "../utils/validators";
import wavesSvg from "../assets/waves.svg";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch {
        setProfileError("Failed to load profile.");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (!PASSWORD_REGEX.test(newPassword)) {
      return setPwError(
        "New password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character."
      );
    }
    if (newPassword !== confirmNew) {
      return setPwError("New passwords do not match.");
    }
    setPwLoading(true);
    try {
      await api.put("/auth/change-password", { currentPassword, newPassword });
      setPwSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNew("");
    } catch (err) {
      setPwError(
        err.response?.data?.message || "Failed to update password. Please try again."
      );
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-waves" aria-hidden="true">
        <img src={wavesSvg} alt="" className="waves-img" />
      </div>
      <Navbar />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Profile</h1>
        </div>

        {profileError && <div className="auth-error dashboard-error">{profileError}</div>}

        {loadingUser ? (
          <div className="dashboard-loading">
            <div className="loading-dots">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : (
          <div className="profile-layout">
            <div className="profile-card">
              <div className="profile-avatar">
                <LuUser size={36} color="#555" />
              </div>
              <div className="profile-info">
                <p className="profile-label">Username</p>
                <p className="profile-value">{user?.username || "—"}</p>
              </div>
              <button
                id="logout-btn"
                className="btn-primary profile-logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>

            <div className="profile-card">
              <div>
                <h2 className="editor-heading">Change Password</h2>
                <p className="auth-subtitle" style={{ marginTop: "0.35rem" }}>
                  Update your account password below.
                </p>
              </div>

              {pwError && <div className="auth-error">{pwError}</div>}
              {pwSuccess && <div className="profile-success">{pwSuccess}</div>}

              <form onSubmit={handleChangePassword} className="auth-form">
                <div className="form-field">
                  <label htmlFor="current-password" className="editor-label">
                    Current Password
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    autoComplete="current-password"
                    className="form-input"
                    placeholder="Current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="new-password" className="editor-label">
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    className="form-input"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <p className="form-hint">
                    Min 8 chars, uppercase, lowercase, number, special character.
                  </p>
                </div>
                <div className="form-field">
                  <label htmlFor="confirm-new-password" className="editor-label">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-new-password"
                    type="password"
                    autoComplete="new-password"
                    className="form-input"
                    placeholder="Confirm new password"
                    value={confirmNew}
                    onChange={(e) => setConfirmNew(e.target.value)}
                    required
                  />
                </div>
                <button
                  id="change-password-btn"
                  type="submit"
                  className="btn-primary"
                  disabled={pwLoading}
                >
                  {pwLoading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
