
import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Healthcare.css";
import Sidebar from "../../components/sidebar/Sidebar";

const Healthcare = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userId = localStorage.getItem("userId");

    // STATES
    const [vaccinations, setVaccinations] = useState([]);
    const [medicines, setMedicines] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [medicineModal, setMedicineModal] = useState(false);
    const [vaccineModal, setVaccineModal] = useState(false);

    // MEDICINE FORM
    const [medicineName, setMedicineName] = useState("");
    const [dosage, setDosage] = useState("");
    const [frequency, setFrequency] = useState("Daily");
    const [startDate, setStartDate] = useState("");
    const [durationDays, setDurationDays] = useState("");
    const [reminderTime, setReminderTime] = useState("");
    const [reminderTime2, setReminderTime2] = useState("");
    const [reminderTime3, setReminderTime3] = useState("");
    const [instructions, setInstructions] = useState("");

    // VACCINATION FORM
    const [vaccineName, setVaccineName] = useState("");
    const [doseNumber, setDoseNumber] = useState("");
    const [scheduledDate, setScheduledDate] = useState("");
    const [vaccineNotes, setVaccineNotes] = useState("");

    // BACK BUTTON
    const handleBack = () => {
        if (location.key && location.key !== "default") {
            navigate(-1);
        } else {
            navigate("/dashboard");
        }
    };

    // LOAD HEALTHCARE DATA
    const loadHealthcareData = useCallback(async () => {
        if (!userId) {
            setVaccinations([]);
            setMedicines([]);
            setLoading(false);
            setRefreshing(false);
            return;
        }

        try {
            const [vaccinationResponse, medicineResponse] =
                await Promise.all([
                    API.get(`/vaccinations/${userId}`),
                    API.get(`/medicines/${userId}/today`)
                ]);

            setVaccinations(
                Array.isArray(vaccinationResponse.data)
                    ? vaccinationResponse.data
                    : []
            );

            setMedicines(
                Array.isArray(medicineResponse.data)
                    ? medicineResponse.data
                    : []
            );

            console.log("Today's Medicine Logs:", medicineResponse.data);
        } catch (error) {
            console.error(
                "Healthcare API Error:",
                error?.response?.data || error.message
            );

            alert("Unable to load healthcare data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userId]);

    useEffect(() => {
        loadHealthcareData();
    }, [loadHealthcareData]);

    // REFRESH
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadHealthcareData();
    };

    // FORMAT DATE
    const formatDate = (date) => {
        if (!date) return "Not scheduled";

        const parts = date.split("-");

        if (parts.length !== 3) return date;

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    // FORMAT TIME
    const formatTime = (time) => {
        if (!time) return "No reminder";

        const parts = time.split(":");

        if (parts.length < 2) return time;

        let hour = parseInt(parts[0], 10);
        const minute = parts[1];
        const period = hour >= 12 ? "PM" : "AM";

        hour = hour % 12;

        if (hour === 0) hour = 12;

        return `${hour}:${minute} ${period}`;
    };

    // VACCINATION STATUS
    const getVaccineStatus = (status) => {
        if (!status) return "LOCKED";
        return status.toUpperCase();
    };

    // MARK VACCINATION AS TAKEN
    const markVaccinationTaken = async (vaccinationId) => {
        try {
            await API.put(`/vaccinations/${vaccinationId}/taken`);

            alert("Vaccination marked as taken.");
            await loadHealthcareData();
        } catch (error) {
            console.error(
                "Vaccination Error:",
                error?.response?.data || error.message
            );

            alert(
                error?.response?.data?.message ||
                "This vaccination cannot be marked as taken yet."
            );
        }
    };

    // MARK MEDICINE AS TAKEN
    const markMedicineTaken = async (logId) => {
        if (!logId) {
            alert("Medicine log ID not found.");
            return;
        }

        try {
            await API.put(`/medicines/log/${logId}/taken`);

            alert("Medicine marked as taken.");
            await loadHealthcareData();
        } catch (error) {
            console.error(
                "Medicine Error:",
                error?.response?.data || error.message
            );

            alert(
                error?.response?.data?.message ||
                "Unable to mark medicine as taken."
            );
        }
    };

    // STOP MEDICINE
    const stopMedicine = async (medicineId) => {
        if (!medicineId) {
            alert("Medicine ID not found.");
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to stop this medicine?"
        );

        if (!confirmed) return;

        try {
            await API.put(`/medicines/${medicineId}/stop`);

            alert("Medicine stopped successfully.");
            await loadHealthcareData();
        } catch (error) {
            console.error(
                "Stop Medicine Error:",
                error?.response?.data || error.message
            );

            alert(
                error?.response?.data?.message ||
                "Unable to stop medicine."
            );
        }
    };

    // RESET MEDICINE FORM
    const resetMedicineForm = () => {
        setMedicineName("");
        setDosage("");
        setFrequency("Daily");
        setStartDate("");
        setDurationDays("");
        setReminderTime("");
        setReminderTime2("");
        setReminderTime3("");
        setInstructions("");
    };

    // ADD MEDICINE
    const addMedicine = async (e) => {
        e.preventDefault();

        if (!userId) {
            alert("Please log in again. User ID not found.");
            return;
        }

        if (!medicineName.trim()) {
            alert("Please enter medicine name.");
            return;
        }

        if (!startDate) {
            alert("Please select start date.");
            return;
        }

        if (durationDays === "") {
            alert("Please select medicine duration.");
            return;
        }

        if (!reminderTime) {
            alert("Please select the first reminder time.");
            return;
        }

        if (frequency === "Twice Daily" && !reminderTime2) {
            alert("Please select the second reminder time.");
            return;
        }

        if (
            frequency === "Three Times Daily" &&
            (!reminderTime2 || !reminderTime3)
        ) {
            alert("Please select all three reminder times.");
            return;
        }

        const selectedTimes = [
            reminderTime,
            reminderTime2,
            reminderTime3
        ].filter(Boolean);

        if (new Set(selectedTimes).size !== selectedTimes.length) {
            alert("Reminder times must be different.");
            return;
        }

        setSaving(true);

        try {
            const medicineData = {
                medicineName: medicineName.trim(),
                dosage: dosage.trim(),
                frequency: frequency.trim(),
                startDate,
                durationDays: Number(durationDays),
                reminderTime: reminderTime || null,
                reminderTime2: reminderTime2 || null,
                reminderTime3: reminderTime3 || null,
                instructions: instructions.trim()
            };

            await API.post(`/medicines/${userId}`, medicineData);

            alert("Medicine added successfully.");

            resetMedicineForm();
            setMedicineModal(false);

            await loadHealthcareData();
        } catch (error) {
            console.error(
                "Add Medicine Error:",
                error?.response?.data || error.message
            );

            alert(
                error?.response?.data?.message ||
                error?.response?.data ||
                "Unable to add medicine."
            );
        } finally {
            setSaving(false);
        }
    };

    // RESET VACCINATION FORM
    const resetVaccineForm = () => {
        setVaccineName("");
        setDoseNumber("");
        setScheduledDate("");
        setVaccineNotes("");
    };

    // ADD VACCINATION
    const addVaccination = async (e) => {
        e.preventDefault();

        if (!userId) {
            alert("Please log in again. User ID not found.");
            return;
        }

        if (!vaccineName.trim()) {
            alert("Please enter vaccine name.");
            return;
        }

        if (!scheduledDate) {
            alert("Please select scheduled date.");
            return;
        }

        setSaving(true);

        try {
            const vaccinationData = {
                vaccineName: vaccineName.trim(),
                doseNumber: doseNumber.trim(),
                availableFrom: scheduledDate,
                scheduledDate,
                notes: vaccineNotes.trim()
            };

            await API.post(
                `/vaccinations/${userId}/add`,
                vaccinationData
            );

            alert("Vaccination added successfully.");

            resetVaccineForm();
            setVaccineModal(false);

            await loadHealthcareData();
        } catch (error) {
            console.error(
                "Add Vaccination Error:",
                error?.response?.data || error.message
            );

            alert(
                error?.response?.data?.message ||
                error?.response?.data ||
                "Unable to add vaccination."
            );
        } finally {
            setSaving(false);
        }
    };

    // LOADING SCREEN
    if (loading) {
        return (
            <div className="healthcare-layout">
                <Sidebar />

                <main className="healthcare-main">
                    <div className="healthcare-loading">
                        <div className="healthcare-spinner"></div>
                        <p>Loading healthcare information...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="healthcare-layout">
            <Sidebar />

            <main className="healthcare-main">
                <div className="healthcare-page">

                    {/* HEADER */}
                    <div className="healthcare-header">
                        <div className="healthcare-heading-group">
                            <button
                                type="button"
                                className="healthcare-back-button"
                                onClick={handleBack}
                                aria-label="Go back"
                                title="Go back"
                            >
                                <span aria-hidden="true">←</span>
                                <span>Back</span>
                            </button>

                            <div className="healthcare-heading-text">
                                <h1>Healthcare</h1>
                                <p>
                                    Manage your pregnancy medicines
                                    and vaccinations
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="refresh-button"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            {refreshing ? "Refreshing..." : "↻ Refresh"}
                        </button>
                    </div>

                    {/* VACCINATION SECTION */}
                    <section className="healthcare-section">
                        <div className="section-header">
                            <div>
                                <h2>💉 Vaccination Tracker</h2>
                                <p>Track your recommended vaccinations</p>
                            </div>

                            <button
                                type="button"
                                className="add-button"
                                onClick={() => setVaccineModal(true)}
                            >
                                + Add Vaccination
                            </button>
                        </div>

                        <div className="healthcare-grid">
                            {vaccinations.length === 0 ? (
                                <div className="empty-card">
                                    <div className="empty-icon">💉</div>
                                    <h3>No vaccinations</h3>
                                    <p>
                                        Your vaccination schedule will appear here.
                                    </p>
                                </div>
                            ) : (
                                vaccinations.map((vaccine) => {
                                    const status = getVaccineStatus(vaccine.status);
                                    const locked = status === "LOCKED";
                                    const completed = status === "COMPLETED";

                                    return (
                                        <div
                                            className="healthcare-card"
                                            key={vaccine.id}
                                        >
                                            <div className="card-header">
                                                <div className="card-icon vaccine-icon">
                                                    💉
                                                </div>

                                                <div className="card-title-area">
                                                    <h3>{vaccine.vaccineName}</h3>
                                                    <p>
                                                        {vaccine.doseNumber || "Vaccination"}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`status-badge ${status.toLowerCase()}`}
                                                >
                                                    {status}
                                                </span>
                                            </div>

                                            <div className="card-info">
                                                <div>
                                                    <span>Scheduled</span>
                                                    <strong>
                                                        {formatDate(vaccine.scheduledDate)}
                                                    </strong>
                                                </div>

                                                {vaccine.takenDate && (
                                                    <div>
                                                        <span>Taken</span>
                                                        <strong>
                                                            {formatDate(vaccine.takenDate)}
                                                        </strong>
                                                    </div>
                                                )}
                                            </div>

                                            {vaccine.notes && (
                                                <p className="card-notes">
                                                    {vaccine.notes}
                                                </p>
                                            )}

                                            {locked && (
                                                <div className="locked-message">
                                                    🔒
                                                    <span>
                                                        Available from{" "}
                                                        {formatDate(vaccine.availableFrom)}
                                                    </span>
                                                </div>
                                            )}

                                            {completed && (
                                                <div className="completed-message">
                                                    ✓
                                                    <span>Vaccination completed</span>
                                                </div>
                                            )}

                                            {!locked && !completed && (
                                                <button
                                                    type="button"
                                                    className="taken-button"
                                                    onClick={() =>
                                                        markVaccinationTaken(vaccine.id)
                                                    }
                                                >
                                                    ✓ Mark as Taken
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>

                    {/* MEDICINE SECTION */}
                    <section className="healthcare-section">
                        <div className="section-header">
                            <div>
                                <h2>💊 Today's Medicines</h2>
                                <p>Keep track of your daily medicines</p>
                            </div>

                            <button
                                type="button"
                                className="add-button"
                                onClick={() => setMedicineModal(true)}
                            >
                                + Add Medicine
                            </button>
                        </div>

                        <div className="healthcare-grid">
                            {medicines.length === 0 ? (
                                <div className="empty-card">
                                    <div className="empty-icon">💊</div>
                                    <h3>No medicines for today</h3>
                                    <p>
                                        Add a medicine to start tracking it.
                                    </p>
                                </div>
                            ) : (
                                medicines.map((log) => {
                                    const medicine = log.medicine || {};
                                    const medicineId = medicine.id;
                                    const taken =
                                        log.status?.toUpperCase() === "TAKEN";

                                    return (
                                        <div
                                            className="healthcare-card"
                                            key={log.id}
                                        >
                                            <div className="card-header">
                                                <div className="card-icon medicine-icon">
                                                    💊
                                                </div>

                                                <div className="card-title-area">
                                                    <h3>
                                                        {medicine.medicineName || "Medicine"}
                                                    </h3>
                                                    <p>
                                                        {medicine.dosage ||
                                                            "Dosage not specified"}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`status-badge ${
                                                        taken ? "completed" : "pending"
                                                    }`}
                                                >
                                                    {taken ? "TAKEN" : "PENDING"}
                                                </span>
                                            </div>

                                            <div className="card-info">
                                                <div>
                                                    <span>Reminder</span>
                                                    <strong>
                                                        {formatTime(log.scheduledTime)}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Frequency</span>
                                                    <strong>
                                                        {medicine.frequency || "Daily"}
                                                    </strong>
                                                </div>
                                            </div>

                                            {medicine.instructions && (
                                                <p className="card-notes">
                                                    {medicine.instructions}
                                                </p>
                                            )}

                                            {taken ? (
                                                <div className="completed-message">
                                                    ✓
                                                    <span>Medicine taken</span>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="taken-button"
                                                    onClick={() =>
                                                        markMedicineTaken(log.id)
                                                    }
                                                >
                                                    ✓ Mark as Taken
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                className="stop-button"
                                                onClick={() => stopMedicine(medicineId)}
                                                disabled={!medicineId}
                                                title={
                                                    medicineId
                                                        ? `Stop medicine ID ${medicineId}`
                                                        : "Medicine ID not available"
                                                }
                                            >
                                                🛑 Stop Medicine
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>

                    {/* ADD MEDICINE MODAL */}
                    {medicineModal && (
                        <div className="modal-overlay">
                            <div
                                className="modal"
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="medicine-modal-title"
                            >
                                <div className="modal-header">
                                    <div>
                                        <h2 id="medicine-modal-title">
                                            Add Medicine
                                        </h2>
                                        <p>Set your medicine schedule</p>
                                    </div>

                                    <button
                                        type="button"
                                        className="close-button"
                                        aria-label="Close medicine form"
                                        onClick={() => {
                                            resetMedicineForm();
                                            setMedicineModal(false);
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>

                                <form onSubmit={addMedicine}>
                                    <div className="form-group">
                                        <label>Medicine Name *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Iron Tablet"
                                            value={medicineName}
                                            onChange={(e) =>
                                                setMedicineName(e.target.value)
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Dosage</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 1 tablet"
                                                value={dosage}
                                                onChange={(e) =>
                                                    setDosage(e.target.value)
                                                }
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Frequency</label>
                                            <select
                                                value={frequency}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setFrequency(value);

                                                    if (value === "Daily") {
                                                        setReminderTime2("");
                                                        setReminderTime3("");
                                                    }

                                                    if (value === "Twice Daily") {
                                                        setReminderTime3("");
                                                    }
                                                }}
                                            >
                                                <option value="Daily">Daily</option>
                                                <option value="Twice Daily">
                                                    Twice Daily
                                                </option>
                                                <option value="Three Times Daily">
                                                    Three Times Daily
                                                </option>
                                                <option value="Weekly">Weekly</option>
                                                <option value="As Prescribed">
                                                    As Prescribed
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Start Date *</label>
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) =>
                                                    setStartDate(e.target.value)
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Duration *</label>
                                            <select
                                                value={durationDays}
                                                onChange={(e) =>
                                                    setDurationDays(e.target.value)
                                                }
                                                required
                                            >
                                                <option value="">
                                                    Select duration
                                                </option>
                                                <option value="7">7 Days</option>
                                                <option value="15">15 Days</option>
                                                <option value="30">30 Days</option>
                                                <option value="60">60 Days</option>
                                                <option value="90">90 Days</option>
                                                <option value="0">Ongoing</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Reminder Time 1 *</label>
                                        <input
                                            type="time"
                                            value={reminderTime}
                                            onChange={(e) =>
                                                setReminderTime(e.target.value)
                                            }
                                            required
                                        />
                                    </div>

                                    {(frequency === "Twice Daily" ||
                                        frequency === "Three Times Daily") && (
                                        <div className="form-group">
                                            <label>Reminder Time 2 *</label>
                                            <input
                                                type="time"
                                                value={reminderTime2}
                                                onChange={(e) =>
                                                    setReminderTime2(e.target.value)
                                                }
                                                required
                                            />
                                        </div>
                                    )}

                                    {frequency === "Three Times Daily" && (
                                        <div className="form-group">
                                            <label>Reminder Time 3 *</label>
                                            <input
                                                type="time"
                                                value={reminderTime3}
                                                onChange={(e) =>
                                                    setReminderTime3(e.target.value)
                                                }
                                                required
                                            />
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label>Instructions</label>
                                        <textarea
                                            placeholder="e.g. Take after breakfast"
                                            value={instructions}
                                            onChange={(e) =>
                                                setInstructions(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="modal-actions">
                                        <button
                                            type="button"
                                            className="cancel-button"
                                            onClick={() => {
                                                resetMedicineForm();
                                                setMedicineModal(false);
                                            }}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="save-button"
                                            disabled={saving}
                                        >
                                            {saving ? "Saving..." : "Add Medicine"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ADD VACCINATION MODAL */}
                    {vaccineModal && (
                        <div className="modal-overlay">
                            <div
                                className="modal"
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="vaccine-modal-title"
                            >
                                <div className="modal-header">
                                    <div>
                                        <h2 id="vaccine-modal-title">
                                            Add Vaccination
                                        </h2>
                                        <p>Add an additional vaccination</p>
                                    </div>

                                    <button
                                        type="button"
                                        className="close-button"
                                        aria-label="Close vaccination form"
                                        onClick={() => {
                                            resetVaccineForm();
                                            setVaccineModal(false);
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>

                                <form onSubmit={addVaccination}>
                                    <div className="form-group">
                                        <label>Vaccine Name *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Influenza"
                                            value={vaccineName}
                                            onChange={(e) =>
                                                setVaccineName(e.target.value)
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Dose</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Dose 1"
                                            value={doseNumber}
                                            onChange={(e) =>
                                                setDoseNumber(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Scheduled Date *</label>
                                        <input
                                            type="date"
                                            value={scheduledDate}
                                            onChange={(e) =>
                                                setScheduledDate(e.target.value)
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Notes</label>
                                        <textarea
                                            placeholder="Optional notes"
                                            value={vaccineNotes}
                                            onChange={(e) =>
                                                setVaccineNotes(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="modal-actions">
                                        <button
                                            type="button"
                                            className="cancel-button"
                                            onClick={() => {
                                                resetVaccineForm();
                                                setVaccineModal(false);
                                            }}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="save-button"
                                            disabled={saving}
                                        >
                                            {saving
                                                ? "Saving..."
                                                : "Add Vaccination"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Healthcare;
