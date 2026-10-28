
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MotherFamilyDashboard.css";
import Sidebar from "../../components/sidebar/Sidebar.jsx";
import API from "../../services/api";

export default function MotherFamilyDashboard() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const patientUserId = localStorage.getItem("userId");

  const loadFamilyMembers = useCallback(async () => {
    if (!patientUserId) {
      setMembers([]);
      setError("Your session was not found. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await API.get(
        `/family/members?patientUserId=${encodeURIComponent(
          patientUserId
        )}`
      );

      const data = response.data;

      if (!Array.isArray(data)) {
        throw new Error(
          "The server returned an unexpected response. Please check the family-member API."
        );
      }

      setMembers(data);
    } catch (err) {
      setMembers([]);

      const status = err.response?.status;
      const responseData = err.response?.data;

      let message =
        typeof responseData === "string"
          ? responseData
          : responseData?.message || responseData?.error;

      if (status === 404) {
        message =
          "The family-member list API was not found. Please check the backend controller mapping.";
      } else if (status === 401 || status === 403) {
        message =
          "You are not authorized to view this information. Please log in again.";
      }

      setError(
        message ||
          err.message ||
          "Unable to load your connected family members."
      );
    } finally {
      setLoading(false);
    }
  }, [patientUserId]);

  useEffect(() => {
    loadFamilyMembers();
  }, [loadFamilyMembers]);

  const handleBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      // Change this path if your dashboard route is different.
      navigate("/dashboard");
    }
  };

  const getInitials = (name) => {
    if (typeof name !== "string" || !name.trim()) {
      return "FM";
    }

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  return (
    <div className="family-dashboard-layout">
      <Sidebar />

      <main className="family-dashboard-page">
        <div className="family-dashboard-content">
          <header className="family-dashboard-header">
            <div className="family-dashboard-header-text">
              <button
                type="button"
                className="family-back-button"
                onClick={handleBack}
                aria-label="Go back"
              >
                <span aria-hidden="true">←</span>
                <span>Back</span>
              </button>

              <span className="family-dashboard-eyebrow">
                NURTURE AI · FAMILY SUPPORT
              </span>

              <h1>Family Dashboard</h1>

              <p>
                View the family members connected to your pregnancy wellness
                account and their contact details.
              </p>
            </div>

            <div
              className="family-dashboard-header-icon"
              aria-hidden="true"
            >
              ♡
            </div>
          </header>

          <section
            className="family-dashboard-summary"
            aria-label="Family member summary"
          >
            <div className="family-summary-icon" aria-hidden="true">
              ♧
            </div>

            <div className="family-summary-info">
              <span>Connected family members</span>
              <strong>{loading ? "—" : members.length}</strong>
              <p>Members linked to your account</p>
            </div>

            <button
              type="button"
              className="family-refresh-button"
              onClick={loadFamilyMembers}
              disabled={loading}
            >
              <span aria-hidden="true">↻</span>
              {loading ? "Loading..." : "Refresh"}
            </button>
          </section>

          {error && (
            <div className="family-dashboard-error" role="alert">
              <span>{error}</span>

              <button
                type="button"
                className="family-error-dismiss"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          <section className="family-members-section">
            <div className="family-members-heading">
              <div>
                <h2>Your connected family</h2>
                <p>
                  Contact information retrieved from your account records.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="family-empty-state" aria-live="polite">
                <div className="family-loading-spinner" />
                <strong>Loading family members...</strong>
                <p>Please wait while we retrieve your information.</p>
              </div>
            ) : error ? (
              <div className="family-empty-state">
                <div className="family-empty-icon" aria-hidden="true">
                  !
                </div>

                <strong>Family information unavailable</strong>
                <p>Check your connection and try refreshing.</p>

                <button
                  className="family-retry-button"
                  type="button"
                  onClick={loadFamilyMembers}
                >
                  Try again
                </button>
              </div>
            ) : members.length === 0 ? (
              <div className="family-empty-state">
                <div className="family-empty-icon" aria-hidden="true">
                  ♡
                </div>

                <strong>No family members connected yet</strong>
                <p>
                  Family member details will appear here once they are linked
                  to your account.
                </p>
              </div>
            ) : (
              <div className="family-members-grid">
                {members.map((member, index) => (
                  <article
                    className="family-member-card"
                    key={
                      member.familyMemberId ??
                      `${member.memberName ?? "member"}-${index}`
                    }
                  >
                    <div className="family-member-card-top">
                      <div className="family-member-avatar">
                        {getInitials(member.memberName)}
                      </div>

                      <span className="family-connected-badge">
                        Connected
                      </span>
                    </div>

                    <h3>{member.memberName || "Family member"}</h3>

                    <span className="family-member-relationship">
                      {member.relationship || "Relationship not specified"}
                    </span>

                    <div className="family-member-divider" />

                    <div className="family-member-details">
                      <div className="family-detail-row">
                        <span
                          className="family-detail-icon"
                          aria-hidden="true"
                        >
                          ♙
                        </span>

                        <div>
                          <small>Age</small>
                          <strong>
                            {member.age != null
                              ? `${member.age} years`
                              : "Not provided"}
                          </strong>
                        </div>
                      </div>

                      <div className="family-detail-row">
                        <span
                          className="family-detail-icon"
                          aria-hidden="true"
                        >
                          ☎
                        </span>

                        <div>
                          <small>Phone number</small>

                          {member.phoneNumber ? (
                            <a href={`tel:${member.phoneNumber}`}>
                              {member.phoneNumber}
                            </a>
                          ) : (
                            <strong>Not provided</strong>
                          )}
                        </div>
                      </div>

                      <div className="family-detail-row">
                        <span
                          className="family-detail-icon"
                          aria-hidden="true"
                        >
                          ✉
                        </span>

                        <div>
                          <small>Email address</small>

                          {member.email ? (
                            <a href={`mailto:${member.email}`}>
                              {member.email}
                            </a>
                          ) : (
                            <strong>Not available</strong>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
