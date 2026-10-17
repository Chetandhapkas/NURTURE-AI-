
import { useCallback, useEffect, useState } from "react";
import "./MotherFamilyDashboard.css";
import Sidebar from "../../components/sidebar/Sidebar.jsx";

const API_BASE = `http://${window.location.hostname}:8080/api`;

export default function MotherFamilyDashboard() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const patientUserId = localStorage.getItem("userId");

  const loadFamilyMembers = useCallback(async () => {
    if (!patientUserId) {
      setError("Your session was not found. Please log in again.");
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/family/members?patientUserId=${encodeURIComponent(patientUserId)}`
      );

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const data = await response.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message || "Unable to load your connected family members."
      );
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [patientUserId]);

  useEffect(() => {
    loadFamilyMembers();
  }, [loadFamilyMembers]);

  const getInitials = (name) => {
    if (!name) return "FM";

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  };

  return (
    <div className="family-dashboard-layout">
      <Sidebar />

      <main className="family-dashboard-page">
        <header className="family-dashboard-header">
          <div>
            <span className="family-dashboard-eyebrow">
              NURTURE AI · FAMILY SUPPORT
            </span>
            <h1>Family Dashboard</h1>
            <p>
              View the family members connected to your pregnancy wellness
              account and their contact details.
            </p>
          </div>

          <div className="family-dashboard-header-icon" aria-hidden="true">
            ♡
          </div>
        </header>

        <section className="family-dashboard-summary">
          <div className="family-summary-icon" aria-hidden="true">
            ♧
          </div>

          <div>
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
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </section>

        {error && (
          <div className="family-dashboard-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")}>
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
            <div className="family-empty-state">
              <div className="family-loading-spinner" />
              <strong>Loading family members...</strong>
              <p>Please wait while we retrieve your information.</p>
            </div>
          ) : error ? (
            <div className="family-empty-state">
              <div className="family-empty-icon">!</div>
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
              <div className="family-empty-icon">♡</div>
              <strong>No family members connected yet</strong>
              <p>
                Family member details will appear here once they are linked
                to your account.
              </p>
            </div>
          ) : (
            <div className="family-members-grid">
              {members.map((member) => (
                <article
                  className="family-member-card"
                  key={member.familyMemberId}
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
                      <span className="family-detail-icon" aria-hidden="true">
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
                      <span className="family-detail-icon" aria-hidden="true">
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
                      <span className="family-detail-icon" aria-hidden="true">
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
      </main>
    </div>
  );
}
