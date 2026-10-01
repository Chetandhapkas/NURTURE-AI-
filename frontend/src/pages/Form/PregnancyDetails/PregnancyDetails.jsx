import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getPregnancyDetails,
  savePregnancyDetails,
  updatePregnancyDetails,
} from "../../../services/PregnancyAPI";

import "./PregnancyDetails.css";

/* =========================================================
   CONSTANTS
========================================================= */

const DUE_DATE_DAYS = 280;
const DRAFT_KEY = "nurturePregnancyDraft";

/* =========================================================
   DEFAULT FORM
========================================================= */

const defaultFormData = {
  /* Current pregnancy */
  lastMenstrualPeriod: "",
  pregnancyType: "Natural",

  /* Automatically derived */
  ivfPregnancy: false,

  babyCount: 1,

  /* Calculated values */
  dueDate: "",
  pregnancyWeek: 0,
  pregnancyDays: 0,
  trimester: "",

  /* Previous pregnancy history */
  firstPregnancy: true,
  previousPregnancies: 0,
  liveBirths: 0,
  miscarriages: 0,

  /* Health */
  highRisk: false,

  /* Notes */
  doctorNotes: "",
};

/* =========================================================
   DATE HELPERS
========================================================= */

const parseDateInput = (value) => {
  if (!value) return null;

  const parts = value.split("-");

  if (parts.length !== 3) return null;

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  const date = new Date(
    year,
    month - 1,
    day
  );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const formatDateInput = (date) => {
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* =========================================================
   CURRENT DATE
========================================================= */

const getToday = () => {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
};

/* =========================================================
   DAYS DIFFERENCE
========================================================= */

const getDaysDifference = (
  startDate,
  endDate
) => {
  const millisecondsPerDay =
    24 * 60 * 60 * 1000;

  return Math.floor(
    (
      endDate.getTime() -
      startDate.getTime()
    ) / millisecondsPerDay
  );
};

/* =========================================================
   PREGNANCY CALCULATIONS
========================================================= */

const calculateDueDate = (lmp) => {
  const lmpDate =
    parseDateInput(lmp);

  if (!lmpDate) {
    return "";
  }

  const dueDate =
    new Date(lmpDate);

  dueDate.setDate(
    dueDate.getDate() +
      DUE_DATE_DAYS
  );

  return formatDateInput(
    dueDate
  );
};

/* =========================================================
   CALCULATE CURRENT PREGNANCY AGE
========================================================= */

const calculatePregnancyAge = (lmp) => {
  const lmpDate =
    parseDateInput(lmp);

  if (!lmpDate) {
    return {
      weeks: 0,
      days: 0,
      totalDays: 0,
    };
  }

  const today =
    getToday();

  const totalDays =
    getDaysDifference(
      lmpDate,
      today
    );

  if (totalDays < 0) {
    return {
      weeks: 0,
      days: 0,
      totalDays,
    };
  }

  return {
    weeks: Math.floor(
      totalDays / 7
    ),

    days:
      totalDays % 7,

    totalDays,
  };
};

/* =========================================================
   CALCULATE TRIMESTER
========================================================= */

const calculateTrimester = (
  weeks
) => {
  if (
    !Number.isInteger(weeks) ||
    weeks < 0
  ) {
    return "";
  }

  if (weeks <= 13) {
    return "First Trimester";
  }

  if (weeks <= 27) {
    return "Second Trimester";
  }

  return "Third Trimester";
};

/* =========================================================
   CALCULATE COMPLETE TIMELINE
========================================================= */

const calculateTimeline = (
  lmp
) => {
  if (!lmp) {
    return {
      dueDate: "",
      pregnancyWeek: 0,
      pregnancyDays: 0,
      trimester: "",
    };
  }

  const age =
    calculatePregnancyAge(lmp);

  return {
    dueDate:
      calculateDueDate(lmp),

    pregnancyWeek:
      age.weeks,

    pregnancyDays:
      age.days,

    trimester:
      calculateTrimester(
        age.weeks
      ),
  };
};

/* =========================================================
   NUMBER HELPER
========================================================= */

const toNonNegativeInteger = (
  value
) => {
  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(number)
  );
};

/* =========================================================
   BOOLEAN HELPER
========================================================= */

const toBoolean = (
  value
) => {
  return (
    value === true ||
    value === "true"
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const PregnancyDetails = () => {
  const navigate =
    useNavigate();

  const [
    formData,
    setFormData
  ] = useState(
    defaultFormData
  );

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    fetching,
    setFetching
  ] = useState(true);

  const [
    profileExists,
    setProfileExists
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  /* =======================================================
     USER ID
  ======================================================= */

  const getUserId = () => {
    return (
      localStorage.getItem(
        "userId"
      ) ||
      sessionStorage.getItem(
        "userId"
      )
    );
  };

  /* =======================================================
     SAVE DRAFT
  ======================================================= */

  const saveDraft = (
    data
  ) => {
    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify(data)
      );
    } catch (err) {
      console.error(
        "Unable to save pregnancy draft:",
        err
      );
    }
  };

  /* =======================================================
     NORMALIZE BACKEND DATA
  ======================================================= */

  const normalizeData = (
    data
  ) => {
    const previousPregnancies =
      toNonNegativeInteger(
        data?.previousPregnancies
      );

    const firstPregnancy =
      previousPregnancies === 0;

    const babyCount =
      Math.max(
        1,
        toNonNegativeInteger(
          data?.babyCount ?? 1
        )
      );

    const pregnancyType =
      data?.pregnancyType ||
      "Natural";

    const ivfPregnancy =
      pregnancyType === "IVF";

    /*
      IMPORTANT:
      Week, days, due date and trimester
      are ALWAYS recalculated from LMP.
    */

    const timeline =
      calculateTimeline(
        data?.lastMenstrualPeriod ||
          ""
      );

    return {
      lastMenstrualPeriod:
        data?.lastMenstrualPeriod ||
        "",

      pregnancyType,

      ivfPregnancy,

      babyCount,

      dueDate:
        timeline.dueDate,

      pregnancyWeek:
        timeline.pregnancyWeek,

      pregnancyDays:
        timeline.pregnancyDays,

      trimester:
        timeline.trimester,

      firstPregnancy,

      previousPregnancies,

      liveBirths:
        toNonNegativeInteger(
          data?.liveBirths
        ),

      miscarriages:
        toNonNegativeInteger(
          data?.miscarriages
        ),

      highRisk:
        toBoolean(
          data?.highRisk
        ),

      doctorNotes:
        data?.doctorNotes || "",
    };
  };

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    loadPregnancyDetails();
  }, []);

  const loadPregnancyDetails =
    async () => {
      const userId =
        getUserId();

      if (!userId) {
        setError(
          "User not found. Please login again."
        );

        setFetching(false);
        return;
      }

      try {
        setFetching(true);
        setError("");

        try {
          const response =
            await getPregnancyDetails(
              Number(userId)
            );

          const backendData =
            response?.data?.data ||
            response?.data;

          if (
            backendData &&
            (
              backendData.id ||
              backendData.pregnancyId ||
              backendData.lastMenstrualPeriod
            )
          ) {
            setProfileExists(
              true
            );

            const normalized =
              normalizeData(
                backendData
              );

            setFormData(
              normalized
            );

            sessionStorage.removeItem(
              DRAFT_KEY
            );

            return;
          }
        } catch (
          backendError
        ) {
          if (
            backendError.response
              ?.status !== 404
          ) {
            throw backendError;
          }
        }

        /* =================================================
           LOAD DRAFT
        ================================================= */

        const draft =
          sessionStorage.getItem(
            DRAFT_KEY
          );

        if (draft) {
          try {
            const parsed =
              JSON.parse(draft);

            setFormData(
              normalizeData(
                parsed
              )
            );
          } catch (err) {
            console.error(
              "Invalid pregnancy draft:",
              err
            );

            sessionStorage.removeItem(
              DRAFT_KEY
            );
          }
        }
      } catch (err) {
        console.error(
          "Pregnancy loading error:",
          err
        );

        setError(
          "Unable to load pregnancy information."
        );
      } finally {
        setFetching(false);
      }
    };

  /* =======================================================
     AUTOMATIC DAILY FRONTEND UPDATE
     
     If this page remains open overnight,
     the week/trimester will update automatically.
  ======================================================= */

  useEffect(() => {
    if (
      !formData.lastMenstrualPeriod
    ) {
      return;
    }

    const updateTimeline =
      () => {
        const timeline =
          calculateTimeline(
            formData.lastMenstrualPeriod
          );

        setFormData(
          (previous) => {
            if (
              previous.pregnancyWeek ===
                timeline.pregnancyWeek &&
              previous.pregnancyDays ===
                timeline.pregnancyDays &&
              previous.trimester ===
                timeline.trimester &&
              previous.dueDate ===
                timeline.dueDate
            ) {
              return previous;
            }

            const updated = {
              ...previous,
              dueDate:
                timeline.dueDate,
              pregnancyWeek:
                timeline.pregnancyWeek,
              pregnancyDays:
                timeline.pregnancyDays,
              trimester:
                timeline.trimester,
            };

            saveDraft(updated);

            return updated;
          }
        );
      };

    updateTimeline();

    /*
      Check every minute so if the date changes
      while the page is open, the UI updates.
    */

    const interval =
      setInterval(
        updateTimeline,
        60 * 1000
      );

    return () => {
      clearInterval(
        interval
      );
    };
  }, [
    formData.lastMenstrualPeriod,
  ]);

  /* =======================================================
     HANDLE INPUT
  ======================================================= */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    let updated = {
      ...formData,
      [name]: value,
    };

    /* =====================================================
       IVF
    ===================================================== */

    if (
      name ===
      "pregnancyType"
    ) {
      updated.ivfPregnancy =
        value === "IVF";
    }

    /* =====================================================
       LMP
    ===================================================== */

    if (
      name ===
      "lastMenstrualPeriod"
    ) {
      const timeline =
        calculateTimeline(
          value
        );

      updated = {
        ...updated,

        dueDate:
          timeline.dueDate,

        pregnancyWeek:
          timeline.pregnancyWeek,

        pregnancyDays:
          timeline.pregnancyDays,

        trimester:
          timeline.trimester,
      };
    }

    /* =====================================================
       BABY COUNT
    ===================================================== */

    if (
      name ===
      "babyCount"
    ) {
      updated.babyCount =
        toNonNegativeInteger(
          value
        );
    }

    /* =====================================================
       PREVIOUS PREGNANCIES
    ===================================================== */

    if (
      name ===
      "previousPregnancies"
    ) {
      const previous =
        toNonNegativeInteger(
          value
        );

      updated.previousPregnancies =
        previous;

      updated.firstPregnancy =
        previous === 0;

      if (
        previous === 0
      ) {
        updated.liveBirths =
          0;

        updated.miscarriages =
          0;
      }
    }

    /* =====================================================
       LIVE BIRTHS
    ===================================================== */

    if (
      name ===
      "liveBirths"
    ) {
      updated.liveBirths =
        toNonNegativeInteger(
          value
        );
    }

    /* =====================================================
       MISCARRIAGES
    ===================================================== */

    if (
      name ===
      "miscarriages"
    ) {
      updated.miscarriages =
        toNonNegativeInteger(
          value
        );
    }

    setFormData(
      updated
    );

    saveDraft(
      updated
    );

    setError("");
  };

  /* =======================================================
     BOOLEAN INPUT
  ======================================================= */

  const handleBooleanChange = (
    field,
    value
  ) => {
    const updated = {
      ...formData,
      [field]:
        toBoolean(value),
    };

    setFormData(
      updated
    );

    saveDraft(
      updated
    );

    setError("");
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm = () => {
    if (
      !formData.lastMenstrualPeriod
    ) {
      return "Please select the first day of your last menstrual period.";
    }

    const lmpDate =
      parseDateInput(
        formData.lastMenstrualPeriod
      );

    if (!lmpDate) {
      return "Please enter a valid last menstrual period.";
    }

    const today =
      getToday();

    if (
      lmpDate > today
    ) {
      return "Last menstrual period cannot be in the future.";
    }

    /* =====================================================
       CURRENT PREGNANCY
    ===================================================== */

    const babyCount =
      toNonNegativeInteger(
        formData.babyCount
      );

    if (
      babyCount < 1
    ) {
      return "Number of babies must be at least 1.";
    }

    /* =====================================================
       PREVIOUS HISTORY
    ===================================================== */

    const previousPregnancies =
      toNonNegativeInteger(
        formData.previousPregnancies
      );

    const liveBirths =
      toNonNegativeInteger(
        formData.liveBirths
      );

    const miscarriages =
      toNonNegativeInteger(
        formData.miscarriages
      );

    if (
      previousPregnancies ===
      0
    ) {
      if (
        liveBirths !== 0 ||
        miscarriages !== 0
      ) {
        return "With no previous pregnancies, previous live births and miscarriages must both be 0.";
      }
    }

    if (
      liveBirths >
      previousPregnancies
    ) {
      return "Live births cannot be greater than previous pregnancies.";
    }

    if (
      miscarriages >
      previousPregnancies
    ) {
      return "Miscarriages cannot be greater than previous pregnancies.";
    }

    if (
      liveBirths +
        miscarriages >
      previousPregnancies
    ) {
      return "Live births and miscarriages together cannot be greater than previous pregnancies.";
    }

    return "";
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (
      validationError
    ) {
      setError(
        validationError
      );

      return;
    }

    const userId =
      getUserId();

    if (!userId) {
      setError(
        "User not found. Please login again."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      /* =================================================
         ALWAYS CALCULATE FROM CURRENT DATE
      ================================================= */

      const timeline =
        calculateTimeline(
          formData.lastMenstrualPeriod
        );

      /* =================================================
         HISTORY
      ================================================= */

      const previousPregnancies =
        toNonNegativeInteger(
          formData.previousPregnancies
        );

      const liveBirths =
        previousPregnancies ===
        0
          ? 0
          : toNonNegativeInteger(
              formData.liveBirths
            );

      const miscarriages =
        previousPregnancies ===
        0
          ? 0
          : toNonNegativeInteger(
              formData.miscarriages
            );

      const babyCount =
        Math.max(
          1,
          toNonNegativeInteger(
            formData.babyCount
          )
        );

      const firstPregnancy =
        previousPregnancies ===
        0;

      /* =================================================
         IVF
      ================================================= */

      const ivfPregnancy =
        formData.pregnancyType ===
        "IVF";

      /* =================================================
         FINAL REQUEST
      ================================================= */

      const request = {
        userId:
          Number(userId),

        /* CURRENT PREGNANCY */

        lastMenstrualPeriod:
          formData.lastMenstrualPeriod,

        pregnancyType:
          formData.pregnancyType,

        ivfPregnancy,

        babyCount,

        multiplePregnancy:
          babyCount > 1,

        /* TIMELINE */

        dueDate:
          timeline.dueDate,

        pregnancyWeek:
          timeline.pregnancyWeek,

        pregnancyDays:
          timeline.pregnancyDays,

        trimester:
          timeline.trimester,

        /* HISTORY */

        firstPregnancy,

        previousPregnancies,

        liveBirths,

        miscarriages,

        /* HEALTH */

        highRisk:
          toBoolean(
            formData.highRisk
          ),

        /* NOTES */

        doctorNotes:
          formData.doctorNotes?.trim() ||
          "",
      };

      console.log(
        "FINAL PREGNANCY REQUEST:",
        request
      );

      /* =================================================
         CREATE
      ================================================= */

      if (
        !profileExists
      ) {
        await savePregnancyDetails(
          request
        );

        alert(
          "Pregnancy details saved successfully!"
        );
      }

      /* =================================================
         UPDATE
      ================================================= */

      else {
        await updatePregnancyDetails(
          Number(userId),
          request
        );

        alert(
          "Pregnancy details updated successfully!"
        );
      }

      sessionStorage.removeItem(
        DRAFT_KEY
      );

      navigate(
        "/medical-history"
      );
    } catch (err) {
      console.error(
        "Pregnancy save error:",
        err
      );

      if (
        err.response
      ) {
        setError(
          err.response.data
            ?.message ||
            "Unable to save pregnancy details."
        );
      } else if (
        err.request
      ) {
        setError(
          "Unable to connect to the backend server."
        );
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(
        false
      );
    }
  };

  /* =======================================================
     BACK
  ======================================================= */

  const handleBack = () => {
    saveDraft(
      formData
    );

    navigate(
      "/personal-info"
    );
  };

  /* =======================================================
     SKIP
  ======================================================= */

  const handleSkip = () => {
    const confirmSkip =
      window.confirm(
        "You can complete pregnancy details later. Do you want to skip?"
      );

    if (
      confirmSkip
    ) {
      saveDraft(
        formData
      );

      navigate(
        "/dashboard"
      );
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (fetching) {
    return (
      <div className="personal-loading">
        <div className="loading-spinner"></div>

        <p>
          Loading pregnancy information...
        </p>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="personal-page">

      <div className="personal-card">

        {/* HEADER */}

        <div className="personal-header">

          <div className="header-icon">
            🤰
          </div>

          <h1>
            Pregnancy Details
          </h1>

          <p>
            Tell us about your current pregnancy
            and previous pregnancy history.
          </p>

          <div className="personal-quote">
            <span>
              “
            </span>

            Every pregnancy is a unique journey.
            Nurture AI uses this information to
            personalize your experience.
          </div>

          {profileExists && (
            <div className="profile-status">
              ✓ Pregnancy information already saved
            </div>
          )}

        </div>

        {/* ERROR */}

        {error && (
          <div className="error-message">

            <span>
              ⚠
            </span>

            <span>
              {error}
            </span>

          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
        >

          {/* =================================================
              PREGNANCY TIMELINE
          ================================================= */}

          <div className="section-title">

            <span>
              📅
            </span>

            Pregnancy Timeline

          </div>

          <div className="form-row">

            {/* LMP */}

            <div className="form-group">

              <label>
                Last Menstrual Period{" "}
                <span>
                  *
                </span>
              </label>

              <input
                type="date"
                name="lastMenstrualPeriod"
                value={
                  formData.lastMenstrualPeriod
                }
                onChange={
                  handleChange
                }
                max={
                  formatDateInput(
                    getToday()
                  )
                }
                required
              />

              <small>
                Enter the first day of your
                last menstrual period.
              </small>

            </div>

            {/* DUE DATE */}

            <div className="form-group">

              <label>
                Estimated Due Date
              </label>

              <input
                type="date"
                value={
                  formData.dueDate
                }
                readOnly
              />

              <small>
                Automatically calculated
                from the LMP.
              </small>

            </div>

          </div>

          {/* AGE + TRIMESTER */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Pregnancy Age
              </label>

              <div className="readonly-input">

                {formData.pregnancyWeek !==
                    null &&
                formData.pregnancyWeek !==
                    undefined &&
                formData.trimester
                  ? `${formData.pregnancyWeek} weeks ${formData.pregnancyDays} days`
                  : "Will be calculated"}

              </div>

              <small>
                Automatically calculated from
                your last menstrual period.
              </small>

            </div>

            <div className="form-group">

              <label>
                Trimester
              </label>

              <div className="readonly-input">

                {formData.trimester ||
                  "Will be calculated"}

              </div>

              <small>
                Automatically calculated.
              </small>

            </div>

          </div>

          {/* =================================================
              CURRENT PREGNANCY
          ================================================= */}

          <div className="section-title">

            <span>
              🌸
            </span>

            Current Pregnancy

          </div>

          <div className="form-row">

            {/* PREGNANCY TYPE */}

            <div className="form-group">

              <label>
                Pregnancy Type
              </label>

              <select
                name="pregnancyType"
                value={
                  formData.pregnancyType
                }
                onChange={
                  handleChange
                }
              >

                <option value="Natural">
                  Natural / Spontaneous
                </option>

                <option value="IVF">
                  IVF
                </option>

              </select>

              <small>
                Select how the current pregnancy
                was conceived.
              </small>

            </div>

            {/* IVF STATUS */}

            <div className="form-group">

              <label>
                IVF Pregnancy
              </label>

              <div className="readonly-input">

                {formData.pregnancyType ===
                "IVF"
                  ? "Yes — IVF Pregnancy"
                  : "No — Natural Pregnancy"}

              </div>

              <small>
                Automatically determined from
                pregnancy type.
              </small>

            </div>

          </div>

          {/* BABY COUNT */}

          <div className="form-group">

            <label>
              Number of Babies
            </label>

            <input
              type="number"
              name="babyCount"
              min="1"
              step="1"
              value={
                formData.babyCount
              }
              onChange={
                handleChange
              }
            />

            <small>
              Enter the number of babies
              expected in this pregnancy.
            </small>

          </div>

          {/* MULTIPLE PREGNANCY */}

          <div className="form-group">

            <label>
              Multiple Pregnancy
            </label>

            <div className="readonly-input">

              {formData.babyCount > 1
                ? "Yes — Multiple Pregnancy"
                : "No — Singleton Pregnancy"}

            </div>

            <small>
              Automatically determined from
              the number of babies.
            </small>

          </div>

          {/* =================================================
              PREVIOUS PREGNANCY HISTORY
          ================================================= */}

          <div className="section-title">

            <span>
              💗
            </span>

            Previous Pregnancy History

          </div>

          {/* PREVIOUS PREGNANCIES */}

          <div className="form-group">

            <label>
              Previous Pregnancies
            </label>

            <input
              type="number"
              name="previousPregnancies"
              min="0"
              step="1"
              value={
                formData.previousPregnancies
              }
              onChange={
                handleChange
              }
            />

            <small>
              Number of pregnancies before
              the current pregnancy.
            </small>

          </div>

          {/* HISTORY STATUS */}

          <div className="form-group">

            <label>
              Pregnancy History
            </label>

            <div className="readonly-input">

              {formData.previousPregnancies ===
              0
                ? "First Pregnancy"
                : "Previous Pregnancy History Available"}

            </div>

            <small>
              Automatically determined from
              previous pregnancies.
            </small>

          </div>

          {/* PREVIOUS OUTCOMES */}

          {formData.previousPregnancies >
            0 && (
            <>
              <div className="form-row">

                {/* LIVE BIRTHS */}

                <div className="form-group">

                  <label>
                    Previous Live Births
                  </label>

                  <input
                    type="number"
                    name="liveBirths"
                    min="0"
                    max={
                      formData.previousPregnancies
                    }
                    step="1"
                    value={
                      formData.liveBirths
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <small>
                    Number of previous pregnancies
                    that resulted in a live birth.
                  </small>

                </div>

                {/* MISCARRIAGES */}

                <div className="form-group">

                  <label>
                    Previous Miscarriages
                  </label>

                  <input
                    type="number"
                    name="miscarriages"
                    min="0"
                    max={
                      formData.previousPregnancies
                    }
                    step="1"
                    value={
                      formData.miscarriages
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <small>
                    Number of previous pregnancies
                    that ended in miscarriage.
                  </small>

                </div>

              </div>

              {/* HISTORY SUMMARY */}

              <div className="history-summary">

                <h3>
                  Pregnancy History Summary
                </h3>

                <div className="history-summary-grid">

                  <div>
                    <span>
                      Previous pregnancies
                    </span>

                    <strong>
                      {
                        formData.previousPregnancies
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Live births
                    </span>

                    <strong>
                      {
                        formData.liveBirths
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Miscarriages
                    </span>

                    <strong>
                      {
                        formData.miscarriages
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Current pregnancy
                    </span>

                    <strong>
                      1
                    </strong>
                  </div>

                </div>

                <div className="history-calculation">

                  <strong>
                    Outcome check:
                  </strong>

                  {" "}

                  {
                    formData.liveBirths +
                    formData.miscarriages
                  }

                  {" / "}

                  {
                    formData.previousPregnancies
                  }

                  {" previous pregnancies accounted for"}

                </div>

              </div>
            </>
          )}

          {/* =================================================
              HEALTH
          ================================================= */}

          <div className="section-title">

            <span>
              🩺
            </span>

            Health Information

          </div>

          <div className="form-group">

            <label>
              High Risk Pregnancy
            </label>

            <select
              value={
                String(
                  formData.highRisk
                )
              }
              onChange={(e) =>
                handleBooleanChange(
                  "highRisk",
                  e.target.value
                )
              }
            >

              <option value="false">
                No
              </option>

              <option value="true">
                Yes
              </option>

            </select>

            <small>
              Select Yes only if a healthcare
              professional has identified this
              pregnancy as high risk.
            </small>

          </div>

          {/* =================================================
              NOTES
          ================================================= */}

          <div className="section-title">

            <span>
              📝
            </span>

            Additional Information

          </div>

          <div className="form-group">

            <label>
              Doctor Notes
            </label>

            <textarea
              name="doctorNotes"
              value={
                formData.doctorNotes
              }
              onChange={
                handleChange
              }
              rows="5"
              placeholder="Add any important notes or instructions from your doctor..."
            />

          </div>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="button-container">

            <button
              type="button"
              className="back-button"
              onClick={
                handleBack
              }
              disabled={
                loading
              }
            >
              ← Back
            </button>

            <button
              type="button"
              className="skip-button"
              onClick={
                handleSkip
              }
              disabled={
                loading
              }
            >
              Skip
            </button>

            <button
              type="submit"
              className="next-button"
              disabled={
                loading
              }
            >

              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  {profileExists
                    ? "Update & Continue"
                    : "Save & Continue"}

                  <span>
                    →
                  </span>
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default PregnancyDetails;