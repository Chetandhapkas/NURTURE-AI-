
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaHome,
  FaArrowRight,
  FaShieldAlt,
  FaHeart,
  FaCheckCircle,
} from "react-icons/fa";

import { FcGoogle } from "react-icons/fc";

import API from "../../services/api";
import "./login.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const checkPersonalInfo = async (userId) => {
    try {
      const response = await API.get(`/profile/exists/${userId}`);
      return response.data === true;
    } catch (error) {
      console.error("Personal information check failed:", error);
      return false;
    }
  };

  const checkPregnancyDetails = async (userId) => {
    try {
      const response = await API.get(`/pregnancy/exists/${userId}`);
      return response.data === true;
    } catch (error) {
      console.error("Pregnancy details check failed:", error);
      return false;
    }
  };

  const checkMedicalHistory = async (userId) => {
    try {
      const response = await API.get(`/medical-history/exists/${userId}`);
      return response.data === true;
    } catch (error) {
      console.error("Medical history check failed:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = formData.email.trim();

    if (!email || !formData.password.trim()) {
      alert("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post(
        "/auth/login",
        {
          email,
          password: formData.password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status !== 200) {
        alert("Unable to log in. Please try again.");
        return;
      }

      const data = response.data;
      const userId = data.userId;

      if (userId === undefined || userId === null || userId === "") {
        alert(
          "Login response did not contain a user ID. Please contact support."
        );
        return;
      }

      localStorage.setItem("userId", String(userId));

      if (data.fullName) {
        localStorage.setItem("fullName", data.fullName);
      }

      if (data.email) {
        localStorage.setItem("email", data.email);
      }

      if (data.role) {
        localStorage.setItem("role", data.role);
      }

      if (data.familyVerified !== undefined && data.familyVerified !== null) {
        localStorage.setItem(
          "familyVerified",
          String(data.familyVerified)
        );
      }

      const role = String(data.role || "")
        .trim()
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\s+/g, " ");

      const familyVerified = data.familyVerified === true;

      alert(data.message || "Login successful!");

      if (role === "family member") {
        navigate(
          familyVerified ? "/family-dashboard" : "/family-form",
          { replace: true }
        );
        return;
      }

      if (role === "mother") {
        const numericUserId = Number(userId);

        const personalInfoCompleted =
          await checkPersonalInfo(numericUserId);

        if (!personalInfoCompleted) {
          navigate("/personal-info", { replace: true });
          return;
        }

        const pregnancyDetailsCompleted =
          await checkPregnancyDetails(numericUserId);

        if (!pregnancyDetailsCompleted) {
          navigate("/pregnancy-details", { replace: true });
          return;
        }

        const medicalHistoryCompleted =
          await checkMedicalHistory(numericUserId);

        if (!medicalHistoryCompleted) {
          navigate("/medical-history", { replace: true });
          return;
        }

        navigate("/dashboard", { replace: true });
        return;
      }

      console.error("Unknown user role:", data.role);
      alert(`Unknown user role: ${data.role || "Not provided"}`);
    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        const responseData = error.response.data;

        if (typeof responseData === "string") {
          alert(responseData);
        } else {
          alert(responseData?.message || "Invalid email or password.");
        }
      } else if (error.request) {
        alert(
          "Unable to connect to the server. Please check your internet connection and try again."
        );
      } else {
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-container">
      {/* LEFT BRANDING SECTION */}
      <section className="login-left">
        <div className="login-brand">
          <Link to="/" className="brand-logo" aria-label="NurtureAI home">
            <span className="brand-logo-icon">
              <FaHeart aria-hidden="true" />
            </span>

            <span>
              Nurture<span className="brand-highlight">AI</span>
            </span>
          </Link>

          <div className="brand-content">
            <div className="brand-eyebrow">
              <span className="eyebrow-dot" />
              YOUR PERSONAL WELLNESS COMPANION
            </div>

            <h1>
              A little care.
              <br />
              <span>A lifetime of love. 💗</span>
            </h1>

            <p>
              Your intelligent pregnancy wellness companion, supporting
              you and your growing family through every beautiful stage
              of the journey.
            </p>

            <div className="brand-features">
              <div className="brand-feature">
                <span className="feature-check">
                  <FaCheckCircle />
                </span>
                <span>🤰 Personalized pregnancy wellness</span>
              </div>

              <div className="brand-feature">
                <span className="feature-check">
                  <FaCheckCircle />
                </span>
                <span>🔔 Smart reminders and health insights</span>
              </div>

              <div className="brand-feature">
                <span className="feature-check">
                  <FaCheckCircle />
                </span>
                <span>👨‍👩‍👧 Care and support for your family</span>
              </div>
            </div>

            <div className="brand-illustration" aria-hidden="true">
              <span className="floating-emoji emoji-mother">🤰</span>
              <span className="floating-emoji emoji-heart">💗</span>
              <span className="floating-emoji emoji-flower">🌸</span>
              <span className="floating-emoji emoji-sparkle">✨</span>
            </div>
          </div>

          <div className="brand-footer">
            <FaHeart className="brand-heart" />
            <span>Every step of motherhood, together.</span>
            <span className="footer-sparkle">✨</span>
          </div>
        </div>
      </section>

      {/* RIGHT LOGIN SECTION */}
      <section className="login-right">
        {/* Home button: only one instance */}
        <Link
          to="/"
          className="login-home-btn"
          aria-label="Go to home page"
          title="Go to home page"
        >
          <FaHome aria-hidden="true" />
          <span>Home</span>
        </Link>

        <div className="login-card">
          <div className="mobile-brand">
            <span className="brand-logo-icon">
              <FaHeart />
            </span>

            <span>
              Nurture<span className="brand-highlight">AI</span>
            </span>

            <span className="mobile-brand-emoji">🌸</span>
          </div>

          <div className="login-heading">
            <span className="login-kicker">WELCOME BACK ✨</span>

            <h2>Sign in to your world</h2>

            <p className="subtitle">
              We're happy to have you back. Continue your NurtureAI journey. 💗
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email address</label>

              <div className="input-box">
                <FaEnvelope className="input-icon" aria-hidden="true" />

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="input-group">
              <div className="password-label-row">
                <label htmlFor="password">Password</label>

                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <div className="input-box">
                <FaLock className="input-icon" aria-hidden="true" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="show-btn"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="remember-row">
              <label className="remember-label">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span>Remember me</span>
              </label>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              <span>{loading ? "Signing you in..." : "Sign In"}</span>
              {!loading && <FaArrowRight aria-hidden="true" />}
            </button>

            <div className="divider">
              <span>OR CONTINUE WITH</span>
            </div>

            <button
              type="button"
              className="google-btn"
              disabled={loading}
              onClick={() =>
                alert(
                  "Google sign-in is not connected yet. Please use your email and password."
                )
              }
            >
              <FcGoogle className="google-icon" />
              <span>Continue with Google</span>
            </button>
          </form>

          <p className="register-link">
            New to NurtureAI?
            <Link to="/register"> Create an account</Link>
          </p>

          <div className="login-security">
            <FaShieldAlt aria-hidden="true" />
            <span>
              Your journey matters. Sign in to access your account securely.
            </span>
          </div>
        </div>

        <p className="login-bottom-text">
          Made with <span>♥</span> for mothers and families 🌷
        </p>
      </section>
    </main>
  );
}

export default Login;
