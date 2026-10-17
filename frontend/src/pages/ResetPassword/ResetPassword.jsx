import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";

import API from "../../services/api";
import "./passwordRecovery.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError(
        "The reset link is missing its token. Please request a new link."
      );
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 72) {
      setError("Your password must be between 8 and 72 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post(
        "/auth/reset-password",
        {
          token,
          newPassword,
          confirmPassword,
        }
      );

      setMessage(
        response.data?.message ||
        "Your password has been reset successfully."
      );

      setCompleted(true);
    } catch (err) {
      console.error("Password reset failed:", err);

      setError(
        err.response?.data?.message ||
        "The reset link is invalid or has expired. Please request a new link."
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
          <FaLock />
        </div>

        <h2>Reset Password</h2>

        <p className="recovery-description">
          Create a new password for your NURTURE AI account.
        </p>

        {!token && (
          <p className="recovery-error" role="alert">
            The reset link is missing its token. Please request a new link.
          </p>
        )}

        {!completed && (
          <form onSubmit={handleSubmit}>
            <label htmlFor="new-password">
              New Password
            </label>

            <div className="recovery-input">
              <FaLock />

              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
                disabled={loading || !token}
              />

              <button
                type="button"
                className="recovery-eye"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <label htmlFor="confirm-password">
              Confirm New Password
            </label>

            <div className="recovery-input">
              <FaLock />

              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                minLength={6}
                maxLength={72}
                required
                disabled={loading || !token}
              />

              <button
                type="button"
                className="recovery-eye"
                onClick={() =>
                  setShowConfirmPassword((value) => !value)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {error && (
              <p className="recovery-error" role="alert">
                {error}
              </p>
            )}

            <button
              className="recovery-button"
              type="submit"
              disabled={loading || !token}
            >
              {loading ? "Updating Password..." : "Reset Password"}
            </button>
          </form>
        )}

        {message && (
          <div className="recovery-success" role="status">
            {message}
          </div>
        )}

        {completed ? (
          <button
            type="button"
            className="recovery-button recovery-secondary-button"
            onClick={() => navigate("/login", { replace: true })}
          >
            Go to Login
          </button>
        ) : (
          <Link to="/forgot-password" className="recovery-back-link">
            <FaArrowLeft />
            Request a New Reset Link
          </Link>
        )}
      </div>
    </div>
  );
}