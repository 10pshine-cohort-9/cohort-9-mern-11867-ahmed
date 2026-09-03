import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import AuthLayout from "../components/AuthLayout";
import { USERNAME_REGEX, PASSWORD_REGEX } from "../utils/validators";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!USERNAME_REGEX.test(formData.username)) {
      return setError(
        "Username must be 3-20 characters and contain only letters, numbers, or underscores.",
      );
    }
    if (!PASSWORD_REGEX.test(formData.password)) {
      return setError(
        "Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character.",
      );
    }
    if (formData.password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/register", formData);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign Up"
      subtitle="Create your account to get started."
      error={error}
    >
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-field">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={formData.username}
            onChange={handleChange}
            className="form-input"
            placeholder="Username"
          />
          <p className="form-hint">3-20 characters. Letters, numbers, and underscores only.</p>
        </div>
        <div className="form-field">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            placeholder="Password"
          />
          <p className="form-hint">Min 8 chars, uppercase, lowercase, number, special character.</p>
        </div>
        <div className="form-field">
          <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="form-input"
            placeholder="Confirm Password"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account?{" "}
        <Link to="/" className="auth-link">Sign In</Link>
      </p>
    </AuthLayout>
  );
};

export default Signup;
