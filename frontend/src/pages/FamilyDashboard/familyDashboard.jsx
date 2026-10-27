
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaPhone,
  FaEnvelope,
  FaBirthdayCake,
  FaHeart,
  FaBaby,
  FaCalendarAlt,
  FaPills,
  FaBell,
  FaSignOutAlt,
  FaArrowLeft,
  FaShieldAlt,
  FaClock,
  FaHospital,
  FaUserMd,
  FaCheckCircle,
  FaSyringe,
  FaClipboardList,
  FaExclamationTriangle,
  FaSyncAlt,
} from "react-icons/fa";

import api from "../../services/api";
import "./familyDashboard.css";

const getToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
};

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "Not scheduled";

  const time = String(value);

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return time;
};

const formatValue = (value, fallback = "Not available") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") return value ? "Yes" : "No";

  return String(value);
};

const normalizeStatus = (value) =>
  String(value || "PENDING")
    .trim()
    .replace(/[_-]+/g, " ")
    .toUpperCase();

const getStatusClass = (value) => {
  const status = normalizeStatus(value);

  if (
    status.includes("COMPLETED") ||
    status.includes("TAKEN") ||
    status.includes("CONFIRMED") ||
    status.includes("DONE")
  ) {
    return "status-success";
  }

  if (
    status.includes("CANCELLED") ||
    status.includes("CANCELED") ||
    status.includes("MISSED")
  ) {
    return "status-danger";
  }

  if (
    status.includes("PENDING") ||
    status.includes("SCHEDULED") ||
    status.includes("UPCOMING") ||
    status.includes("ACTIVE")
  ) {
    return "status-pending";
  }

  return "status-neutral";
};

const displayStatus = (value) => {
  const status = normalizeStatus(value);

  const labels = {
    TAKEN: "Taken",
    COMPLETED: "Completed",
    PENDING: "Pending",
    ACTIVE: "Active",
    CANCELLED: "Cancelled",
    CANCELED: "Cancelled",
    SCHEDULED: "Scheduled",
    CONFIRMED: "Confirmed",
    MISSED: "Missed",
    LOCKED: "Locked",
  };

  return (
    labels[status] ||
    status.toLowerCase().replace(/\b\w/g, (character) =>
      character.toUpperCase()
    )
  );
};

const getAppointmentDate = (appointment) =>
  appointment?.appointmentDate ||
  appointment?.scheduledDate ||
  appointment?.date ||
  null;

const getAppointmentTime = (appointment) =>
  appointment?.appointmentTime ||
  appointment?.scheduledTime ||
  appointment?.time ||
  null;

const getAppointmentStatus = (appointment) =>
  appointment?.status || "SCHEDULED";

const getBackendErrorMessage = (err) => {
  const data = err?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object") {
    if (data.message) return String(data.message);
    if (data.error) return String(data.error);
    if (data.detail) return String(data.detail);
    if (data.title) return String(data.title);
  }

  if (err?.response?.status === 400) {
    return "The server rejected the dashboard request (400 Bad Request). Check the backend error in the terminal.";
  }

  if (err?.response?.status === 401) {
    return "Your session is not authorized. Please log in again.";
  }

  if (err?.response?.status === 403) {
    return "You do not have permission to view this family dashboard.";
  }

  if (err?.response?.status === 404) {
    return "The family dashboard endpoint or linked family member was not found.";
  }

  if (!err?.response) {
    return "Cannot connect to the backend. Make sure the Spring Boot server is running.";
  }

  return err.message || "Unable to load the family dashboard.";
};

const FamilyDashboard = () => {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [todayMedicineSchedule, setTodayMedicineSchedule] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const familyMemberUserId = localStorage.getItem("userId");

  const loadDashboard = async (isRefresh = false) => {
    if (!familyMemberUserId) {
      const message = "Your login session was not found. Please log in again.";
      console.error("Family dashboard error:", message);
      setError(message);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      console.info(
        "Loading family dashboard for user ID:",
        familyMemberUserId
      );

      const response = await api.get(
        `/family-members/dashboard/${familyMemberUserId}`,
        { withCredentials: true }
      );

      const data = response?.data || {};

      console.info("Family dashboard loaded successfully:", data);

      setDashboard(data);
      setMedicines(
        Array.isArray(data.medicines) ? data.medicines : []
      );
      setTodayMedicineSchedule(
        Array.isArray(data.todayMedicineSchedule)
          ? data.todayMedicineSchedule
          : []
      );
      setVaccinations(
        Array.isArray(data.vaccinations) ? data.vaccinations : []
      );
    } catch (err) {
      const message = getBackendErrorMessage(err);

      console.error("Failed to load family dashboard:", err);
      console.error("Dashboard request URL:", 
        `/family-members/dashboard/${familyMemberUserId}`
      );
      console.error("HTTP status:", err?.response?.status);
      console.error("Backend error response:", err?.response?.data);
      console.error("Dashboard error message:", message);

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyMemberUserId]);

  const appointments = useMemo(
    () =>
      Array.isArray(dashboard?.appointments)
        ? dashboard.appointments
        : [],
    [dashboard]
  );

  const upcomingAppointments = useMemo(() => {
    const today = getToday();

    return appointments
      .filter((appointment) => {
        const status = normalizeStatus(getAppointmentStatus(appointment));
        const date = getAppointmentDate(appointment);

        return (
          date &&
          date >= today &&
          !status.includes("CANCELLED") &&
          !status.includes("CANCELED") &&
          !status.includes("COMPLETED") &&
          !status.includes("DONE")
        );
      })
      .sort((a, b) => {
        const dateA = `${getAppointmentDate(a)} ${
          getAppointmentTime(a) || ""
        }`;
        const dateB = `${getAppointmentDate(b)} ${
          getAppointmentTime(b) || ""
        }`;

        return dateA.localeCompare(dateB);
      });
  }, [appointments]);

  const completedAppointments = useMemo(
    () =>
      appointments.filter((appointment) => {
        const status = normalizeStatus(getAppointmentStatus(appointment));

        return (
          status.includes("COMPLETED") ||
          status.includes("DONE") ||
          status.includes("VISITED")
        );
      }),
    [appointments]
  );

  const nextUpcomingAppointment = upcomingAppointments[0] || null;

  const nextUpcomingVaccination = useMemo(() => {
    const today = getToday();

    return (
      vaccinations
        .filter((vaccination) => {
          const status = normalizeStatus(vaccination?.status);
          const date =
            vaccination?.scheduledDate || vaccination?.availableFrom;

          return (
            date &&
            date >= today &&
            !status.includes("COMPLETED") &&
            !status.includes("TAKEN") &&
            !status.includes("CANCELLED") &&
            !status.includes("CANCELED")
          );
        })
        .sort((a, b) => {
          const dateA = a.scheduledDate || a.availableFrom || "";
          const dateB = b.scheduledDate || b.availableFrom || "";
          return dateA.localeCompare(dateB);
        })[0] || null
    );
  }, [vaccinations]);

  const sortedTodaySchedule = useMemo(
    () =>
      [...todayMedicineSchedule].sort((a, b) =>
        String(a?.scheduledTime || "").localeCompare(
          String(b?.scheduledTime || "")
        )
      ),
    [todayMedicineSchedule]
  );

  const motherName = dashboard?.name || "Mother";
  const pregnancyWeek = dashboard?.pregnancyWeek;
  const healthScore = dashboard?.healthScore;
  const dueDate = dashboard?.dueDate;
  const trimester = dashboard?.trimester;

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("fullName");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("familyVerified");
    navigate("/login");
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="family-dashboard-page">
        <div className="family-dashboard-loading">
          <div className="family-loading-spinner" />
          <h2>Loading Family Dashboard</h2>
          <p>Please wait while we load the latest information.</p>
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="family-dashboard-page">
        <div className="family-dashboard-error" role="alert">
          <FaExclamationTriangle />
          <h2>Unable to Load Dashboard</h2>
          <p>{error}</p>

          <div className="family-error-actions">
            <button
              type="button"
              className="family-primary-button"
              onClick={() => loadDashboard()}
              disabled={loading}
            >
              <FaSyncAlt /> Try Again
            </button>

            <button
  type="button"
  className="family-logout-button"
  onClick={handleLogout}
  aria-label="Log out"
  title="Log out"
>
  <FaSignOutAlt />
  <span>Logout</span>
</button>

            <button
              type="button"
              className="family-secondary-button"
              onClick={handleLogout}
            >
              <FaSignOutAlt /> Log Out
            </button>
          </div>

          <p className="family-error-help">
            If this continues, check the Spring Boot terminal for the
            exception generated by the dashboard API.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="family-dashboard-page">
      <header className="family-dashboard-header">
        <div className="family-header-left">
          <button
            type="button"
            className="family-icon-button"
            onClick={handleBack}
            aria-label="Go back"
            title="Go back"
          >
            <FaArrowLeft />
          </button>

          <div className="family-brand-mark">
            <FaHeart />
          </div>

          <div className="family-header-title">
            <h1>NURTURE AI</h1>
            <p>Family Care Dashboard</p>
          </div>
        </div>

        <div className="family-header-actions">
          <button
            type="button"
            className="family-refresh-button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
          >
            <FaSyncAlt className={refreshing ? "family-spinning" : ""} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button
            type="button"
            className="family-logout-button"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="family-dashboard-main">
        {error && (
          <div className="family-inline-error" role="alert">
            <FaExclamationTriangle />
            <span>
              {error} Displaying the last successfully loaded information.
            </span>
            <button
              type="button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
            >
              Retry
            </button>
          </div>
        )}

        <section className="family-welcome-banner">
          <div className="family-welcome-content">
            <span className="family-eyebrow">FAMILY OVERVIEW</span>
            <h2>Welcome to your Family Dashboard</h2>
            <p>
              Stay connected with {motherName}&apos;s pregnancy journey,
              appointments, medicines, and vaccination schedule.
            </p>
          </div>

          <div className="family-welcome-icon">
            <FaHeart />
          </div>
        </section>

        <section className="family-mother-profile family-panel">
          <div className="family-profile-avatar">
            <FaUserCircle />
          </div>

          <div className="family-profile-details">
            <span className="family-section-kicker">MOTHER&apos;S PROFILE</span>
            <h2>{motherName}</h2>

            <div className="family-profile-meta">
              {dashboard?.email && (
                <span>
                  <FaEnvelope /> {dashboard.email}
                </span>
              )}

              {dashboard?.phone && (
                <span>
                  <FaPhone /> {dashboard.phone}
                </span>
              )}

              {dashboard?.age !== null &&
                dashboard?.age !== undefined &&
                dashboard?.age !== "" && (
                  <span>
                    <FaBirthdayCake /> {dashboard.age} years old
                  </span>
                )}
            </div>
          </div>

          <div className="family-profile-tag">
            <FaHeart /> Pregnancy Care
          </div>
        </section>

        <section className="family-summary-grid">
          <article className="family-summary-card">
            <div className="family-summary-icon pregnancy-icon">
              <FaBaby />
            </div>
            <div>
              <p>Pregnancy Week</p>
              <h3>
                {pregnancyWeek !== null &&
                pregnancyWeek !== undefined &&
                pregnancyWeek !== ""
                  ? `Week ${pregnancyWeek}`
                  : "Not available"}
              </h3>
              <span>{formatValue(trimester, "Trimester not available")}</span>
            </div>
          </article>

          <article className="family-summary-card">
            <div className="family-summary-icon appointment-icon">
              <FaCalendarAlt />
            </div>
            <div>
              <p>Upcoming Appointments</p>
              <h3>{upcomingAppointments.length}</h3>
              <span>
                {nextUpcomingAppointment
                  ? formatDate(getAppointmentDate(nextUpcomingAppointment))
                  : "No upcoming appointments"}
              </span>
            </div>
          </article>

          <article className="family-summary-card">
            <div className="family-summary-icon medicine-icon">
              <FaPills />
            </div>
            <div>
              <p>Medicines</p>
              <h3>{medicines.length}</h3>
              <span>{todayMedicineSchedule.length} scheduled today</span>
            </div>
          </article>

          <article className="family-summary-card">
            <div className="family-summary-icon vaccination-icon">
              <FaSyringe />
            </div>
            <div>
              <p>Vaccinations</p>
              <h3>{vaccinations.length}</h3>
              <span>
                {nextUpcomingVaccination
                  ? `Next: ${formatDate(
                      nextUpcomingVaccination.scheduledDate ||
                        nextUpcomingVaccination.availableFrom
                    )}`
                  : "No upcoming vaccination"}
              </span>
            </div>
          </article>
        </section>

        <section className="family-section">
          <div className="family-section-heading">
            <div>
              <span className="family-section-kicker">PREGNANCY DETAILS</span>
              <h2>Pregnancy Overview</h2>
              <p>Important information about the current pregnancy.</p>
            </div>
            <div className="family-heading-icon">
              <FaBaby />
            </div>
          </div>

          <div className="family-info-grid">
            <div className="family-info-card">
              <span className="family-info-label">Pregnancy Week</span>
              <strong>
                {pregnancyWeek !== null &&
                pregnancyWeek !== undefined &&
                pregnancyWeek !== ""
                  ? `Week ${pregnancyWeek}`
                  : "Not available"}
              </strong>
            </div>

            <div className="family-info-card">
              <span className="family-info-label">Trimester</span>
              <strong>{formatValue(trimester)}</strong>
            </div>

            <div className="family-info-card">
              <span className="family-info-label">Expected Due Date</span>
              <strong>{formatDate(dueDate)}</strong>
            </div>

            <div className="family-info-card">
              <span className="family-info-label">Pregnancy Type</span>
              <strong>{formatValue(dashboard?.pregnancyType)}</strong>
            </div>

            <div className="family-info-card">
              <span className="family-info-label">Number of Babies</span>
              <strong>{formatValue(dashboard?.babyCount)}</strong>
            </div>

            <div className="family-info-card">
              <span className="family-info-label">High-Risk Pregnancy</span>
              <strong
                className={
                  dashboard?.highRisk === true
                    ? "family-risk-text"
                    : "family-normal-text"
                }
              >
                {dashboard?.highRisk === true
                  ? "Requires extra care"
                  : dashboard?.highRisk === false
                    ? "Not marked high-risk"
                    : "Not available"}
              </strong>
            </div>
          </div>
        </section>

        <section className="family-section">
          <div className="family-section-heading">
            <div>
              <span className="family-section-kicker">MEDICINE TRACKER</span>
              <h2>Medicine Information</h2>
              <p>Review prescribed medicines and today&apos;s schedule.</p>
            </div>
            <div className="family-heading-icon medicine-heading-icon">
              <FaPills />
            </div>
          </div>

          <div className="family-highlight-grid">
            <article className="family-highlight-card">
              <div className="family-highlight-icon"><FaPills /></div>
              <div>
                <span>Total Medicines</span>
                <strong>{medicines.length}</strong>
              </div>
            </article>

            <article className="family-highlight-card">
              <div className="family-highlight-icon"><FaClock /></div>
              <div>
                <span>Today&apos;s Schedule</span>
                <strong>{todayMedicineSchedule.length}</strong>
              </div>
            </article>

            <article className="family-highlight-card">
              <div className="family-highlight-icon"><FaBell /></div>
              <div>
                <span>Next Reminder</span>
                <strong className="family-highlight-small">
                  {sortedTodaySchedule.length
                    ? formatTime(sortedTodaySchedule[0]?.scheduledTime)
                    : "No schedule"}
                </strong>
              </div>
            </article>
          </div>

          <div className="family-content-card">
            <div className="family-card-heading">
              <div>
                <h3><FaClipboardList /> Prescribed Medicines</h3>
                <p>Medicine details available in the system.</p>
              </div>
            </div>

            {medicines.length === 0 ? (
              <div className="family-empty-state">
                <FaPills />
                <h4>No medicine records found</h4>
                <p>
                  Medicine information will appear here when available for
                  the mother&apos;s account.
                </p>
              </div>
            ) : (
              <div className="family-record-list">
                {medicines.map((medicine, index) => (
                  <article
                    className="family-record-item"
                    key={medicine.id ?? `medicine-${index}`}
                  >
                    <div className="family-record-top">
                      <div className="family-record-title-wrap">
                        <div className="family-record-icon"><FaPills /></div>
                        <div>
                          <h4>{formatValue(medicine.medicineName, "Unnamed medicine")}</h4>
                          <p>{formatValue(medicine.dosage, "Dosage not specified")}</p>
                        </div>
                      </div>
                      <span className={`family-status ${getStatusClass(medicine.status)}`}>
                        {displayStatus(medicine.status || "ACTIVE")}
                      </span>
                    </div>

                    <div className="family-record-grid">
                      <div><span>Frequency</span><strong>{formatValue(medicine.frequency)}</strong></div>
                      <div><span>Start Date</span><strong>{formatDate(medicine.startDate)}</strong></div>
                      <div><span>End Date</span><strong>{formatDate(medicine.endDate)}</strong></div>
                      <div><span>Reminder 1</span><strong>{formatTime(medicine.reminderTime)}</strong></div>
                      <div><span>Reminder 2</span><strong>{medicine.reminderTime2 ? formatTime(medicine.reminderTime2) : "Not set"}</strong></div>
                      <div><span>Reminder 3</span><strong>{medicine.reminderTime3 ? formatTime(medicine.reminderTime3) : "Not set"}</strong></div>
                    </div>

                    {medicine.instructions && (
                      <div className="family-record-notes">
                        <strong>Instructions:</strong> {medicine.instructions}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="family-content-card">
            <div className="family-card-heading">
              <div>
                <h3><FaClock /> Today&apos;s Medicine Schedule</h3>
                <p>Scheduled medicine entries for today.</p>
              </div>
              <span className="family-date-chip">{formatDate(getToday())}</span>
            </div>

            {sortedTodaySchedule.length === 0 ? (
              <div className="family-empty-state">
                <FaClock />
                <h4>No medicine schedule available for today</h4>
                <p>
                  This section displays schedule entries created by the
                  backend for today.
                </p>
              </div>
            ) : (
              <div className="family-schedule-list">
                {sortedTodaySchedule.map((log, index) => (
                  <article
                    className="family-schedule-item"
                    key={log.id ?? `medicine-log-${index}`}
                  >
                    <div className="family-schedule-time">
                      <FaClock />
                      <strong>{formatTime(log.scheduledTime)}</strong>
                    </div>

                    <div className="family-schedule-details">
                      <h4>{log.medicineName || log.medicine?.medicineName || "Medicine"}</h4>
                      <p>{log.dosage || log.medicine?.dosage || "Follow the prescribed dosage"}</p>
                      {log.takenAt && (
                        <span className="family-taken-time">
                          Taken at {formatTime(log.takenAt)}
                        </span>
                      )}
                    </div>

                    <span className={`family-status ${getStatusClass(log.status)}`}>
                      {displayStatus(log.status)}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="family-section">
          <div className="family-section-heading">
            <div>
              <span className="family-section-kicker">PREVENTIVE CARE</span>
              <h2>Vaccination Schedule</h2>
              <p>Review available, upcoming, and completed vaccinations.</p>
            </div>
            <div className="family-heading-icon vaccination-heading-icon">
              <FaSyringe />
            </div>
          </div>

          {nextUpcomingVaccination && (
            <div className="family-next-vaccination">
              <div className="family-next-vaccination-icon"><FaSyringe /></div>
              <div>
                <span>Next Upcoming Vaccination</span>
                <h3>{formatValue(nextUpcomingVaccination.vaccineName, "Vaccination")}</h3>
                <p>
                  {formatDate(nextUpcomingVaccination.scheduledDate || nextUpcomingVaccination.availableFrom)}
                  {nextUpcomingVaccination.doseNumber ? ` · Dose ${nextUpcomingVaccination.doseNumber}` : ""}
                </p>
              </div>
            </div>
          )}

          <div className="family-content-card">
            <div className="family-card-heading">
              <div>
                <h3><FaSyringe /> Vaccination Records</h3>
                <p>Dates and status provided by the vaccination records.</p>
              </div>
            </div>

            {vaccinations.length === 0 ? (
              <div className="family-empty-state">
                <FaSyringe />
                <h4>No vaccination records found</h4>
                <p>
                  Vaccination details will appear here when records are
                  available for the mother&apos;s account.
                </p>
              </div>
            ) : (
              <div className="family-record-list">
                {vaccinations.map((vaccination, index) => (
                  <article
                    className="family-record-item"
                    key={vaccination.id ?? `vaccination-${index}`}
                  >
                    <div className="family-record-top">
                      <div className="family-record-title-wrap">
                        <div className="family-record-icon vaccination-record-icon"><FaSyringe /></div>
                        <div>
                          <h4>{formatValue(vaccination.vaccineName, "Vaccination")}</h4>
                          <p>{vaccination.doseNumber ? `Dose ${vaccination.doseNumber}` : "Dose not specified"}</p>
                        </div>
                      </div>
                      <span className={`family-status ${getStatusClass(vaccination.status)}`}>
                        {displayStatus(vaccination.status)}
                      </span>
                    </div>

                    <div className="family-record-grid">
                      <div><span>Available From</span><strong>{formatDate(vaccination.availableFrom)}</strong></div>
                      <div><span>Scheduled Date</span><strong>{formatDate(vaccination.scheduledDate)}</strong></div>
                      <div><span>Taken Date</span><strong>{formatDate(vaccination.takenDate)}</strong></div>
                    </div>

                    {vaccination.notes && (
                      <div className="family-record-notes">
                        <strong>Notes:</strong> {vaccination.notes}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="family-section">
          <div className="family-section-heading">
            <div>
              <span className="family-section-kicker">CARE PLANNING</span>
              <h2>Appointments</h2>
              <p>Follow upcoming visits and previously completed appointments.</p>
            </div>
            <div className="family-heading-icon appointment-heading-icon"><FaCalendarAlt /></div>
          </div>

          <div className="family-highlight-grid family-appointment-summary">
            <article className="family-highlight-card">
              <div className="family-highlight-icon"><FaCalendarAlt /></div>
              <div><span>Upcoming</span><strong>{upcomingAppointments.length}</strong></div>
            </article>
            <article className="family-highlight-card">
              <div className="family-highlight-icon"><FaCheckCircle /></div>
              <div><span>Completed</span><strong>{completedAppointments.length}</strong></div>
            </article>
            <article className="family-highlight-card">
              <div className="family-highlight-icon"><FaClock /></div>
              <div>
                <span>Next Appointment</span>
                <strong className="family-highlight-small">
                  {nextUpcomingAppointment
                    ? formatDate(getAppointmentDate(nextUpcomingAppointment))
                    : "Not scheduled"}
                </strong>
              </div>
            </article>
          </div>

          <div className="family-content-card">
            <div className="family-card-heading">
              <div>
                <h3><FaCalendarAlt /> Appointment Records</h3>
                <p>Appointment information received from the backend.</p>
              </div>
            </div>

            {appointments.length === 0 ? (
              <div className="family-empty-state">
                <FaCalendarAlt />
                <h4>No appointments found</h4>
                <p>Appointment records will appear here when available.</p>
              </div>
            ) : (
              <div className="family-record-list">
                {appointments.map((appointment, index) => {
                  const doctorName =
                    appointment?.doctorName ||
                    appointment?.doctor?.name ||
                    appointment?.doctor?.fullName;

                  const hospitalName =
                    appointment?.hospitalName ||
                    appointment?.hospital ||
                    appointment?.clinicName;

                  return (
                    <article
                      className="family-record-item"
                      key={appointment.id ?? `appointment-${index}`}
                    >
                      <div className="family-record-top">
                        <div className="family-record-title-wrap">
                          <div className="family-record-icon appointment-record-icon"><FaCalendarAlt /></div>
                          <div>
                            <h4>{formatValue(appointment.title || appointment.reason || appointment.appointmentType, "Medical Appointment")}</h4>
                            <p>
                              {formatDate(getAppointmentDate(appointment))}
                              {" · "}
                              {formatTime(getAppointmentTime(appointment))}
                            </p>
                          </div>
                        </div>
                        <span className={`family-status ${getStatusClass(getAppointmentStatus(appointment))}`}>
                          {displayStatus(getAppointmentStatus(appointment))}
                        </span>
                      </div>

                      <div className="family-appointment-details">
                        {doctorName && <span><FaUserMd /> {doctorName}</span>}
                        {hospitalName && (
                          <span>
                            <FaHospital />{" "}
                            {typeof hospitalName === "string"
                              ? hospitalName
                              : hospitalName?.name || "Hospital"}
                          </span>
                        )}
                        {appointment.notes && <span><FaClipboardList /> {appointment.notes}</span>}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="family-section">
          <div className="family-section-heading">
            <div>
              <span className="family-section-kicker">WELLNESS</span>
              <h2>Health &amp; Support</h2>
              <p>A quick overview to help family members stay informed.</p>
            </div>
            <div className="family-heading-icon health-heading-icon"><FaHeart /></div>
          </div>

          <div className="family-support-grid">
            <article className="family-support-card">
              <div className="family-support-icon"><FaHeart /></div>
              <h3>Health Score</h3>
              <p className="family-support-value">
                {healthScore !== null && healthScore !== undefined && healthScore !== ""
                  ? `${healthScore}${typeof healthScore === "number" ? "/100" : ""}`
                  : "Not available"}
              </p>
              <p>
                {healthScore !== null && healthScore !== undefined
                  ? "Based on the score provided by the system."
                  : "A health score has not been provided by the backend."}
              </p>
            </article>

            <article className="family-support-card">
              <div className="family-support-icon"><FaCalendarAlt /></div>
              <h3>Expected Due Date</h3>
              <p className="family-support-value">{formatDate(dueDate)}</p>
              <p>Keep track of important pregnancy milestones.</p>
            </article>

            <article className="family-support-card">
              <div className="family-support-icon"><FaBell /></div>
              <h3>Stay Updated</h3>
              <p className="family-support-value">Family Care</p>
              <p>
                Review medicine schedules, appointments, and vaccination
                records regularly.
              </p>
            </article>
          </div>
        </section>

        <section className="family-security-note">
          <div className="family-security-icon"><FaShieldAlt /></div>
          <div>
            <h3>Privacy &amp; Security</h3>
            <p>
              This dashboard displays information returned for the linked
              mother&apos;s account. Keep login details private and log out
              when using a shared device.
            </p>
          </div>
        </section>

        <footer className="family-dashboard-footer">
          <p><FaHeart /> NURTURE AI — Supporting mothers and families</p>
          <span>Pregnancy wellness and family support</span>
        </footer>
      </main>
    </div>
  );
};

export default FamilyDashboard;
