import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MedicalHistory.css";
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://nurture-ai.onrender.com/api";

const MedicalHistory = () => {
    const navigate = useNavigate();

    const [userId, setUserId] = useState(null);

    const [formData, setFormData] = useState({
        diabetes: false,
        hypertension: false,
        thyroid: false,
        pcos: false,
        asthma: false,
        heartDisease: false,
        otherDisease: "",
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ============================================================
    // GET USER ID + EXISTING MEDICAL HISTORY
    // ============================================================

    useEffect(() => {
        const storedUserId =
            localStorage.getItem("userId") ||
            localStorage.getItem("user_id");

        if (!storedUserId) {
            setError("User session not found. Please login again.");
            setFetching(false);
            return;
        }

        console.log(
            "Medical History User ID:",
            storedUserId
        );

        setUserId(storedUserId);

        fetchMedicalHistory(storedUserId);
    }, []);

    // ============================================================
    // FETCH EXISTING MEDICAL HISTORY
    // ============================================================

    const fetchMedicalHistory = async (id) => {
        try {
            setFetching(true);
            setError("");

            console.log(
                "Fetching medical history for user:",
                id
            );

            const response = await axios.get(
    `${API_BASE_URL}/medical-history/${id}`,
    {
        withCredentials: true,
    }
);

            console.log(
                "Medical history response:",
                response.data
            );

            if (response.data) {
                setFormData({
                    diabetes:
                        response.data.diabetes ?? false,

                    hypertension:
                        response.data.hypertension ?? false,

                    thyroid:
                        response.data.thyroid ?? false,

                    pcos:
                        response.data.pcos ?? false,

                    asthma:
                        response.data.asthma ?? false,

                    heartDisease:
                        response.data.heartDisease ?? false,

                    otherDisease:
                        response.data.otherDisease ?? "",
                });
            }

        } catch (err) {

            // ====================================================
            // NO RECORD YET
            // ====================================================

            if (err.response?.status === 404) {

                console.log(
                    "No medical history found. New form will be shown."
                );

                // Keep default empty form.

            } else {

                console.error(
                    "Error fetching medical history:",
                    err
                );

                console.error(
                    "Backend response:",
                    err.response?.data
                );

                // Do not block the user from filling the form.
                // The user can still enter new medical history.

            }

        } finally {
            setFetching(false);
        }
    };

    // ============================================================
    // HANDLE CHECKBOX
    // ============================================================

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: checked,
        }));

        setMessage("");
        setError("");
    };

    // ============================================================
    // HANDLE OTHER DISEASE
    // ============================================================

    const handleOtherDiseaseChange = (event) => {
        setFormData((previous) => ({
            ...previous,
            otherDisease: event.target.value,
        }));

        setMessage("");
        setError("");
    };

    // ============================================================
    // SUBMIT MEDICAL HISTORY
    // ============================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!userId) {
            setError(
                "User session not found. Please login again."
            );
            return;
        }

        try {
            setLoading(true);
            setMessage("");
            setError("");

            console.log(
                "======================================"
            );

            console.log(
                "Saving Medical History"
            );

            console.log(
                "User ID:",
                userId
            );

            console.log(
                "Form Data:",
                formData
            );

            console.log(
                "======================================"
            );

            const response = await axios.post(
    `${API_BASE_URL}/medical-history/${userId}`,
    formData,
    {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        },
    }
);

            console.log(
                "Medical history save response:",
                response.data
            );

            // ====================================================
            // SAVE SUCCESS
            // ====================================================

            if (
                response.status === 200 ||
                response.status === 201
            ) {
                setMessage(
                    "Medical history saved successfully."
                );

                console.log(
                    "✅ Medical history saved successfully."
                );

                // =================================================
                // GO TO DASHBOARD
                // =================================================

                setTimeout(() => {

                    console.log(
                        "Navigating → /dashboard"
                    );

                    navigate(
                        "/dashboard",
                        {
                            replace: true,
                        }
                    );

                }, 800);
            }

        } catch (err) {

            console.error(
                "❌ Error saving medical history:",
                err
            );

            console.error(
                "Backend status:",
                err.response?.status
            );

            console.error(
                "Backend response:",
                err.response?.data
            );

            let errorMessage =
                "Unable to save medical history. Please try again.";

            if (err.response?.data) {

                if (
                    typeof err.response.data ===
                    "string"
                ) {
                    errorMessage =
                        err.response.data;

                } else if (
                    err.response.data.message
                ) {
                    errorMessage =
                        err.response.data.message;
                }
            }

            setError(errorMessage);

        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // RESET
    // ============================================================

    const handleReset = () => {
        setFormData({
            diabetes: false,
            hypertension: false,
            thyroid: false,
            pcos: false,
            asthma: false,
            heartDisease: false,
            otherDisease: "",
        });

        setMessage("");
        setError("");
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (fetching) {
        return (
            <div className="medical-history-page">
                <div className="medical-history-loading">
                    <div className="loading-spinner"></div>

                    <p>
                        Loading medical history...
                    </p>
                </div>
            </div>
        );
    }

    // ============================================================
    // UI
    // ============================================================

    return (
        <div className="medical-history-page">

            <div className="medical-history-container">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="medical-history-header">

                    <button
                        className="back-button"
                        onClick={() => navigate("/pregnancy-details")}
                        type="button"
                    >
                        ←
                    </button>

                    <div>

                        <h1>
                            Medical History
                        </h1>

                        <p>
                            Help us understand your medical background
                            for better personalized pregnancy care.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    INFORMATION BANNER
                ================================================= */}

                <div className="medical-info-banner">

                    <div className="info-icon">
                        ♡
                    </div>

                    <div>

                        <h3>
                            Your health matters
                        </h3>

                        <p>
                            Please select any medical conditions that you
                            currently have or have had in the past.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    FORM
                ================================================= */}

                <form
                    className="medical-history-form"
                    onSubmit={handleSubmit}
                >

                    {/* =================================================
                        SECTION TITLE
                    ================================================= */}

                    <div className="section-title">

                        <span className="section-number">
                            01
                        </span>

                        <div>

                            <h2>
                                Existing Medical Conditions
                            </h2>

                            <p>
                                Select all conditions that apply to you.
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        CONDITIONS
                    ================================================= */}

                    <div className="conditions-grid">

                        {/* Diabetes */}

                        <label className="condition-card">

                            <input
                                type="checkbox"
                                name="diabetes"
                                checked={
                                    formData.diabetes
                                }
                                onChange={
                                    handleCheckboxChange
                                }
                            />

                            <span className="custom-checkbox"></span>

                            <div className="condition-content">

                                <span className="condition-icon">
                                    ◉
                                </span>

                                <div>

                                    <h3>
                                        Diabetes
                                    </h3>

                                    <p>
                                        Type 1 or Type 2 diabetes
                                    </p>

                                </div>

                            </div>

                        </label>


                        {/* Hypertension */}

                        <label className="condition-card">

                            <input
                                type="checkbox"
                                name="hypertension"
                                checked={
                                    formData.hypertension
                                }
                                onChange={
                                    handleCheckboxChange
                                }
                            />

                            <span className="custom-checkbox"></span>

                            <div className="condition-content">

                                <span className="condition-icon">
                                    ♥
                                </span>

                                <div>

                                    <h3>
                                        Hypertension
                                    </h3>

                                    <p>
                                        High blood pressure
                                    </p>

                                </div>

                            </div>

                        </label>


                        {/* Thyroid */}

                        <label className="condition-card">

                            <input
                                type="checkbox"
                                name="thyroid"
                                checked={
                                    formData.thyroid
                                }
                                onChange={
                                    handleCheckboxChange
                                }
                            />

                            <span className="custom-checkbox"></span>

                            <div className="condition-content">

                                <span className="condition-icon">
                                    ◇
                                </span>

                                <div>

                                    <h3>
                                        Thyroid
                                    </h3>

                                    <p>
                                        Thyroid-related condition
                                    </p>

                                </div>

                            </div>

                        </label>


                        {/* PCOS */}

                        <label className="condition-card">

                            <input
                                type="checkbox"
                                name="pcos"
                                checked={
                                    formData.pcos
                                }
                                onChange={
                                    handleCheckboxChange
                                }
                            />

                            <span className="custom-checkbox"></span>

                            <div className="condition-content">

                                <span className="condition-icon">
                                    ♧
                                </span>

                                <div>

                                    <h3>
                                        PCOS
                                    </h3>

                                    <p>
                                        Polycystic ovary syndrome
                                    </p>

                                </div>

                            </div>

                        </label>


                        {/* Asthma */}

                        <label className="condition-card">

                            <input
                                type="checkbox"
                                name="asthma"
                                checked={
                                    formData.asthma
                                }
                                onChange={
                                    handleCheckboxChange
                                }
                            />

                            <span className="custom-checkbox"></span>

                            <div className="condition-content">

                                <span className="condition-icon">
                                    ≋
                                </span>

                                <div>

                                    <h3>
                                        Asthma
                                    </h3>

                                    <p>
                                        Respiratory condition
                                    </p>

                                </div>

                            </div>

                        </label>


                        {/* Heart Disease */}

                        <label className="condition-card">

                            <input
                                type="checkbox"
                                name="heartDisease"
                                checked={
                                    formData.heartDisease
                                }
                                onChange={
                                    handleCheckboxChange
                                }
                            />

                            <span className="custom-checkbox"></span>

                            <div className="condition-content">

                                <span className="condition-icon">
                                    ♥
                                </span>

                                <div>

                                    <h3>
                                        Heart Disease
                                    </h3>

                                    <p>
                                        Any heart-related condition
                                    </p>

                                </div>

                            </div>

                        </label>

                    </div>


                    {/* =================================================
                        OTHER DISEASE
                    ================================================= */}

                    <div className="other-disease-section">

                        <label htmlFor="otherDisease">
                            Other Medical Condition
                        </label>

                        <p className="field-description">
                            If you have any other medical condition,
                            please mention it below.
                        </p>

                        <textarea
                            id="otherDisease"
                            name="otherDisease"
                            value={
                                formData.otherDisease
                            }
                            onChange={
                                handleOtherDiseaseChange
                            }
                            placeholder="Enter any other medical condition..."
                            rows="4"
                            maxLength="500"
                        />

                        <div className="character-count">
                            {
                                formData.otherDisease.length
                            }
                            /500
                        </div>

                    </div>


                    {/* =================================================
                        SUCCESS MESSAGE
                    ================================================= */}

                    {message && (
                        <div className="success-message">

                            <span>
                                ✓
                            </span>

                            {message}

                        </div>
                    )}


                    {/* =================================================
                        ERROR MESSAGE
                    ================================================= */}

                    {error && (
                        <div className="error-message">

                            <span>
                                !
                            </span>

                            {error}

                        </div>
                    )}


                    {/* =================================================
                        BUTTONS
                    ================================================= */}

                    <div className="form-actions">

                        <button
                            type="button"
                            className="reset-button"
                            onClick={handleReset}
                            disabled={loading}
                        >
                            Clear
                        </button>

                        <button
                            type="submit"
                            className="save-button"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span className="button-spinner"></span>

                                    Saving...
                                </>
                            ) : (
                                <>
                                    Save Medical History

                                    <span>
                                        →
                                    </span>
                                </>
                            )}

                        </button>

                    </div>

                </form>


                {/* =================================================
                    PRIVACY
                ================================================= */}

                <div className="privacy-note">

                    <span>
                        🔒
                    </span>

                    <p>
                        Your medical information is securely stored and
                        used only to provide personalized care through
                        NurtureAI.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default MedicalHistory;