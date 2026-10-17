
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaCalendarAlt,
  FaHeartbeat,
  FaWalking,
  FaAppleAlt,
  FaSmile,
  FaNotesMedical,
  FaBaby,
  FaRobot,
  FaDownload,
  FaSpinner,
  FaMoon,
  FaFire,
  FaClipboardCheck,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaChartLine,
  FaShieldAlt,
  FaLightbulb,
  FaTint,
  FaClock,
  FaRoad,
} from "react-icons/fa";

import Sidebar from "../../components/sidebar/Sidebar";
import API from "../../services/api";
import "./Report.css";

/* =========================================================
   GET LOGGED-IN USER ID
========================================================= */

const getUserId = () => {
  const possibleKeys = [
    "userId",
    "user_id",
    "loggedInUserId",
    "patientUserId",
  ];

  for (let i = 0; i < possibleKeys.length; i++) {
    const value = localStorage.getItem(possibleKeys[i]);

    if (value && value !== "null" && value !== "undefined") {
      return value;
    }
  }

  try {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?.id) return user.id;
    if (user?.userId) return user.userId;
  } catch (error) {
    console.warn("Unable to read logged-in user:", error);
  }

  return null;
};

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return String(date);
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  return number.toLocaleString("en-IN", {
    maximumFractionDigits: decimals,
  });
};

const numericValue = (value, fallback = null) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

/*
 * Reads the first available field from an API object.
 * Missing values are not converted into zeroes.
 */
const getFirstAvailable = (object, keys) => {
  if (!object || typeof object !== "object") {
    return null;
  }

  for (let i = 0; i < keys.length; i++) {
    const value = object[keys[i]];

    if (
      value !== null &&
      value !== undefined &&
      value !== ""
    ) {
      return value;
    }
  }

  return null;
};

const getScoreStatus = (score) => {
  const value = numericValue(score);

  if (value === null) return "No data";
  if (value >= 80) return "Good";
  if (value >= 60) return "Fair";

  return "Needs Attention";
};

const getScoreClass = (score) => {
  const value = numericValue(score);

  if (value === null) return "neutral";
  if (value >= 80) return "good";
  if (value >= 60) return "fair";

  return "attention";
};

const getUserName = (data) => {
  return (
    data?.patient?.fullName ||
    data?.patient?.name ||
    data?.user?.fullName ||
    data?.profile?.fullName ||
    data?.fullName ||
    "Patient"
  );
};

const getPhoneNumber = (data) => {
  return (
    data?.patient?.phoneNumber ||
    data?.patient?.mobile ||
    data?.user?.phoneNumber ||
    data?.user?.mobile ||
    data?.profile?.phoneNumber ||
    data?.phoneNumber ||
    data?.mobile ||
    "Not available"
  );
};

const getEmail = (data) => {
  return (
    data?.patient?.email ||
    data?.user?.email ||
    data?.profile?.email ||
    data?.email ||
    "Not available"
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const Report = () => {
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     LOAD REPORT
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadReport = async () => {
      const userId = getUserId();

      if (!userId) {
        if (!cancelled) {
          setError("User session not found. Please login again.");
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await API.get(`/reports/${userId}`, {
          withCredentials: true,
        });

        console.log(
          "FULL REPORT RESPONSE:",
          JSON.stringify(response.data, null, 2)
        );

        console.log(
          "HEALTH DATA:",
          JSON.stringify(
            response.data?.health ??
              response.data?.healthTracking ??
              response.data?.healthSummary ??
              {},
            null,
            2
          )
        );

        console.log(
          "AI WELLNESS INSIGHT:",
          JSON.stringify(
            response.data?.aiInsight ??
              response.data?.ai ??
              {},
            null,
            2
          )
        );

        if (!cancelled) {
          setReport(response?.data || {});
        }
      } catch (err) {
        console.error("Report loading error:", err);

        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              "Unable to load your wellness report."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     NORMALIZE BACKEND RESPONSE
  ========================================================= */

  const data = useMemo(() => {
    if (!report) return {};

    return {
      patient:
        report.patient ||
        report.user ||
        report.profile ||
        {},

      pregnancy:
        report.pregnancy ||
        report.pregnancyProfile ||
        {},

      health:
        report.health ||
        report.healthTracking ||
        report.healthSummary ||
        {},

      nutrition:
        report.nutrition ||
        report.nutritionSummary ||
        {},

      mood:
        report.mood ||
        report.moodSummary ||
        {},

      symptoms:
        report.symptoms ||
        report.symptomSummary ||
        {},

      ai:
        report.aiInsight ||
        report.ai ||
        {},

      reportPeriod:
        report.reportPeriod ||
        report.period || {
          startDate: report.weekStart,
          endDate: report.weekEnd,
        },

      overallScore:
        report.overallWellnessScore ??
        report.overallScore ??
        null,

      scoreChange: report.scoreChange ?? null,
    };
  }, [report]);

  /* =========================================================
     DOWNLOAD
  ========================================================= */

  const handleDownload = () => {
    window.print();
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="report-layout">
        <Sidebar />

        <main className="report-page">
          <div className="report-loading">
            <FaSpinner className="report-spinner" />

            <h2>Preparing your wellness report</h2>

            <p>
              We are preparing your pregnancy wellness summary.
            </p>
          </div>
        </main>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="report-layout">
        <Sidebar />

        <main className="report-page">
          <div className="report-error">
            <div className="report-error-icon">
              <FaNotesMedical />
            </div>

            <span className="error-label">REPORT ERROR</span>

            <h2>Unable to Load Report</h2>

            <p>{error}</p>

            <button
              className="report-primary-btn"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* =========================================================
     PATIENT INFORMATION
  ========================================================= */

  const patientName = getUserName(data);
  const phoneNumber = getPhoneNumber(data);
  const email = getEmail(data);

  /* =========================================================
     PREGNANCY INFORMATION
  ========================================================= */

  const pregnancyWeek = getFirstAvailable(data.pregnancy, [
    "pregnancyWeek",
    "week",
    "currentWeek",
    "gestationalWeek",
  ]);

  const trimester =
    getFirstAvailable(data.pregnancy, ["trimester"]) ||
    "Not available";

  const babyCount = getFirstAvailable(data.pregnancy, [
    "babyCount",
    "numberOfBabies",
    "numberOfBaby",
  ]);

  const dueDate = getFirstAvailable(data.pregnancy, [
    "dueDate",
    "expectedDueDate",
    "estimatedDueDate",
  ]);

  /* =========================================================
     WEEKLY AVERAGE HEALTH DATA
  ========================================================= */

  const health = data.health || {};

  const avgSteps = getFirstAvailable(health, [
    "averageSteps",
    "avgSteps",
    "stepsAverage",
    "averageStepCount",
    "steps",
  ]);

  const avgActiveMinutes = getFirstAvailable(health, [
    "averageActivityMinutes",
    "averageActiveMinutes",
    "avgActiveMinutes",
    "averageExerciseMinutes",
    "activeMinutes",
  ]);

  const avgDistance = getFirstAvailable(health, [
    "averageDistanceKm",
    "avgDistanceKm",
    "averageDistance",
    "distanceKm",
    "distance",
  ]);

  const avgCalories = getFirstAvailable(health, [
    "averageCaloriesBurned",
    "averageCalories",
    "avgCaloriesBurned",
    "avgCalories",
    "caloriesBurned",
    "calories",
  ]);

  const avgSleep = getFirstAvailable(health, [
    "averageSleepHours",
    "averageSleep",
    "avgSleepHours",
    "avgSleep",
    "sleepHours",
    "sleepDurationHours",
  ]);

  const avgWater = getFirstAvailable(health, [
    "averageWaterGlasses",
    "averageWater",
    "avgWaterGlasses",
    "avgWater",
    "waterGlasses",
    "waterIntakeGlasses",
    "dailyWaterGlasses",
  ]);

  console.log("REPORT HEALTH VALUES:", {
    avgSteps,
    avgActiveMinutes,
    avgDistance,
    avgCalories,
    avgSleep,
    avgWater,
  });

  /* =========================================================
     WELLNESS SCORES
  ========================================================= */

  const healthScore = getFirstAvailable(health, [
    "averageHealthScore",
    "healthScore",
  ]);

  const nutritionScore = getFirstAvailable(data.nutrition, [
    "score",
    "nutritionScore",
  ]);

  const moodScore = getFirstAvailable(data.mood, [
    "score",
    "moodScore",
  ]);

  const symptomStatus =
    getFirstAvailable(data.symptoms, ["status", "trend"]) ||
    "Stable";

  const symptomSeverity = getFirstAvailable(data.symptoms, [
    "averageSeverity",
    "severity",
  ]);

  /* =========================================================
     OVERALL SCORE
  ========================================================= */

  const overallScore = numericValue(data.overallScore);
  const overallStatus = getScoreStatus(overallScore);
  const overallScoreClass = getScoreClass(overallScore);

  /* =========================================================
     REPORT PERIOD
  ========================================================= */

  const startDate = data.reportPeriod?.startDate;
  const endDate = data.reportPeriod?.endDate;

  const reportPeriod =
    startDate && endDate
      ? `${formatDate(startDate)} – ${formatDate(endDate)}`
      : "Weekly Report";

  /* =========================================================
     AI-GENERATED WELLNESS INSIGHT
  ========================================================= */

  const aiMessage =
    data.ai?.message ||
    data.ai?.insight ||
    "";

  const aiSummary =
    data.ai?.summary ||
    "";

  const aiRecommendation =
    data.ai?.recommendation ||
    "";

  const aiInsightAvailable = Boolean(
    aiMessage || aiSummary || aiRecommendation
  );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="report-layout">
      <Sidebar />

      <main className="report-page">
        <div className="report-container">

          {/* TOP BAR */}

          <div className="report-topbar">
            <button
              className="report-back-btn"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft />
              <span>Back</span>
            </button>

            <div className="report-actions">
              <span className="secure-report">
                <FaShieldAlt />
                Private Wellness Report
              </span>

              <button
                className="report-download-btn"
                onClick={handleDownload}
              >
                <FaDownload />
                Download PDF
              </button>
            </div>
          </div>

          {/* HEADER */}

          <section className="report-hero">
            <div className="hero-left">
              <div className="hero-brand">
                <div className="hero-logo">
                  <FaHeartbeat />
                </div>

                <div className="hero-brand-text">
                  <span>NURTURE AI</span>
                  <small>Pregnancy Wellness Platform</small>
                </div>
              </div>

              <div className="hero-title">
                <span className="hero-eyebrow">
                  PERSONALIZED PREGNANCY REPORT
                </span>

                <h1>
                  Pregnancy Wellness
                  <br />
                  <strong>Weekly Report</strong>
                </h1>

                <p>
                  A simple summary of your pregnancy progress
                  and weekly wellness information.
                </p>
              </div>
            </div>

            <div className="hero-right">
              <div className="report-date-box">
                <FaCalendarAlt />

                <div>
                  <span>REPORT PERIOD</span>
                  <strong>{reportPeriod}</strong>
                </div>
              </div>

              <div className="generated-label">
                Generated on {formatDate(new Date())}
              </div>
            </div>
          </section>

          {/* PATIENT INFORMATION */}

          <section className="patient-card">
            <div className="patient-profile">
              <div className="patient-avatar">
                <FaUser />
              </div>

              <div className="patient-main">
                <span className="card-label">PATIENT</span>
                <h2>{patientName}</h2>

                <div className="patient-meta">
                  <span>
                    <FaEnvelope />
                    {email}
                  </span>

                  <span>
                    <FaPhone />
                    {phoneNumber}
                  </span>
                </div>
              </div>
            </div>

            <div className="patient-pregnancy">
              <div>
                <span>Pregnancy</span>
                <strong>
                  {pregnancyWeek !== null
                    ? `Week ${pregnancyWeek}`
                    : "--"}
                </strong>
              </div>

              <div>
                <span>Trimester</span>
                <strong>{trimester}</strong>
              </div>

              <div>
                <span>Baby Count</span>
                <strong>{babyCount ?? "--"}</strong>
              </div>
            </div>
          </section>

          {/* 01 PREGNANCY OVERVIEW */}

          <section className="report-section">
            <div className="section-header">
              <div className="section-title-group">
                <span className="section-number">01</span>

                <div>
                  <span className="section-label">
                    PREGNANCY OVERVIEW
                  </span>
                  <h2>Your Pregnancy Journey</h2>
                </div>
              </div>

              <FaBaby className="section-header-icon" />
            </div>

            <div className="pregnancy-overview-grid">
              <div className="pregnancy-overview-card">
                <div className="overview-icon">
                  <FaBaby />
                </div>

                <div>
                  <span>Pregnancy Week</span>
                  <strong>
                    {pregnancyWeek !== null
                      ? `Week ${pregnancyWeek}`
                      : "--"}
                  </strong>
                  <small>Current pregnancy progress</small>
                </div>
              </div>

              <div className="pregnancy-overview-card">
                <div className="overview-icon">
                  <FaHeartbeat />
                </div>

                <div>
                  <span>Trimester</span>
                  <strong>{trimester}</strong>
                  <small>Current stage of pregnancy</small>
                </div>
              </div>

              <div className="pregnancy-overview-card">
                <div className="overview-icon">
                  <FaBaby />
                </div>

                <div>
                  <span>Baby Count</span>
                  <strong>{babyCount ?? "--"}</strong>
                  <small>Number of babies recorded</small>
                </div>
              </div>

              <div className="pregnancy-overview-card">
                <div className="overview-icon">
                  <FaCalendarAlt />
                </div>

                <div>
                  <span>Expected Due Date</span>
                  <strong>{formatDate(dueDate)}</strong>
                  <small>Recorded expected delivery date</small>
                </div>
              </div>
            </div>
          </section>

          {/* 02 OVERALL WELLNESS */}

          <section className="report-section">
            <div className="section-header">
              <div className="section-title-group">
                <span className="section-number">02</span>

                <div>
                  <span className="section-label">
                    WELLNESS SCORE
                  </span>
                  <h2>Overall Wellness</h2>
                </div>
              </div>

              <FaChartLine className="section-header-icon" />
            </div>

            <div className="wellness-main-card">
              <div className="score-area">
                <div
                  className="score-ring"
                  style={{
                    "--score": overallScore ?? 0,
                  }}
                >
                  <div className="score-ring-inner">
                    <span>WELLNESS</span>

                    <strong>
                      {overallScore !== null
                        ? formatNumber(overallScore)
                        : "--"}
                    </strong>

                    <small>/ 100</small>
                  </div>
                </div>
              </div>

              <div className="wellness-summary">
                <div className="wellness-heading">
                  <div>
                    <span>WEEKLY ASSESSMENT</span>
                    <h3>Your Overall Wellness</h3>
                  </div>

                  <div className={`score-badge ${overallScoreClass}`}>
                    {overallStatus}
                  </div>
                </div>

                <p>
                  This score provides a simple summary of the wellness
                  information recorded during this reporting period.
                </p>

                {data.scoreChange !== null &&
                  data.scoreChange !== undefined && (
                    <div className="score-comparison">
                      <FaChartLine />

                      <div>
                        <span>Change from previous report</span>

                        <strong>
                          {Number(data.scoreChange) >= 0 ? "↑" : "↓"}{" "}
                          {Math.abs(Number(data.scoreChange))}%
                        </strong>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </section>

          {/* 03 WEEKLY AVERAGE HEALTH */}

          <section className="report-section">
            <div className="section-header">
              <div className="section-title-group">
                <span className="section-number">03</span>

                <div>
                  <span className="section-label">
                    WEEKLY AVERAGES
                  </span>
                  <h2>Health Summary</h2>
                </div>
              </div>

              <FaWalking className="section-header-icon" />
            </div>

            <p className="section-description">
              Average values from your health tracking records during
              this reporting period. Detailed daily activity remains
              available on the Health Tracking page.
            </p>

            <div className="average-health-grid">
              <div className="average-card">
                <div className="average-icon">
                  <FaWalking />
                </div>

                <div className="average-card-content">
                  <span>Average Steps</span>
                  <strong>{formatNumber(avgSteps)}</strong>
                  <small>steps per day</small>
                </div>
              </div>

              <div className="average-card">
                <div className="average-icon">
                  <FaClock />
                </div>

                <div className="average-card-content">
                  <span>Average Active Time</span>
                  <strong>{formatNumber(avgActiveMinutes)}</strong>
                  <small>minutes per day</small>
                </div>
              </div>

              <div className="average-card">
                <div className="average-icon">
                  <FaRoad />
                </div>

                <div className="average-card-content">
                  <span>Average Distance</span>
                  <strong>{formatNumber(avgDistance, 1)}</strong>
                  <small>km per day</small>
                </div>
              </div>

              <div className="average-card">
                <div className="average-icon">
                  <FaFire />
                </div>

                <div className="average-card-content">
                  <span>Average Calories</span>
                  <strong>{formatNumber(avgCalories)}</strong>
                  <small>calories per day</small>
                </div>
              </div>

              <div className="average-card">
                <div className="average-icon">
                  <FaMoon />
                </div>

                <div className="average-card-content">
                  <span>Average Sleep</span>
                  <strong>{formatNumber(avgSleep, 1)}</strong>
                  <small>hours per day</small>
                </div>
              </div>

              <div className="average-card">
                <div className="average-icon">
                  <FaTint />
                </div>

                <div className="average-card-content">
                  <span>Average Water</span>
                  <strong>{formatNumber(avgWater, 1)}</strong>
                  <small>glasses per day</small>
                </div>
              </div>
            </div>
          </section>

          {/* 04 WELLNESS SUMMARY */}

          <section className="report-section">
            <div className="section-header">
              <div className="section-title-group">
                <span className="section-number">04</span>

                <div>
                  <span className="section-label">
                    WELLNESS SUMMARY
                  </span>
                  <h2>Nutrition, Mood & Symptoms</h2>
                </div>
              </div>
            </div>

            <div className="wellness-summary-grid">
              <div className="wellness-summary-card">
                <div className="summary-card-icon">
                  <FaAppleAlt />
                </div>

                <div className="summary-card-content">
                  <span>Nutrition</span>

                  <strong>
                    {nutritionScore !== null &&
                    nutritionScore !== undefined
                      ? `${formatNumber(nutritionScore)} / 100`
                      : "--"}
                  </strong>

                  <small
                    className={`summary-status ${getScoreClass(
                      nutritionScore
                    )}`}
                  >
                    {getScoreStatus(nutritionScore)}
                  </small>
                </div>
              </div>

              <div className="wellness-summary-card">
                <div className="summary-card-icon">
                  <FaSmile />
                </div>

                <div className="summary-card-content">
                  <span>Emotional Wellbeing</span>

                  <strong>
                    {moodScore !== null && moodScore !== undefined
                      ? `${formatNumber(moodScore)} / 100`
                      : "--"}
                  </strong>

                  <small
                    className={`summary-status ${getScoreClass(
                      moodScore
                    )}`}
                  >
                    {getScoreStatus(moodScore)}
                  </small>
                </div>
              </div>

              <div className="wellness-summary-card">
                <div className="summary-card-icon">
                  <FaNotesMedical />
                </div>

                <div className="summary-card-content">
                  <span>Symptoms</span>
                  <strong>{symptomStatus}</strong>

                  <small>
                    {symptomSeverity !== null &&
                    symptomSeverity !== undefined
                      ? `Average severity: ${symptomSeverity}`
                      : "Based on recorded symptoms"}
                  </small>
                </div>
              </div>
            </div>
          </section>

          {/* 05 AI-GENERATED WELLNESS INSIGHT */}

          <section className="ai-report-section">
            <div className="ai-report-card">
              <div className="ai-report-icon">
                <FaRobot />
              </div>

              <div className="ai-report-content">
                <div className="ai-report-heading">
                  <div>
                    <span>NURTURE AI · GEMINI</span>
                    <h2>Personalized Wellness Insight</h2>
                  </div>

                  <FaLightbulb />
                </div>

                {aiInsightAvailable ? (
                  <>
                    {aiMessage && (
                      <div className="ai-insight-message">
                        <h3>Weekly Insight</h3>
                        <p>{aiMessage}</p>
                      </div>
                    )}

                    {aiSummary && (
                      <div className="ai-insight-summary">
                        <h3>AI Analysis</h3>
                        <p>{aiSummary}</p>
                      </div>
                    )}

                    {aiRecommendation && (
                      <div className="ai-insight-recommendation">
                        <h3>Personalized Tip</h3>
                        <p>{aiRecommendation}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="ai-insight-unavailable">
                    <h3>Insight temporarily unavailable</h3>

                    <p>
                      Your wellness report is available, but an AI-generated
                      insight was not returned. Please refresh your report
                      or try again later.
                    </p>
                  </div>
                )}

                <div className="ai-note">
                  <FaClipboardCheck />

                  <span>
                    These AI-generated insights use the wellness
                    information returned by your report service.
                    They provide general guidance and do not replace
                    professional medical advice.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 06 RECOMMENDATIONS */}

          <section className="recommendation-section">
            <div className="recommendation-card">
              <div className="recommendation-icon">
                <FaLightbulb />
              </div>

              <div className="recommendation-content">
                <span className="section-label">
                  AI-PERSONALIZED WELLNESS TIP
                </span>

                <h3>
                  {aiRecommendation
                    ? "Your Personalized Recommendation"
                    : "Personalized Tip Unavailable"}
                </h3>

                <p>
                  {aiRecommendation ||
                    "Your personalized recommendation could not be generated. Please refresh your report to try again."}
                </p>
              </div>
            </div>

            <div className="recommendation-card">
              <div className="recommendation-icon">
                <FaShieldAlt />
              </div>

              <div className="recommendation-content">
                <span className="section-label">IMPORTANT</span>

                <h3>
                  When to contact your healthcare professional
                </h3>

                <p>
                  If you experience persistent, unusual, or concerning
                  symptoms, contact your doctor or healthcare
                  professional. This report does not replace medical advice.
                </p>
              </div>
            </div>
          </section>

          {/* FOOTER */}

          <footer className="report-footer">
            <div className="footer-brand">
              <div className="footer-logo">
                <FaHeartbeat />
              </div>

              <div>
                <strong>Nurture AI</strong>
                <span>
                  Personalized pregnancy wellness support
                </span>
              </div>
            </div>

            <div className="footer-right">
              <span>
                Report generated on {formatDate(new Date())}
              </span>

              <span>Confidential Wellness Report</span>
            </div>
          </footer>

        </div>
      </main>
    </div>
  );
};

export default Report;
