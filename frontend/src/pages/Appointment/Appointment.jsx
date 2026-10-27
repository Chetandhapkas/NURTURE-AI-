import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";

import API from "../../services/api";

import "./Appointment.css";

function Appointment() {
  const navigate = useNavigate();

  // =========================================================
  // FORM DATA
  // =========================================================

  const [formData, setFormData] = useState({
    doctorName: "",
    specialization: "Gynecologist",
    appointmentDate: "",
    appointmentTime: "",
    hospital: "City Care Hospital",
    location: "Nagpur",
    purpose: "Routine Pregnancy Check-up",
  });

  // =========================================================
  // STATE
  // =========================================================

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  // =========================================================
  // SAVE APPOINTMENT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    // =======================================================
    // DOCTOR VALIDATION
    // =======================================================

    if (!formData.doctorName.trim()) {
      setError("Please enter the doctor's name.");
      return;
    }

    // =======================================================
    // DATE VALIDATION
    // =======================================================

    if (!formData.appointmentDate) {
      setError("Please select appointment date.");
      return;
    }

    // =======================================================
    // TIME VALIDATION
    // =======================================================

    if (!formData.appointmentTime) {
      setError("Please select appointment time.");
      return;
    }

    // =======================================================
    // VALIDATE DATE + TIME
    // =======================================================

    const selectedDateTime = new Date(
      `${formData.appointmentDate}T${formData.appointmentTime}`
    );

    if (Number.isNaN(selectedDateTime.getTime())) {
      setError("Please select a valid appointment date and time.");
      return;
    }

    // =======================================================
    // IMPORTANT
    // =======================================================
    //
    // Past appointment:
    //       Backend -> COMPLETED
    //
    // Future appointment:
    //       Backend -> UPCOMING
    //
    // We intentionally do NOT use min={today}.
    //
    // =======================================================

    try {
      setLoading(true);

      // =====================================================
      // SEND TO BACKEND
      // =====================================================

      const response = await API.post(
        "/appointments",
        {
          doctorName: formData.doctorName.trim(),

          specialization:
            formData.specialization.trim(),

          appointmentDate:
            formData.appointmentDate,

          appointmentTime:
            formData.appointmentTime,

          hospital:
            formData.hospital.trim(),

          location:
            formData.location.trim(),

          purpose:
            formData.purpose.trim(),

          // Status is NOT sent.
          //
          // Backend automatically decides:
          //
          // Past -> COMPLETED
          // Future -> UPCOMING
        },
        {
          withCredentials: true,
        }
      );

      // =====================================================
      // SUCCESS RESPONSE
      // =====================================================

      const data = response.data;

      console.log(
        "Appointment saved successfully:",
        data
      );

      console.log(
        "Appointment ID:",
        data.id
      );

      console.log(
        "Appointment status:",
        data.status
      );

      // =====================================================
      // SIMPLE SUCCESS POPUP
      // =====================================================

      alert("✅ Appointment Saved Successfully!");

      // =====================================================
      // SHOW SUCCESS MESSAGE ON PAGE
      // =====================================================

      if (data.status === "COMPLETED") {
        setMessage(
          "Appointment added successfully. This appointment has been marked as Completed."
        );
      } else if (data.status === "UPCOMING") {
        setMessage(
          "Appointment added successfully. Your appointment is Upcoming."
        );
      } else if (data.status === "CANCELLED") {
        setMessage(
          "Appointment has been Cancelled."
        );
      } else {
        setMessage(
          "Appointment added successfully."
        );
      }

      // =====================================================
      // CLEAR DATE AND TIME
      // =====================================================

      setFormData((previous) => ({
        ...previous,
        appointmentDate: "",
        appointmentTime: "",
      }));

    } catch (err) {
      // =====================================================
      // APPOINTMENT SAVE ERROR
      // =====================================================

      console.error(
        "Appointment save error:",
        err
      );

      // =====================================================
      // SESSION EXPIRED
      // =====================================================

      if (err.response?.status === 401) {
        setError(
          "Your login session has expired. Please login again."
        );

        setTimeout(() => {
          navigate("/login", {
            replace: true,
          });
        }, 1500);

        return;
      }

      // =====================================================
      // BACKEND ERROR MESSAGE
      // =====================================================

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (
          typeof err.response?.data === "string"
            ? err.response.data
            : null
        );

      setError(
        backendMessage ||
        err.message ||
        "Unable to save appointment. Please check your backend connection."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CANCEL PAGE
  // =========================================================

  const handleCancel = () => {
    navigate("/appointment-history");
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="appointment-page-layout">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar />

      <div className="appointment-page-main">

        {/* ===================================================
            NAVBAR
        =================================================== */}

        <Navbar />

        <main className="appointment-page-content">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="appointment-page-header">

            <div className="appointment-heading">

              <div className="appointment-title-icon">
                📅
              </div>

              <div>

                <h1>
                  Add Appointment
                </h1>

                <p>
                  Schedule a new consultation or
                  record a previous consultation.
                </p>

              </div>

            </div>

            <button
              type="button"
              className="history-navigation-btn"
              onClick={() =>
                navigate("/appointment-history")
              }
            >
              📋 Appointment History
            </button>

          </div>

          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {message && (
            <div className="appointment-success">

              <div className="success-icon">
                ✓
              </div>

              <div>

                <strong>
                  Appointment Saved
                </strong>

                <p>
                  {message}
                </p>

              </div>

            </div>
          )}

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <div className="appointment-error">

              <div className="error-icon">
                !
              </div>

              <div>

                <strong>
                  Unable to Save
                </strong>

                <p>
                  {error}
                </p>

              </div>

            </div>
          )}

          {/* =================================================
              FORM CARD
          ================================================= */}

          <section className="appointment-form-card">

            {/* =================================================
                FORM HEADER
            ================================================= */}

            <div className="form-card-header">

              <div className="form-header-icon">
                🩺
              </div>

              <div>

                <h2>
                  Appointment Details
                </h2>

                <p>
                  Enter the details of your pregnancy
                  consultation.
                </p>

              </div>

            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleSubmit}
              className="appointment-form"
            >

              {/* =================================================
                  DOCTOR INFORMATION
              ================================================= */}

              <div className="form-section">

                <div className="form-section-title">

                  <span>
                    👩‍⚕️
                  </span>

                  <div>

                    <h3>
                      Doctor Information
                    </h3>

                    <p>
                      Enter the doctor who handled
                      your consultation.
                    </p>

                  </div>

                </div>

                <div className="form-grid">

                  {/* DOCTOR NAME */}

                  <div className="form-group">

                    <label>
                      Doctor Name
                      <span>*</span>
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        👩‍⚕️
                      </span>

                      <input
                        type="text"
                        name="doctorName"
                        value={
                          formData.doctorName
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Enter doctor's name"
                        disabled={loading}
                        required
                      />

                    </div>

                  </div>

                  {/* SPECIALIZATION */}

                  <div className="form-group">

                    <label>
                      Specialization
                      <span>*</span>
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        🩺
                      </span>

                      <select
                        name="specialization"
                        value={
                          formData.specialization
                        }
                        onChange={
                          handleChange
                        }
                        disabled={loading}
                        required
                      >

                        <option value="Gynecologist">
                          Gynecologist
                        </option>

                        <option value="Obstetrician">
                          Obstetrician
                        </option>

                        <option value="Obstetrician & Gynecologist">
                          Obstetrician & Gynecologist
                        </option>

                        <option value="Fetal Medicine Specialist">
                          Fetal Medicine Specialist
                        </option>

                        <option value="General Physician">
                          General Physician
                        </option>

                      </select>

                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  DATE & TIME
              ================================================= */}

              <div className="form-section">

                <div className="form-section-title">

                  <span>
                    🗓️
                  </span>

                  <div>

                    <h3>
                      Date & Time
                    </h3>

                    <p>
                      Enter the actual date and time
                      of your consultation.
                    </p>

                  </div>

                </div>

                <div className="form-grid">

                  {/* DATE */}

                  <div className="form-group">

                    <label>
                      Appointment Date
                      <span>*</span>
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        📅
                      </span>

                      <input
                        type="date"
                        name="appointmentDate"
                        value={
                          formData.appointmentDate
                        }
                        onChange={
                          handleChange
                        }
                        required
                        disabled={loading}
                      />

                    </div>

                  </div>

                  {/* TIME */}

                  <div className="form-group">

                    <label>
                      Appointment Time
                      <span>*</span>
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        🕐
                      </span>

                      <input
                        type="time"
                        name="appointmentTime"
                        value={
                          formData.appointmentTime
                        }
                        onChange={
                          handleChange
                        }
                        required
                        disabled={loading}
                      />

                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  HOSPITAL
              ================================================= */}

              <div className="form-section">

                <div className="form-section-title">

                  <span>
                    🏥
                  </span>

                  <div>

                    <h3>
                      Hospital Information
                    </h3>

                    <p>
                      Where the consultation took place
                      or will take place.
                    </p>

                  </div>

                </div>

                <div className="form-grid">

                  {/* HOSPITAL */}

                  <div className="form-group">

                    <label>
                      Hospital
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        🏥
                      </span>

                      <input
                        type="text"
                        name="hospital"
                        value={
                          formData.hospital
                        }
                        onChange={
                          handleChange
                        }
                        disabled={loading}
                      />

                    </div>

                  </div>

                  {/* LOCATION */}

                  <div className="form-group">

                    <label>
                      Location
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        📍
                      </span>

                      <input
                        type="text"
                        name="location"
                        value={
                          formData.location
                        }
                        onChange={
                          handleChange
                        }
                        disabled={loading}
                      />

                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  PURPOSE
              ================================================= */}

              <div className="form-section">

                <div className="form-section-title">

                  <span>
                    📋
                  </span>

                  <div>

                    <h3>
                      Consultation Purpose
                    </h3>

                    <p>
                      Tell us the reason for your visit.
                    </p>

                  </div>

                </div>

                <div className="form-group">

                  <label>
                    Purpose
                  </label>

                  <div className="input-wrapper textarea-wrapper">

                    <span className="input-icon textarea-icon">
                      📝
                    </span>

                    <textarea
                      name="purpose"
                      value={
                        formData.purpose
                      }
                      onChange={
                        handleChange
                      }
                      rows="3"
                      placeholder="Enter appointment purpose"
                      disabled={loading}
                    />

                  </div>

                </div>

              </div>

              {/* =================================================
                  STATUS INFORMATION
              ================================================= */}

              <div className="appointment-status-info">

                <div className="status-info-icon">
                  ℹ️
                </div>

                <div>

                  <strong>
                    Appointment status is automatic
                  </strong>

                  <p>
                    You can record both previous and
                    upcoming appointments.
                  </p>

                  <p>
                    Previous date/time →{" "}
                    <b>Completed</b>
                  </p>

                  <p>
                    Future date/time →{" "}
                    <b>Upcoming</b>
                  </p>

                  <p>
                    Cancelled appointment →{" "}
                    <b>Cancelled</b>
                  </p>

                </div>

              </div>

              {/* =================================================
                  BUTTONS
              ================================================= */}

              <div className="appointment-form-actions">

                <button
                  type="button"
                  className="cancel-appointment-btn"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-appointment-btn"
                  disabled={
                    loading ||
                    !formData.doctorName.trim() ||
                    !formData.appointmentDate ||
                    !formData.appointmentTime
                  }
                >

                  {loading ? (
                    <>
                      <span className="button-loader"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      ✓ Save Appointment
                    </>
                  )}

                </button>

              </div>

            </form>

          </section>

        </main>

      </div>

    </div>
  );
}

export default Appointment;