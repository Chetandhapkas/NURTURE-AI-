
import React, { useEffect, useState } from "react";
import {
  FaWhatsapp,
  FaUserMd,
  FaPlus,
  FaArrowLeft,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Doctor.css";

const defaultDoctors = [
  {
    id: "default-1",
    name: "Rajashree P. Shelnare",
    specialty: "Pregnancy Consultation",
    fee: 499,
    whatsapp: "9665911343",
    initials: "PS",
    color: "purple",
  },
  {
    id: "default-2",
    name: "Sujata Gujarkar",
    specialty: "Maternal Health Consultation",
    fee: 699,
    whatsapp: "9923191192",
    initials: "AB",
    color: "pink",
  },
];

const emptyForm = {
  doctorName: "",
  specialization: "",
  hospitalName: "",
  phoneNumber: "",
  email: "",
  remarks: "",
};

function normalizeIndianWhatsApp(number) {
  const digits = String(number || "").replace(/\D/g, "");

  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;

  return "";
}

function getErrorMessage(error, fallback) {
  const responseData = error.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  return (
    responseData?.message ||
    responseData?.error ||
    error.message ||
    fallback
  );
}

function Doctor() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState({});
  const [userId, setUserId] = useState(
    localStorage.getItem("userId") || ""
  );
  const [myDoctors, setMyDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [profileError, setProfileError] = useState("");
  const [doctorError, setDoctorError] = useState("");
  const [formError, setFormError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        let profile = {};
        let id = localStorage.getItem("userId") || "";

        try {
          const response = await API.get("/profile/me");
          const result = response.data;

          profile = result?.user || result?.data || result || {};

          id =
            profile.userId ??
            profile.user_id ??
            id;

          if (active) {
            setPatient(profile);
            setProfileError("");
          }
        } catch (error) {
          if (!id) {
            throw new Error(
              getErrorMessage(
                error,
                "Unable to load your profile. Please log in again."
              )
            );
          }

          // Continue using the saved user ID if the profile endpoint
          // is unavailable. The backend profile route can be checked separately.
          if (active) {
            setPatient({
              fullName: localStorage.getItem("fullName") || "Patient",
            });
          }
        }

        if (!id) {
          throw new Error("User ID not found. Please log in again.");
        }

        if (active) {
          setUserId(String(id));
        }

        try {
          const doctorsResponse = await API.get(
            `/doctors/user/${encodeURIComponent(id)}`
          );

          const data = doctorsResponse.data;

          if (active) {
            setMyDoctors(Array.isArray(data) ? data : []);
            setDoctorError("");
          }
        } catch (error) {
          if (active) {
            setMyDoctors([]);
            setDoctorError(
              getErrorMessage(
                error,
                "Unable to load your saved doctors."
              )
            );
          }
        }
      } catch (error) {
        if (active) {
          setProfileError(
            error.message || "Unable to load your profile."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  function getPatientName() {
    return (
      patient.fullName ||
      patient.full_name ||
      patient.name ||
      localStorage.getItem("fullName") ||
      "Patient"
    );
  }

  function createWhatsAppMessage(doctorName) {
    return [
      `Hello Dr. ${doctorName},`,
      "",
      "I would like to book a pregnancy consultation through NURTURE AI.",
      "",
      `Patient name: ${getPatientName()}`,
      "",
      "Please let me know your available appointment slots.",
      "Thank you.",
    ].join("\n");
  }

  function bookAppointment(doctor) {
    const number = normalizeIndianWhatsApp(doctor.whatsapp);

    if (!number) {
      window.alert("This doctor's WhatsApp number is invalid.");
      return;
    }

    const url =
      `https://wa.me/${number}?text=` +
      encodeURIComponent(createWhatsAppMessage(doctor.name));

    window.open(url, "_blank", "noopener,noreferrer");
  }

  function updateForm(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function saveDoctor(event) {
    event.preventDefault();
    setFormError("");

    if (!userId) {
      setFormError("Please log in again before saving a doctor.");
      return;
    }

    if (!form.doctorName.trim()) {
      setFormError("Doctor name is required.");
      return;
    }

    if (
      form.phoneNumber.trim() &&
      !normalizeIndianWhatsApp(form.phoneNumber)
    ) {
      setFormError(
        "Enter a valid 10-digit Indian WhatsApp number, optionally with country code 91."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await API.post(
        `/doctors/user/${encodeURIComponent(userId)}`,
        {
          doctorName: form.doctorName.trim(),
          specialization: form.specialization.trim(),
          hospitalName: form.hospitalName.trim(),
          phoneNumber: form.phoneNumber.trim(),
          email: form.email.trim(),
          remarks: form.remarks.trim(),
        }
      );

      const savedDoctor = response.data;

      setMyDoctors((previous) => [savedDoctor, ...previous]);
      setForm({ ...emptyForm });
      setShowForm(false);
      setFormError("");
      setDoctorError("");
    } catch (error) {
      setFormError(
        getErrorMessage(error, "Unable to save doctor.")
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteDoctor(doctorId) {
    if (!userId || !window.confirm("Remove this doctor from your list?")) {
      return;
    }

    setDeletingId(doctorId);

    try {
      await API.delete(
        `/doctors/user/${encodeURIComponent(userId)}/${encodeURIComponent(doctorId)}`
      );

      setMyDoctors((previous) =>
        previous.filter(
          (doctor) => String(doctor.doctorId) !== String(doctorId)
        )
      );
    } catch (error) {
      window.alert(
        getErrorMessage(error, "Unable to remove doctor.")
      );
    } finally {
      setDeletingId(null);
    }
  }

  function contactPersonalDoctor(doctor) {
    const number = normalizeIndianWhatsApp(doctor.phoneNumber);

    if (!number) {
      window.alert("Add a valid WhatsApp number for this doctor first.");
      return;
    }

    bookAppointment({
      name: doctor.doctorName,
      whatsapp: number,
    });
  }

  return (
    <main className="doctor-page">
      <button
        type="button"
        className="doctor-back-button"
        onClick={() => navigate("/dashboard")}
      >
        <FaArrowLeft /> Back to Dashboard
      </button>

      <section className="doctor-hero">
        <div className="doctor-hero-icon">
          <FaUserMd />
        </div>

        <div>
          <span className="doctor-eyebrow">NURTURE AI CARE</span>
          <h1>Find Your Doctor</h1>
          <p>
            Choose a doctor for consultation or save your regular
            doctor to contact them through WhatsApp.
          </p>
        </div>
      </section>

      {profileError && (
        <div className="doctor-profile-warning" role="alert">
          {profileError}
        </div>
      )}

      <section className="doctor-section">
        <div className="doctor-section-heading">
          <div>
            <h2>Available Doctors</h2>
            <p>Contact the doctor to request your appointment.</p>
          </div>

          <span className="doctor-count">
            {defaultDoctors.length} Doctors
          </span>
        </div>

        <div className="doctor-grid">
          {defaultDoctors.map((doctor) => (
            <article className="doctor-card" key={doctor.id}>
              <div className={`doctor-avatar ${doctor.color}`}>
                {doctor.initials}
              </div>

              <div className="doctor-card-content">
                <h3>{doctor.name}</h3>
                <p className="doctor-specialty">{doctor.specialty}</p>

                <div className="doctor-fee">
                  <span>Consultation fee</span>
                  <strong>₹{doctor.fee}</strong>
                </div>

                <button
                  type="button"
                  className="doctor-book-button"
                  onClick={() => bookAppointment(doctor)}
                >
                  <FaWhatsapp /> Book Appointment
                </button>

                <p className="doctor-book-note">
                  Your appointment message opens in WhatsApp.
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="doctor-payment-note">
          <h3>Payment Information</h3>
          <p>
            <strong>Priya Sharma:</strong> ₹499 per consultation.
          </p>
          <p>
            <strong>Anand Bhagwat:</strong> ₹699 per consultation.
          </p>
          <p>
            NURTURE AI does not collect payment. Contact the doctor
            first. The doctor will confirm availability and share
            payment instructions or a QR code directly through
            WhatsApp. Verify the payment details before paying.
          </p>
        </div>
      </section>

      <section className="doctor-section my-doctors-section">
        <div className="doctor-section-heading">
          <div>
            <h2>My Own Doctor</h2>
            <p>Your saved personal doctors appear here.</p>
          </div>

          <button
            type="button"
            className="doctor-add-button"
            onClick={() => {
              setFormError("");
              setShowForm(true);
            }}
          >
            <FaPlus /> Add Doctor
          </button>
        </div>

        {doctorError && (
          <p className="own-doctor-error" role="alert">
            {doctorError}
          </p>
        )}

        {loading && (
          <p className="doctor-loading">Loading your saved doctors...</p>
        )}

        {!loading && myDoctors.length === 0 && !profileError && (
          <div className="doctor-empty-state">
            <FaUserMd />
            <h3>No personal doctor saved</h3>
            <p>Add your regular doctor's details to get started.</p>

            <button
              type="button"
              className="doctor-add-button"
              onClick={() => setShowForm(true)}
            >
              <FaPlus /> Add Your Doctor
            </button>
          </div>
        )}

        <div className="doctor-grid">
          {myDoctors.map((doctor) => (
            <article className="doctor-card" key={doctor.doctorId}>
              <div className="doctor-avatar purple">
                {(doctor.doctorName || "DR")
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((word) => word[0])
                  .join("")
                  .toUpperCase()}
              </div>

              <div className="doctor-card-content">
                <h3>{doctor.doctorName}</h3>
                <p className="doctor-specialty">
                  {doctor.specialization || "Personal Doctor"}
                </p>

                {doctor.hospitalName && (
                  <p className="doctor-detail">{doctor.hospitalName}</p>
                )}

                {doctor.phoneNumber && (
                  <p className="doctor-detail">
                    WhatsApp: {doctor.phoneNumber}
                  </p>
                )}

                {doctor.email && (
                  <p className="doctor-detail">{doctor.email}</p>
                )}

                <button
                  type="button"
                  className="doctor-book-button"
                  onClick={() => contactPersonalDoctor(doctor)}
                  disabled={!doctor.phoneNumber}
                >
                  <FaWhatsapp /> Contact My Doctor
                </button>

                <button
                  type="button"
                  className="doctor-delete-button"
                  onClick={() => deleteDoctor(doctor.doctorId)}
                  disabled={deletingId === doctor.doctorId}
                >
                  <FaTrash />
                  {deletingId === doctor.doctorId
                    ? "Removing..."
                    : "Remove Doctor"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {showForm && (
        <div
          className="doctor-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setShowForm(false);
            }
          }}
        >
          <section
            className="doctor-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-modal-title"
          >
            <div className="doctor-modal-header">
              <div>
                <span className="doctor-eyebrow">PERSONAL CONTACT</span>
                <h2 id="doctor-modal-title">Add Your Doctor</h2>
                <p>Enter the details below and save your doctor.</p>
              </div>

              <button
                type="button"
                className="doctor-modal-close"
                aria-label="Close form"
                onClick={() => setShowForm(false)}
                disabled={saving}
              >
                <FaTimes />
              </button>
            </div>

            <form className="doctor-form" onSubmit={saveDoctor}>
              <label>
                Doctor Name *
                <input
                  name="doctorName"
                  value={form.doctorName}
                  onChange={updateForm}
                  placeholder="e.g. Dr. Meera Patil"
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Specialization
                <input
                  name="specialization"
                  value={form.specialization}
                  onChange={updateForm}
                  placeholder="e.g. Gynecologist"
                  maxLength={100}
                />
              </label>

              <label>
                Hospital / Clinic
                <input
                  name="hospitalName"
                  value={form.hospitalName}
                  onChange={updateForm}
                  placeholder="Hospital or clinic name"
                  maxLength={150}
                />
              </label>

              <label>
                WhatsApp Number
                <input
                  name="phoneNumber"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={updateForm}
                  placeholder="10-digit mobile number"
                  maxLength={15}
                />
              </label>

              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateForm}
                  placeholder="doctor@example.com"
                  maxLength={255}
                />
              </label>

              <label>
                Notes
                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={updateForm}
                  placeholder="Optional notes"
                  rows={3}
                />
              </label>

              {formError && (
                <p className="doctor-form-error" role="alert">
                  {formError}
                </p>
              )}

              <div className="doctor-form-actions">
                <button
                  type="button"
                  className="doctor-cancel-button"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="doctor-save-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Doctor"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <p className="doctor-footer-note">
        Appointment requests are sent directly to the selected doctor.
        Payment is arranged directly with the doctor.
      </p>
    </main>
  );
}

export default Doctor;
