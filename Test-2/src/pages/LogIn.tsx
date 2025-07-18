import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../redux/auth/authActions";
import axios from "axios";
import "../styles/auth.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LogIn = () => {
  const [formDetails, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...formDetails, [e.target.name]: e.target.value });
    setError("");
  }

  function validate() {
    if (!formDetails.identifier.trim() || !formDetails.password.trim()) {
      setError("All fields are required.");
      return false;
    }
    // If identifier looks like an email, validate it
    if (formDetails.identifier.includes("@") && !emailRegex.test(formDetails.identifier)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (formDetails.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    const { identifier, password } = formDetails;
    const payload: { username?: string; email?: string; password: string } = { password };
    emailRegex.test(identifier) ? (payload.email = identifier) : (payload.username = identifier);
    try {
      const response = await axios.post(
        "http://localhost:8090/auth/login",
        payload
      );
      if (response.status === 200) {
        dispatch(login(response.data.user || response.data));
        navigate("/home");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="d-flex flex-column align-items-center mb-3">
          <div className="auth-logo">
            <span>NEXUS</span>
          </div>
          <h2 className="auth-title mb-1">Log in</h2>
        </div>
        <form autoComplete="off" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="identifier" className="form-label auth-form-label">
              Username or Email
            </label>
            <input
              type="text"
              className="form-control auth-input"
              id="identifier"
              name="identifier"
              placeholder="Enter your username or email"
              value={formDetails.identifier}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label auth-form-label">
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control auth-input"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formDetails.password}
                onChange={handleChange}
                required
                minLength={6}
              />
              <button
                type="button"
                tabIndex={-1}
                className="btn btn-sm btn-link"
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#6366f1" }}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {error && (
            <div className="text-danger text-center mb-2" aria-live="polite">{error}</div>
          )}
          <div className="auth-terms">
            By logging in you are accepting our{' '}
            <a href="#" className="auth-link">terms and conditions</a>.
          </div>
          <div className="d-grid mb-3">
            <button type="submit" className="btn auth-btn" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : null}
              Log in
            </button>
          </div>
          <div className="auth-subtext text-center">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogIn; 