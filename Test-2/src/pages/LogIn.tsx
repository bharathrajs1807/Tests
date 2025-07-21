import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../redux/auth/authActions";
import { login as firebaseLogin, sendLoginLink, completeLogin, getEmailByUsername } from "../config/firebase";
import "../styles/auth.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LogIn = () => {
  const [formDetails, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'link'>('password');
  const [linkSent, setLinkSent] = useState(false);
  const [isEmailLink, setIsEmailLink] = useState(false);
  const [emailForLink, setEmailForLink] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // Always check for email link sign-in on mount
  useEffect(() => {
    if (window.location.search.includes('mode=signIn')) {
      setIsEmailLink(true);
      const storedEmail = window.localStorage.getItem("emailForSignIn") || "";
      setEmailForLink(storedEmail);
      if (storedEmail) {
        (async () => {
          setLoading(true);
          try {
            const userCredential = await completeLogin();
            if (userCredential) {
              dispatch(login(userCredential.user));
              navigate("/home");
            } else {
              setError("Login failed. Please try again.");
            }
          } catch (err: any) {
            setError(err.message || "Login failed. Please try again.");
          } finally {
            setLoading(false);
          }
        })();
      }
    }
  }, [dispatch, navigate, location]);

  async function handleCompleteLinkLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      window.localStorage.setItem("emailForSignIn", emailForLink);
      const userCredential = await completeLogin();
      if (userCredential) {
        dispatch(login(userCredential.user));
        navigate("/home");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...formDetails, [e.target.name]: e.target.value });
    setError("");
  }

  function validate() {
    if (!formDetails.identifier.trim() || (loginMethod === 'password' && !formDetails.password.trim())) {
      setError("All fields are required.");
      return false;
    }
    if (formDetails.identifier.includes("@") && !emailRegex.test(formDetails.identifier)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (loginMethod === 'password' && formDetails.password.length < 8) {
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
    let { identifier, password } = formDetails;
    try {
      if (loginMethod === 'password') {
        // If identifier is not an email, treat as username and look up email
        if (!identifier.includes("@")) {
          const email = await getEmailByUsername(identifier);
          if (!email) {
            setError("Username not found.");
            setLoading(false);
            return;
          }
          identifier = email;
        }
        const userCredential = await firebaseLogin(identifier, password);
        if (userCredential) {
          dispatch(login(userCredential.user));
          navigate("/home");
        } else {
          setError("Login failed. Please try again.");
        }
      } else {
        // Email link login: allow username or email
        let emailToSend = identifier;
        if (!identifier.includes("@")) {
          const email = await getEmailByUsername(identifier);
          if (!email) {
            setError("Username not found.");
            setLoading(false);
            return;
          }
          emailToSend = email;
        }
        await sendLoginLink(emailToSend);
        setLinkSent(true);
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // If in email link mode and no email in storage, prompt for email
  if (isEmailLink && !emailForLink) {
    return (
      <div className="auth-bg">
        <div className="auth-card">
          <div className="d-flex flex-column align-items-center mb-3">
            <div className="auth-logo">
              <span>NEXUS</span>
            </div>
            <h2 className="auth-title mb-1">Complete Login</h2>
          </div>
          <form autoComplete="off" onSubmit={handleCompleteLinkLogin}>
            <div className="mb-3">
              <label htmlFor="emailForLink" className="form-label auth-form-label">
                Enter your email to complete login
              </label>
              <input
                type="email"
                className="form-control auth-input"
                id="emailForLink"
                name="emailForLink"
                placeholder="Enter your email"
                value={emailForLink}
                onChange={e => setEmailForLink(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-danger text-center mb-2" aria-live="polite">{error}</div>
            )}
            <div className="d-grid mb-3">
              <button type="submit" className="btn auth-btn" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : null}
                Complete Login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
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
        <div className="mb-3 d-flex justify-content-center">
          <button
            type="button"
            className={`btn btn-sm me-2 ${loginMethod === 'password' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => { setLoginMethod('password'); setLinkSent(false); }}
          >
            Email & Password
          </button>
          <button
            type="button"
            className={`btn btn-sm ${loginMethod === 'link' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => { setLoginMethod('link'); setLinkSent(false); }}
          >
            Email Link
          </button>
        </div>
        {linkSent ? (
          <div className="alert alert-success text-center">
            Magic link sent! Check your email to complete login.
          </div>
        ) : (
        <form autoComplete="off" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="identifier" className="form-label auth-form-label">
              Email or Username
            </label>
            <input
              type="text"
              className="form-control auth-input"
              id="identifier"
              name="identifier"
              placeholder={loginMethod === 'password' ? "Enter your username or email" : "Enter your email"}
              value={formDetails.identifier}
              onChange={handleChange}
              required
            />
          </div>
          {loginMethod === 'password' && (
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
          )}
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
        )}
      </div>
    </div>
  );
};

export default LogIn; 