
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaAmbulance,
  FaPhoneAlt,
  FaUserCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Emergency.css";

function Emergency() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const controller = new AbortController();

    async function loadFamilyMembers() {
      if (!userId) {
        setError("Please log in to access your emergency contacts.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://nurture-ai.onrender.com/api/family/members?patientUserId=${encodeURIComponent(userId)}`,
          {
            headers: { Accept: "application/json" },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Unable to load family contacts (${response.status}).`
          );
        }

        const data = await response.json();

        setMembers(Array.isArray(data) ? data : []);
        setError("");
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load family contacts.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadFamilyMembers();

    return () => controller.abort();
  }, [userId]);

  function getPhoneNumber(member) {
    const phone = String(
      member.phoneNumber ?? member.phone_number ?? ""
    ).trim();

    const cleanedPhone = phone.replace(/[^\d+]/g, "");

    if (!cleanedPhone || !/^\+?\d+$/.test(cleanedPhone)) {
      return "";
    }

    return cleanedPhone;
  }

  return (
    <main className="emergency-page">
      <button
        type="button"
        className="emergency-back-button"
        onClick={() => navigate("/dashboard")}
      >
        <FaArrowLeft />
        Back to Dashboard
      </button>

      <section className="emergency-hero">
        <div className="emergency-hero-icon">
          <FaAmbulance />
        </div>

        <div>
          <span className="emergency-eyebrow">
            NURTURE AI SAFETY
          </span>

          <h1>Emergency Assistance</h1>

          <p>
            Need urgent help? Call a family member connected to your
            account.
          </p>
        </div>
      </section>

      <section className="emergency-call-section">
        <h2>Your Emergency Contacts</h2>

        <p className="emergency-section-description">
          Select a family member to open your device&apos;s calling app.
        </p>

        {loading ? (
          <p className="emergency-state">
            Loading family contacts...
          </p>
        ) : error ? (
          <div className="emergency-error" role="alert">
            {error}
          </div>
        ) : members.length === 0 ? (
          <div className="emergency-empty">
            <FaUserCircle />

            <h3>No family members connected</h3>

            <p>
              Connect a family member in your Family Dashboard before
              using this feature.
            </p>

            <button
              type="button"
              className="emergency-secondary-button"
              onClick={() => navigate("/my-family")}
            >
              Open Family Dashboard
            </button>
          </div>
        ) : (
          <div className="emergency-contact-list">
            {members.map((member, index) => {
              const phoneNumber = getPhoneNumber(member);

              return (
                <article
                  className="emergency-contact-card"
                  key={member.familyMemberId ?? index}
                >
                  <div className="emergency-contact-avatar">
                    <FaUserCircle />
                  </div>

                  <div className="emergency-contact-info">
                    <h3>{member.memberName || "Family Member"}</h3>

                    <p>{member.relationship || "Family contact"}</p>

                    <span>
                      {phoneNumber || "Phone number not available"}
                    </span>
                  </div>

                  {phoneNumber ? (
                    <a
                      className="emergency-call-button"
                      href={`tel:${phoneNumber}`}
                      aria-label={`Call ${
                        member.memberName || "family member"
                      }`}
                    >
                      <FaPhoneAlt />
                      <span>Call</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="emergency-call-button disabled"
                      disabled
                    >
                      No Number
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className="emergency-safety-note">
        <strong>Important:</strong> For a life-threatening emergency
        in India, call 112. This feature opens your device&apos;s calling
        app; it does not automatically contact hospitals or emergency
        services.
      </div>
    </main>
  );
}

export default Emergency;

