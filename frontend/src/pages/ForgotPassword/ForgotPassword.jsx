import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaArrowLeft, FaLock } from "react-icons/fa";

import API from "../../services/api";
import "../ResetPassword/passwordRecovery.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post(
        "/auth/forgot-password",
        { email: email.trim() }
      );

      setMessage(
        response.data?.message ||
        "If an account exists for that email, a password reset link will be sent."
      );

      setSubmitted(true);
    } catch (err) {
      console.error("Forgot password request failed:", err);

      setError(
        "We could not process your request. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recovery-page">
      <div className="recovery-card">
        <div className="recovery-logo">
          <div className="recovery-logo-icon">
            <FaLock />
          </div>

          <h1>NurtureAI</h1>
          <p>Your pregnancy wellness companion</p>
        </div>

        <div className="recovery-icon">
          <FaEnvelope />
        </div>

        <h2>Forgot Password?</h2>

        <p className="recovery-description">
          Enter the email address associated with your account.
          If an account exists, we will send you a password reset link.
        </p>

        {!submitted && (
          <form onSubmit={handleSubmit}>
            <label htmlFor="recovery-email">
              Email Address
            </label>

            <div className="recovery-input">
              <FaEnvelope />

              <input
                id="recovery-email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <p className="recovery-error" role="alert">
                {error}
              </p>
            )}

            <button
              className="recovery-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending request..." : "Send Reset Link"}
            </button>
          </form>
        )}

        {message && (
          <div className="recovery-success" role="status">
            {message}
            <p>
              Check your inbox and spam folder if your account is
              registered with this email.
            </p>
          </div>
        )}

        <Link to="/login" className="recovery-back-link">
          <FaArrowLeft />
          Back to Login
        </Link>
      </div>
    </div>
  );
}