import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/auth.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignUp = () => {
  const [formDetails, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...formDetails, [e.target.name]: e.target.value });
    setError("");
  }

  function validate() {
    if (!formDetails.username.trim() || !formDetails.email.trim() || !formDetails.password.trim()) {
      setError("All fields are required.");
      return false;
    }
    if (!emailRegex.test(formDetails.email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (formDetails.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8090/auth/register", formDetails);
      if (response.status === 201) {
        navigate("/login");
      } else {
        setError("Sign up failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Sign up failed. Please try again.");
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
          <h2 className="auth-title mb-1">Create an account</h2>
        </div>
        <form autoComplete="off" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label auth-form-label">
              Username
            </label>
            <input
              type="text"
              className="form-control auth-input"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={formDetails.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label auth-form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control auth-input"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formDetails.email}
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
            By signing up you are accepting our{' '}
            <a href="#" className="auth-link">terms and conditions</a>.
          </div>
          <div className="d-grid mb-3">
            <button type="submit" className="btn auth-btn" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : null}
              Sign up
            </button>
          </div>
          <div className="auth-subtext text-center">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Log In</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
