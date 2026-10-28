
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import API from "../../services/api";

import "./AppointmentHistory.css";

function AppointmentHistory() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // BACK BUTTON
  const handleBack = () => {
    navigate(-1);
  };

  // FETCH APPOINTMENTS
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/appointments/my", {
        withCredentials: true,
      });

      const data = response.data;

      console.log("Appointments received:", data);

      let appointmentList = [];

      if (Array.isArray(data)) {
        appointmentList = data;
      } else if (Array.isArray(data?.appointments)) {
        appointmentList = data.appointments;
      } else if (Array.isArray(data?.appointmentHistory)) {
        appointmentList = data.appointmentHistory;
      } else if (Array.isArray(data?.upcomingAppointments)) {
        appointmentList = data.upcomingAppointments;
      } else if (Array.isArray(data?.upcoming)) {
        appointmentList = data.upcoming;
      } else if (Array.isArray(data?.futureAppointments)) {
        appointmentList = data.futureAppointments;
      }

      const uniqueAppointments = [];
      const seenIds = new Set();

      appointmentList.forEach((appointment, index) => {
        if (!appointment) return;

        const appointmentId =
          appointment.id ??
          appointment.appointmentId ??
          `appointment-${index}`;

        if (seenIds.has(appointmentId)) return;

        seenIds.add(appointmentId);

        uniqueAppointments.push({
          ...appointment,
          id: appointment.id ?? appointment.appointmentId,
        });
      });

      setAppointments(uniqueAppointments);
    } catch (err) {
      console.error("Appointment fetch error:", err);

      if (err.response?.status === 401) {
        setError(
          "Your login session has expired. Please login again."
        );

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1500);

        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You are not authorized to view your appointments."
        );
        return;
      }

      if (err.response?.status >= 500) {
        setError(
          "The server is currently unavailable. Please try again later."
        );
        return;
      }

      if (!err.response) {
        setError(
          "Unable to connect to the server. Please check your connection and make sure the backend is running."
        );
        return;
      }

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string"
          ? err.response.data
          : null);

      setError(
        backendMessage ||
          err.message ||
          "Unable to load your appointments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // APPOINTMENT STATUS
  const getAppointmentStatus = (appointment) => {
    if (
      appointment?.status &&
      appointment.status.toUpperCase() === "CANCELLED"
    ) {
      return "CANCELLED";
    }

    if (
      !appointment?.appointmentDate ||
      !appointment?.appointmentTime
    ) {
      return "UPCOMING";
    }

    const appointmentDateTime = new Date(
      `${appointment.appointmentDate}T${appointment.appointmentTime}`
    );

    if (Number.isNaN(appointmentDateTime.getTime())) {
      return "UPCOMING";
    }

    return appointmentDateTime.getTime() < Date.now()
      ? "COMPLETED"
      : "UPCOMING";
  };

  // SORT APPOINTMENTS: COMPLETED, UPCOMING, CANCELLED
  const getSortedAppointments = () => {
    const statusOrder = {
      COMPLETED: 1,
      UPCOMING: 2,
      CANCELLED: 3,
    };

    return [...appointments].sort((a, b) => {
      const statusA = getAppointmentStatus(a);
      const statusB = getAppointmentStatus(b);

      if (statusOrder[statusA] !== statusOrder[statusB]) {
        return statusOrder[statusA] - statusOrder[statusB];
      }

      const timeA = new Date(
        `${a.appointmentDate}T${a.appointmentTime}`
      ).getTime();

      const timeB = new Date(
        `${b.appointmentDate}T${b.appointmentTime}`
      ).getTime();

      if (Number.isNaN(timeA)) return 1;
      if (Number.isNaN(timeB)) return -1;

      return timeA - timeB;
    });
  };

  const sortedAppointments = getSortedAppointments();

  // FORMAT DATE
  const formatDate = (date) => {
    if (!date) return "-";

    const formattedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(formattedDate.getTime())) return "-";

    return formattedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // FORMAT TIME
  const formatTime = (time) => {
    if (!time) return "-";

    const [hours, minutes] = time.split(":");
    const date = new Date();

    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // STATUS ICON
  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return "✓";
      case "CANCELLED":
        return "×";
      case "UPCOMING":
        return "•";
      default:
        return "•";
    }
  };

  // COUNTS
  const completedCount = appointments.filter(
    (appointment) =>
      getAppointmentStatus(appointment) === "COMPLETED"
  ).length;

  const upcomingCount = appointments.filter(
    (appointment) =>
      getAppointmentStatus(appointment) === "UPCOMING"
  ).length;

  const cancelledCount = appointments.filter(
    (appointment) =>
      getAppointmentStatus(appointment) === "CANCELLED"
  ).length;

  // CANCEL APPOINTMENT
  const handleCancelAppointment = async (appointmentId) => {
    if (!appointmentId) {
      setError("Unable to identify this appointment.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await API.put(
        `/appointments/${appointmentId}/cancel`,
        null,
        { withCredentials: true }
      );

      console.log(
        "Appointment cancelled successfully:",
        response.data
      );

      await fetchAppointments();
    } catch (err) {
      console.error("Cancel appointment error:", err);

      if (err.response?.status === 401) {
        setError(
          "Your login session has expired. Please login again."
        );

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1500);

        return;
      }

      if (err.response?.status === 404) {
        setError("Appointment not found.");
        return;
      }

      if (err.response?.status === 403) {
        setError("You cannot cancel this appointment.");
        return;
      }

      if (!err.response) {
        setError(
          "Unable to connect to the server. Please check your connection and make sure the backend is running."
        );
        return;
      }

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string"
          ? err.response.data
          : null);

      setError(
        backendMessage ||
          err.message ||
          "Unable to cancel appointment. Please try again."
      );
    }
  };

  return (
    <div className="appointment-history-layout">
      <Sidebar />

      <div className="appointment-history-main">
        <Navbar />

        <main className="appointment-history-content">
          {/* PAGE HEADER */}
          <section className="history-header">
            <div className="history-heading">
              <div className="history-title-icon">📅</div>

              <div className="history-heading-text">
                <span className="history-eyebrow">
                  YOUR HEALTH JOURNEY
                </span>

                <h1>Appointment History</h1>

                <p>
                  Keep track of your pregnancy consultations
                  and upcoming visits.
                </p>
              </div>
            </div>

            <div className="history-header-actions">
              <button
                type="button"
                className="history-back-btn"
                onClick={handleBack}
                aria-label="Go back to previous page"
              >
                <span aria-hidden="true">←</span>
                Back
              </button>

              <button
                type="button"
                className="add-history-btn"
                onClick={() => navigate("/appointment")}
              >
                <span className="add-history-icon">+</span>
                Add Appointment
              </button>
            </div>
          </section>

          {/* STATISTICS */}
          {!loading && !error && appointments.length > 0 && (
            <section className="history-mini-stats">
              <div className="mini-stat total-stat">
                <div className="mini-stat-icon">📋</div>
                <div>
                  <span>Total</span>
                  <strong>{appointments.length}</strong>
                </div>
              </div>

              <div className="mini-stat completed-stat">
                <div className="mini-stat-icon">✓</div>
                <div>
                  <span>Completed</span>
                  <strong>{completedCount}</strong>
                </div>
              </div>

              <div className="mini-stat upcoming-stat">
                <div className="mini-stat-icon">◷</div>
                <div>
                  <span>Upcoming</span>
                  <strong>{upcomingCount}</strong>
                </div>
              </div>

              <div className="mini-stat cancelled-stat">
                <div className="mini-stat-icon">×</div>
                <div>
                  <span>Cancelled</span>
                  <strong>{cancelledCount}</strong>
                </div>
              </div>
            </section>
          )}

          {/* ERROR */}
          {error && (
            <div className="history-error" role="alert">
              <div className="error-icon">!</div>

              <div className="history-error-message">
                <strong>Something went wrong</strong>
                <p>{error}</p>
              </div>

              <button
                type="button"
                onClick={fetchAppointments}
                disabled={loading}
              >
                Retry
              </button>
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="history-loading">
              <div className="loading-animation">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <h3>Loading appointments</h3>
              <p>Please wait while we fetch your records.</p>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && appointments.length === 0 && (
            <section className="history-empty">
              <div className="empty-calendar">
                <div className="calendar-top"></div>
                <div className="calendar-body">📅</div>
              </div>

              <span className="empty-eyebrow">
                YOUR APPOINTMENTS
              </span>

              <h2>No Appointments Yet</h2>

              <p>
                You don't have any pregnancy consultations
                recorded yet. Schedule your first visit to
                keep your care journey organized.
              </p>

              <button
                type="button"
                className="empty-add-btn"
                onClick={() => navigate("/appointment")}
              >
                <span>+</span>
                Add Your First Appointment
              </button>
            </section>
          )}

          {/* APPOINTMENT LIST */}
          {!loading &&
            !error &&
            sortedAppointments.length > 0 && (
              <section className="appointments-section">
                <div className="appointments-section-header">
                  <div>
                    <span className="section-eyebrow">
                      YOUR RECORDS
                    </span>

                    <h2>Your Appointments</h2>

                    <p>
                      Completed, upcoming and cancelled
                      consultations.
                    </p>
                  </div>

                  <span className="appointment-count">
                    {sortedAppointments.length}{" "}
                    {sortedAppointments.length === 1
                      ? "Record"
                      : "Records"}
                  </span>
                </div>

                <div className="appointment-list">
                  {sortedAppointments.map(
                    (appointment, index) => {
                      const status =
                        getAppointmentStatus(appointment);

                      const appointmentKey =
                        appointment.id ??
                        appointment.appointmentId ??
                        `appointment-${index}`;

                      return (
                        <article
                          className="history-appointment-card"
                          key={appointmentKey}
                        >
                          {/* DATE */}
                          <div className="appointment-date-block">
                            <div className="date-icon">📅</div>

                            <strong>
                              {formatDate(
                                appointment.appointmentDate
                              )}
                            </strong>

                            <span>
                              {formatTime(
                                appointment.appointmentTime
                              )}
                            </span>
                          </div>

                          {/* APPOINTMENT DETAILS */}
                          <div className="history-appointment-main">
                            <div className="doctor-row">
                              <div className="history-doctor-avatar">
                                👩‍⚕️
                              </div>

                              <div className="history-doctor-info">
                                <h3>
                                  {appointment.doctorName ||
                                    "Doctor not assigned"}
                                </h3>

                                <p>
                                  {appointment.specialization ||
                                    "Gynecologist"}
                                </p>
                              </div>

                              <span
                                className={`history-status ${status.toLowerCase()}`}
                              >
                                <span className="status-dot">
                                  {getStatusIcon(status)}
                                </span>

                                {status}
                              </span>
                            </div>

                            <div className="appointment-details-grid">
                              <div className="appointment-detail">
                                <span className="detail-icon">
                                  🏥
                                </span>

                                <div>
                                  <small>Hospital</small>
                                  <strong>
                                    {appointment.hospital ||
                                      "Hospital not specified"}
                                  </strong>
                                </div>
                              </div>

                              <div className="appointment-detail">
                                <span className="detail-icon">
                                  📍
                                </span>

                                <div>
                                  <small>Location</small>
                                  <strong>
                                    {appointment.location ||
                                      "Location not specified"}
                                  </strong>
                                </div>
                              </div>

                              <div className="appointment-detail">
                                <span className="detail-icon">
                                  🩺
                                </span>

                                <div>
                                  <small>Purpose</small>
                                  <strong>
                                    {appointment.purpose ||
                                      "Purpose not specified"}
                                  </strong>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ACTIONS */}
                          <div className="history-card-action">
                            {status === "UPCOMING" && (
                              <>
                                <button
                                  type="button"
                                  className="reschedule-small-btn"
                                  onClick={() => {
                                    if (appointment.id != null) {
                                      navigate(
                                        `/appointment/${appointment.id}`
                                      );
                                    }
                                  }}
                                  disabled={appointment.id == null}
                                >
                                  Reschedule
                                </button>

                                <button
                                  type="button"
                                  className="cancel-small-btn"
                                  onClick={() =>
                                    handleCancelAppointment(
                                      appointment.id
                                    )
                                  }
                                  disabled={appointment.id == null}
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            <button
                              type="button"
                              className="view-small-btn"
                              onClick={() =>
                                navigate("/prescriptions")
                              }
                            >
                              View All <span>→</span>
                            </button>
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              </section>
            )}
        </main>
      </div>
    </div>
  );
}

export default AppointmentHistory;
