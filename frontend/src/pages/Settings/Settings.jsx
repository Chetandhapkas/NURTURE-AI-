
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaBell,
  FaShieldAlt,
  FaPalette,
  FaGlobe,
  FaQuestionCircle,
  FaChevronRight,
  FaCheckCircle,
  FaLock,
  FaCalendarAlt,
  FaPills,
  FaSyringe,
  FaUsers,
  FaHeart,
  FaInfoCircle,
  FaArrowLeft,
} from "react-icons/fa";

import Sidebar from "../../components/sidebar/Sidebar.jsx";
import API from "../../services/api";
import "./Settings.css";

const SETTINGS_KEY = "nurtureAISettings";

const DEFAULT_SETTINGS = {
  medicineReminders: true,
  vaccinationReminders: true,
  appointmentReminders: true,
  familyUpdates: true,
  emailNotifications: false,
  profileVisibility: true,
  familyDataSharing: true,
  language: "English",
  theme: "Lavender & Pink",
};

function getStoredValue(key) {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

function getUserRole(role) {
  if (!role) return "Mother";

  return role
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function Settings() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("account");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [user, setUser] = useState({
    name: "NURTURE AI User",
    email: "Email not available",
    role: "Mother",
  });

  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
  };

  const loadSettings = useCallback(async (id) => {
    setLoading(true);
    setSaved(false);
    setMessage("");

    try {
      const response = await API.get(
        `/settings/${encodeURIComponent(id)}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = response.data;

      const loadedSettings = {
        ...DEFAULT_SETTINGS,
        ...data,
      };

      setSettings(loadedSettings);

      localStorage.setItem(
        `${SETTINGS_KEY}_${id}`,
        JSON.stringify(loadedSettings)
      );
    } catch (error) {
      console.error("Settings loading failed:", error);

      try {
        const backup = localStorage.getItem(`${SETTINGS_KEY}_${id}`);

        if (backup) {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...JSON.parse(backup),
          });
        }
      } catch (backupError) {
        console.error("Unable to read settings backup:", backupError);
      }

      const detail =
        error.response?.data?.message ||
        error.response?.data ||
        error.message;

      showMessage(
        `Could not load settings from the server. ${
          typeof detail === "string" ? detail : error.message
        }`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedName = getStoredValue("fullName");
    const storedEmail = getStoredValue("email");
    const storedRole = getStoredValue("role");
    const storedUserId = getStoredValue("userId");

    setUser({
      name: storedName || "NURTURE AI User",
      email: storedEmail || "Email not available",
      role: getUserRole(storedRole),
    });

    if (
      !storedUserId ||
      !Number.isInteger(Number(storedUserId)) ||
      Number(storedUserId) <= 0
    ) {
      setLoading(false);
      showMessage(
        "Your user ID is missing. Please log in again before changing settings.",
        "error"
      );
      return;
    }

    setUserId(String(storedUserId));
    loadSettings(String(storedUserId));
  }, [loadSettings]);

  const updateSetting = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSaved(false);
    setMessage("");
  };

  const saveSettings = async () => {
    if (!userId) {
      showMessage("User ID is missing. Please log in again.", "error");
      return;
    }

    setSaving(true);
    setSaved(false);
    setMessage("");

    try {
      const response = await API.put(
        `/settings/${encodeURIComponent(userId)}`,
        settings,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const data = response.data;

      const updatedSettings = {
        ...DEFAULT_SETTINGS,
        ...(data && typeof data === "object" ? data : settings),
      };

      setSettings(updatedSettings);

      localStorage.setItem(
        `${SETTINGS_KEY}_${userId}`,
        JSON.stringify(updatedSettings)
      );

      setSaved(true);
      showMessage("Your settings have been saved successfully.", "success");
    } catch (error) {
      console.error("Settings save failed:", error);

      const detail =
        error.response?.data?.message ||
        error.response?.data ||
        error.message;

      showMessage(
        `Unable to save settings to the server. ${
          typeof detail === "string" ? detail : error.message
        }`,
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: "account", label: "Account & Profile", icon: FaUserCircle },
    { id: "notifications", label: "Notifications", icon: FaBell },
    { id: "privacy", label: "Privacy & Security", icon: FaShieldAlt },
    { id: "preferences", label: "App Preferences", icon: FaPalette },
    { id: "help", label: "Help & About", icon: FaQuestionCircle },
  ];

  const renderToggle = (key, label, description, Icon) => (
    <div className="setting-option" key={key}>
      <div className="setting-option-icon">
        <Icon />
      </div>

      <div className="setting-option-content">
        <h4>{label}</h4>
        <p>{description}</p>
      </div>

      <button
        type="button"
        className={`setting-toggle ${settings[key] ? "enabled" : ""}`}
        role="switch"
        aria-checked={Boolean(settings[key])}
        aria-label={label}
        disabled={loading || saving}
        onClick={() => updateSetting(key, !settings[key])}
      >
        <span />
      </button>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "account":
        return (
          <>
            <div className="settings-section-heading">
              <span className="settings-kicker">YOUR ACCOUNT</span>
              <h2>Account & Profile</h2>
              <p>Review your account information and personal details.</p>
            </div>

            <div className="settings-profile-card">
              <div className="settings-profile-avatar">
                <FaUserCircle />
              </div>

              <div className="settings-profile-info">
                <h3>{user.name}</h3>
                <p>{user.email}</p>
                <span className="settings-role-badge">
                  <FaCheckCircle /> {user.role}
                </span>
              </div>
            </div>

            <div className="settings-card">
              <h3>Account Information</h3>

              <div className="settings-info-row">
                <div>
                  <span>Full name</span>
                  <strong>{user.name}</strong>
                </div>
                <FaUserCircle />
              </div>

              <div className="settings-info-row">
                <div>
                  <span>Email address</span>
                  <strong>{user.email}</strong>
                </div>
                <FaCheckCircle />
              </div>

              <div className="settings-info-row">
                <div>
                  <span>Account role</span>
                  <strong>{user.role}</strong>
                </div>
                <FaShieldAlt />
              </div>

              <div className="settings-note">
                <FaInfoCircle />
                <span>
                  Profile details are displayed from your login session.
                  Editing your name or email requires integration with your
                  existing profile API.
                </span>
              </div>
            </div>
          </>
        );

      case "notifications":
        return (
          <>
            <div className="settings-section-heading">
              <span className="settings-kicker">STAY INFORMED</span>
              <h2>Notifications</h2>
              <p>Choose the reminders and updates you want to receive.</p>
            </div>

            <div className="settings-card">
              <h3>Health Reminders</h3>

              {renderToggle(
                "medicineReminders",
                "Medicine reminders",
                "Reminders for scheduled medicines.",
                FaPills
              )}

              {renderToggle(
                "vaccinationReminders",
                "Vaccination alerts",
                "Get notified about upcoming vaccinations.",
                FaSyringe
              )}

              {renderToggle(
                "appointmentReminders",
                "Appointment reminders",
                "Keep track of upcoming doctor appointments.",
                FaCalendarAlt
              )}
            </div>

            <div className="settings-card">
              <h3>Updates & Communication</h3>

              {renderToggle(
                "familyUpdates",
                "Family updates",
                "Receive updates related to family support.",
                FaUsers
              )}

              {renderToggle(
                "emailNotifications",
                "Email notifications",
                "Your preference for receiving updates by email.",
                FaBell
              )}
            </div>
          </>
        );

      case "privacy":
        return (
          <>
            <div className="settings-section-heading">
              <span className="settings-kicker">YOUR PRIVACY MATTERS</span>
              <h2>Privacy & Security</h2>
              <p>Review your privacy preferences and account protection.</p>
            </div>

            <div className="settings-card">
              <h3>Privacy Preferences</h3>

              {renderToggle(
                "profileVisibility",
                "Profile visibility",
                "Your preference for profile visibility to connected family members.",
                FaUserCircle
              )}

              {renderToggle(
                "familyDataSharing",
                "Family data sharing",
                "Your preference for sharing wellness information with family.",
                FaUsers
              )}

              <div className="settings-note">
                <FaInfoCircle />
                <span>
                  These preferences are stored in the backend. They do not
                  restrict access to family data unless the corresponding
                  backend APIs also enforce these permissions.
                </span>
              </div>
            </div>

            <div className="settings-card">
              <h3>Account Security</h3>

              <div className="settings-action-row">
                <div className="settings-action-icon">
                  <FaLock />
                </div>

                <div className="settings-action-content">
                  <h4>Password & login</h4>
                  <p>Manage your account authentication.</p>
                </div>

                <span className="settings-coming-soon">
                  Coming Soon
                </span>
              </div>
            </div>
          </>
        );

      case "preferences":
        return (
          <>
            <div className="settings-section-heading">
              <span className="settings-kicker">MAKE IT YOURS</span>
              <h2>App Preferences</h2>
              <p>Personalize your NURTURE AI experience.</p>
            </div>

            <div className="settings-card">
              <h3>Display & Language</h3>

              <div className="settings-action-row">
                <div className="settings-action-icon">
                  <FaPalette />
                </div>

                <div className="settings-action-content">
                  <h4>Color theme</h4>
                  <p>Choose your preferred appearance.</p>
                </div>

                <span className="settings-coming-soon">
                  Coming Soon
                </span>
              </div>

              <div className="settings-action-row">
                <div className="settings-action-icon">
                  <FaGlobe />
                </div>

                <div className="settings-action-content">
                  <h4>Language</h4>
                  <p>Choose your preferred display language.</p>
                </div>

                <span className="settings-coming-soon">
                  Coming Soon
                </span>
              </div>

              <div className="settings-note">
                <FaInfoCircle />
                <span>
                  Theme customization and additional language support
                  will be available in a future update.
                </span>
              </div>
            </div>
          </>
        );

      case "help":
        return (
          <>
            <div className="settings-section-heading">
              <span className="settings-kicker">WE ARE HERE FOR YOU</span>
              <h2>Help & About</h2>
              <p>Learn more about the platform and its purpose.</p>
            </div>

            <div className="settings-card">
              <h3>About NURTURE AI</h3>

              <div className="settings-about-brand">
                <div className="settings-brand-icon">
                  <FaHeart />
                </div>

                <div>
                  <h3>NURTURE AI</h3>
                  <p>Personalized Pregnancy Wellness & Family Support</p>
                  <span>Version 1.0.0</span>
                </div>
              </div>

              <p className="settings-about-description">
                NURTURE AI supports pregnancy wellness through health
                tracking, nutrition guidance, reminders, AI-assisted
                information, and family support.
              </p>

              <div className="settings-note">
                <FaInfoCircle />
                <span>
                  NURTURE AI is a wellness support platform and is not a
                  replacement for advice or treatment from a qualified
                  healthcare professional.
                </span>
              </div>
            </div>

            <div className="settings-card">
              <h3>Support</h3>

              <div className="settings-action-row">
                <div className="settings-action-icon">
                  <FaQuestionCircle />
                </div>

                <div className="settings-action-content">
                  <h4>Help & support</h4>
                  <p>Contact support when a support channel is configured.</p>
                </div>

                <span className="settings-coming-soon">
                  Coming Soon
                </span>
              </div>

              <div className="settings-action-row">
                <div className="settings-action-icon">
                  <FaShieldAlt />
                </div>

                <div className="settings-action-content">
                  <h4>Privacy information</h4>
                  <p>Review how your information is handled.</p>
                </div>

                <span className="settings-coming-soon">
                  Coming Soon
                </span>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settings-layout">
      <Sidebar />

      <main className="settings-page">
        <header className="settings-header">
          <div className="settings-header-copy">
            <span className="settings-kicker">
              NURTURE AI · PERSONAL WELLNESS
            </span>
            <h1>Settings</h1>
            <p>
              Manage your account, preferences, notifications, and privacy
              in one place.
            </p>
          </div>

          <div className="settings-header-art" aria-hidden="true">
            <FaHeart />
          </div>
        </header>

        <div className="settings-breadcrumb">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <FaArrowLeft />
          </button>
          <span>Home</span>
          <FaChevronRight />
          <strong>Settings</strong>
        </div>

        {message && (
          <div
            className={`settings-status settings-status-${messageType}`}
            role="status"
            aria-live="polite"
          >
            {messageType === "success" ? (
              <FaCheckCircle />
            ) : (
              <FaInfoCircle />
            )}
            <span>{message}</span>
          </div>
        )}

        <div className="settings-content">
          <aside className="settings-nav">
            <div className="settings-nav-title">SETTINGS MENU</div>

            {sections.map((section) => {
              const Icon = section.icon;

              return (
                <button
                  type="button"
                  key={section.id}
                  className={`settings-nav-item ${
                    activeSection === section.id ? "active" : ""
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon />
                  <span>{section.label}</span>
                  <FaChevronRight className="settings-nav-arrow" />
                </button>
              );
            })}

            <div className="settings-sidebar-tip">
              <FaHeart />
              <strong>Your wellness matters</strong>
              <p>
                Small steps toward better care can make a meaningful
                difference.
              </p>
            </div>
          </aside>

          <section className="settings-main-panel">
            {loading ? (
              <div className="settings-loading">
                <span className="settings-spinner" />
                <p>Loading your settings...</p>
              </div>
            ) : (
              renderSection()
            )}

            <div className="settings-save-bar">
              <span className={saved ? "settings-save-success" : ""}>
                {saved ? (
                  <>
                    <FaCheckCircle /> Preferences saved
                  </>
                ) : (
                  "Save your changes to update your account preferences."
                )}
              </span>

              <button
                type="button"
                className="settings-save-button"
                onClick={saveSettings}
                disabled={loading || saving || !userId}
              >
                <FaCheckCircle />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </section>
        </div>

        <footer className="settings-footer">
          <FaHeart />
          Made with care by NURTURE AI
        </footer>
      </main>
    </div>
  );
}
