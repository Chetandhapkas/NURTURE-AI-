
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";

import API from "../../services/api";

import "./Appointment.css";

function Appointment() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    doctorName: "",
    specialization: "Gynecologist",
    appointmentDate: "",
    appointmentTime: "",
    hospital: "City Care Hospital",
    location: "Nagpur",
    purpose: "Routine Pregnancy Check-up",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  // Save appointment
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!formData.doctorName.trim()) {
      setError("Please enter the doctor's name.");
      return;
    }

    if (!formData.appointmentDate) {
      setError("Please select appointment date.");
      return;
    }

    if (!formData.appointmentTime) {
      setError("Please select appointment time.");
      return;
    }

    const selectedDateTime = new Date(
      `${formData.appointmentDate}T${formData.appointmentTime}`
    );

    if (Number.isNaN(selectedDateTime.getTime())) {
      setError("Please select a valid appointment date and time.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post(
        "/appointments",
        {
          doctorName: formData.doctorName.trim(),
          specialization: formData.specialization.trim(),
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          hospital: formData.hospital.trim(),
          location: formData.location.trim(),
          purpose: formData.purpose.trim(),
        },
        {
          withCredentials: true,
        }
      );

      const data = response.data;

      console.log("Appointment saved successfully:", data);
      console.log("Appointment ID:", data.id);
      console.log("Appointment status:", data.status);

      alert("✅ Appointment Saved Successfully!");

      if (data.status === "COMPLETED") {
        setMessage(
          "Appointment added successfully. This appointment has been marked as Completed."
        );
      } else if (data.status === "UPCOMING") {
        setMessage(
          "Appointment added successfully. Your appointment is Upcoming."
        );
      } else if (data.status === "CANCELLED") {
        setMessage("Appointment has been Cancelled.");
      } else {
        setMessage("Appointment added successfully.");
      }

      setFormData((previous) => ({
        ...previous,
        appointmentDate: "",
        appointmentTime: "",
      }));
    } catch (err) {
      console.error("Appointment save error:", err);

      if (err.response?.status === 401) {
        setError(
          "Your login session has expired. Please login again."
        );

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1500);

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
          "Unable to save appointment. Please check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  // Back button
  const handleBack = () => {
    navigate(-1);
  };

  // Cancel form
  const handleCancel = () => {
    navigate("/appointment-history");
  };

  return (
    <div className="appointment-page-layout">
      <Sidebar />

      <div className="appointment-page-main">
        <Navbar />

        <main className="appointment-page-content">
          {/* PAGE HEADER */}
          <div className="appointment-page-header">
            <div className="appointment-heading">
              <div className="appointment-title-icon">📅</div>

              <div>
                <h1>Add Appointment</h1>
                <p>
                  Schedule a new consultation or record a previous
                  consultation.
                </p>
              </div>
            </div>

            <div className="appointment-header-actions">
              <button
                type="button"
                className="appointment-back-btn"
                onClick={handleBack}
                aria-label="Go back to previous page"
              >
                <span
                  className="appointment-back-arrow"
                  aria-hidden="true"
                >
                  ←
                </span>
                <span>Back</span>
              </button>

              <button
                type="button"
                className="history-navigation-btn"
                onClick={() => navigate("/appointment-history")}
              >
                📋 Appointment History
              </button>
            </div>
          </div>

          {/* SUCCESS MESSAGE */}
          {message && (
            <div
              className="appointment-alert appointment-success"
              role="status"
            >
              <div className="success-icon">✓</div>
              <div>
                <strong>Appointment Saved</strong>
                <p>{message}</p>
              </div>
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div
              className="appointment-alert appointment-error"
              role="alert"
            >
              <div className="error-icon">!</div>
              <div>
                <strong>Unable to Save</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* FORM CARD */}
          <section className="appointment-form-card">
            <div className="form-card-header">
              <div className="form-header-icon">🩺</div>

              <div>
                <h2>Appointment Details</h2>
                <p>
                  Enter the details of your pregnancy consultation.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="appointment-form"
            >
              {/* DOCTOR INFORMATION */}
              <div className="form-section">
                <div className="form-section-title">
                  <span className="section-icon">👩‍⚕️</span>

                  <div>
                    <h3>Doctor Information</h3>
                    <p>
                      Enter the doctor who handled your consultation.
                    </p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="doctorName">
                      Doctor Name <span>*</span>
                    </label>

                    <div className="input-wrapper">
                      <span className="input-icon">👩‍⚕️</span>

                      <input
                        id="doctorName"
                        type="text"
                        name="doctorName"
                        value={formData.doctorName}
                        onChange={handleChange}
                        placeholder="Enter doctor's name"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="specialization">
                      Specialization <span>*</span>
                    </label>

                    <div className="input-wrapper">
                      <span className="input-icon">🩺</span>

                      <select
                        id="specialization"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
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
                          Obstetrician &amp; Gynecologist
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

              {/* DATE AND TIME */}
              <div className="form-section">
                <div className="form-section-title">
                  <span className="section-icon">🗓️</span>

                  <div>
                    <h3>Date &amp; Time</h3>
                    <p>
                      Enter the actual date and time of your consultation.
                    </p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="appointmentDate">
                      Appointment Date <span>*</span>
                    </label>

                    <div className="input-wrapper">
                      <span className="input-icon">📅</span>

                      <input
                        id="appointmentDate"
                        type="date"
                        name="appointmentDate"
                        value={formData.appointmentDate}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="appointmentTime">
                      Appointment Time <span>*</span>
                    </label>

                    <div className="input-wrapper">
                      <span className="input-icon">🕐</span>

                      <input
                        id="appointmentTime"
                        type="time"
                        name="appointmentTime"
                        value={formData.appointmentTime}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* HOSPITAL INFORMATION */}
              <div className="form-section">
                <div className="form-section-title">
                  <span className="section-icon">🏥</span>

                  <div>
                    <h3>Hospital Information</h3>
                    <p>
                      Where the consultation took place or will take place.
                    </p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="hospital">Hospital</label>

                    <div className="input-wrapper">
                      <span className="input-icon">🏥</span>

                      <input
                        id="hospital"
                        type="text"
                        name="hospital"
                        value={formData.hospital}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="location">Location</label>

                    <div className="input-wrapper">
                      <span className="input-icon">📍</span>

                      <input
                        id="location"
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* CONSULTATION PURPOSE */}
              <div className="form-section">
                <div className="form-section-title">
                  <span className="section-icon">📋</span>

                  <div>
                    <h3>Consultation Purpose</h3>
                    <p>Tell us the reason for your visit.</p>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="purpose">Purpose</label>

                  <div className="input-wrapper textarea-wrapper">
                    <span className="input-icon textarea-icon">📝</span>

                    <textarea
                      id="purpose"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Enter appointment purpose"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* APPOINTMENT STATUS INFORMATION */}
              <div className="appointment-status-info">
                <div className="status-info-icon">ℹ️</div>

                <div>
                  <strong>Appointment status is automatic</strong>

                  <p>
                    You can record both previous and upcoming appointments.
                  </p>

                  <p>
                    Previous date/time → <b>Completed</b>
                  </p>

                  <p>
                    Future date/time → <b>Upcoming</b>
                  </p>

                  <p>
                    Cancelled appointment → <b>Cancelled</b>
                  </p>
                </div>
              </div>

              {/* FORM BUTTONS */}
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
                      <span className="button-loader" />
                      Saving...
                    </>
                  ) : (
                    <>✓ Save Appointment</>
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
