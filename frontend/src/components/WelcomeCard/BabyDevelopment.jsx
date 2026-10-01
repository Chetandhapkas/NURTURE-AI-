import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import API from "../../services/api";

import "./BabyDevelopment.css";

/* =========================================================
   DATE HELPERS
========================================================= */

const parseDateInput = (
  value
) => {
  if (!value) {
    return null;
  }

  const parts =
    value.split("-");

  if (parts.length !== 3) {
    return null;
  }

  const year =
    Number(parts[0]);

  const month =
    Number(parts[1]);

  const day =
    Number(parts[2]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  const date =
    new Date(
      year,
      month - 1,
      day
    );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !==
      month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

/* =========================================================
   TODAY
========================================================= */

const getToday = () => {
  const now =
    new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
};

/* =========================================================
   CALCULATE CURRENT PREGNANCY WEEK
========================================================= */

const calculateCurrentPregnancy =
  (pregnancy) => {
    if (!pregnancy) {
      return {
        pregnancyWeek: null,
        pregnancyDays: 0,
        trimester: "Not available",
      };
    }

    const lmpDate =
      parseDateInput(
        pregnancy.lastMenstrualPeriod
      );

    if (!lmpDate) {
      return {
        pregnancyWeek:
          pregnancy.pregnancyWeek ??
          null,

        pregnancyDays:
          pregnancy.pregnancyDays ??
          0,

        trimester:
          pregnancy.trimester ||
          "Not available",
      };
    }

    const today =
      getToday();

    const millisecondsPerDay =
      24 * 60 * 60 * 1000;

    const totalDays =
      Math.floor(
        (
          today.getTime() -
          lmpDate.getTime()
        ) /
          millisecondsPerDay
      );

    if (totalDays < 0) {
      return {
        pregnancyWeek: 0,
        pregnancyDays: 0,
        trimester:
          "First Trimester",
      };
    }

    const pregnancyWeek =
      Math.floor(
        totalDays / 7
      );

    let trimester;

    if (
      pregnancyWeek <= 13
    ) {
      trimester =
        "First Trimester";
    } else if (
      pregnancyWeek <= 27
    ) {
      trimester =
        "Second Trimester";
    } else {
      trimester =
        "Third Trimester";
    }

    return {
      pregnancyWeek,

      pregnancyDays:
        totalDays % 7,

      trimester,
    };
  };

/* =========================================================
   COMPONENT
========================================================= */

const BabyDevelopment = () => {

  const [
    profile,
    setProfile
  ] = useState(null);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  /* =======================================================
     FETCH PROFILE
  ======================================================= */

  const fetchProfile =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await API.get(
              "/profile/me",
              {
                withCredentials: true,
              }
            );

          const data =
            response.data;

          console.log(
            "BABY DEVELOPMENT PROFILE:",
            data
          );

          setProfile(
            data
          );

        } catch (err) {
          console.error(
            "BabyDevelopment Error:",
            err
          );

          if (
            err.response
              ?.status === 401
          ) {
            setError(
              "Your login session has expired. Please login again."
            );
          } else {
            setError(
              err.response
                ?.data?.message ||
                err.message ||
                "Unable to load pregnancy information."
            );
          }
        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );

  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /* =======================================================
     DAY CHANGE DETECTOR
  ======================================================= */

  const [
    todayKey,
    setTodayKey
  ] = useState(
    () =>
      getToday().toDateString()
  );

  useEffect(() => {
    const interval =
      setInterval(() => {
        const currentDay =
          getToday().toDateString();

        setTodayKey(
          (previousDay) =>
            previousDay ===
            currentDay
              ? previousDay
              : currentDay
        );
      }, 60 * 1000);

    return () => {
      clearInterval(
        interval
      );
    };
  }, []);

  /* =======================================================
     PREGNANCY PROFILE
  ======================================================= */

  const pregnancy =
    useMemo(() => {
      if (!profile) {
        return {};
      }

      return (
        profile.pregnancyProfile ||
        profile.pregnancy ||
        {}
      );
    }, [profile]);

  /* =======================================================
     CURRENT PREGNANCY AGE
  ======================================================= */

  const currentPregnancy =
    useMemo(() => {
      /*
        todayKey makes this calculation
        refresh when the calendar date changes.
      */

      return calculateCurrentPregnancy(
        pregnancy
      );
    }, [
      pregnancy,
      todayKey,
    ]);

  /* =======================================================
     PREGNANCY WEEK
  ======================================================= */

  const pregnancyWeek =
    currentPregnancy.pregnancyWeek;

  /* =======================================================
     TRIMESTER
  ======================================================= */

  const trimester =
    currentPregnancy.trimester;

  /* =======================================================
     BABY SIZE
  ======================================================= */

  const babyInfo =
    useMemo(() => {

      if (
        pregnancyWeek === null ||
        pregnancyWeek === undefined
      ) {
        return {
          fruit: "🌱",
          size: "Your baby",
          description:
            "Your baby's development information will appear here.",
        };
      }

      if (
        pregnancyWeek <= 4
      ) {
        return {
          fruit: "🌱",
          size: "A tiny seed",
          description:
            "Your baby's development is just beginning.",
        };
      }

      if (
        pregnancyWeek <= 7
      ) {
        return {
          fruit: "🫐",
          size: "A blueberry",
          description:
            "Your baby is growing rapidly and important organs are beginning to develop.",
        };
      }

      if (
        pregnancyWeek <= 10
      ) {
        return {
          fruit: "🍓",
          size: "A strawberry",
          description:
            "Your baby's basic body structures are developing quickly.",
        };
      }

      if (
        pregnancyWeek <= 13
      ) {
        return {
          fruit: "🍋",
          size: "A lemon",
          description:
            "Your baby is becoming more active as muscles and organs continue developing.",
        };
      }

      if (
        pregnancyWeek <= 16
      ) {
        return {
          fruit: "🥑",
          size: "An avocado",
          description:
            "Your baby's facial features and movements are becoming more developed.",
        };
      }

      if (
        pregnancyWeek <= 20
      ) {
        return {
          fruit: "🍌",
          size: "A banana",
          description:
            "Your baby's senses are developing and movements may become easier to notice.",
        };
      }

      if (
        pregnancyWeek <= 24
      ) {
        return {
          fruit: "🌽",
          size: "An ear of corn",
          description:
            "Your baby's hearing and other senses are continuing to develop.",
        };
      }

      if (
        pregnancyWeek <= 27
      ) {
        return {
          fruit: "🥦",
          size: "A broccoli head",
          description:
            "Your baby is growing stronger and gaining more body fat.",
        };
      }

      if (
        pregnancyWeek <= 30
      ) {
        return {
          fruit: "🍆",
          size: "An eggplant",
          description:
            "Your baby's brain and nervous system are developing rapidly.",
        };
      }

      if (
        pregnancyWeek <= 33
      ) {
        return {
          fruit: "🥥",
          size: "A coconut",
          description:
            "Your baby continues gaining weight and preparing for birth.",
        };
      }

      if (
        pregnancyWeek <= 36
      ) {
        return {
          fruit: "🍈",
          size: "A honeydew melon",
          description:
            "Your baby's lungs and other organs continue maturing.",
        };
      }

      if (
        pregnancyWeek <= 39
      ) {
        return {
          fruit: "🍉",
          size: "A small watermelon",
          description:
            "Your baby is getting ready for birth and continues gaining weight.",
        };
      }

      return {
        fruit: "🍉",
        size: "A watermelon",
        description:
          "Your baby is fully developed and preparing for birth.",
      };

    }, [
      pregnancyWeek,
    ]);

  /* =======================================================
     DUE DATE
  ======================================================= */

  const dueDate =
    pregnancy.dueDate ||
    profile?.dueDate ||
    "Not available";

  /* =======================================================
     PREGNANCY TYPE
  ======================================================= */

  const pregnancyType =
    pregnancy.pregnancyType ||
    "Not available";

  /* =======================================================
     BABY COUNT
  ======================================================= */

  const babyCount =
    pregnancy.babyCount ??
    (
      pregnancy.multiplePregnancy
        ? 2
        : 1
    );

  /* =======================================================
     LMP
  ======================================================= */

  const lastMenstrualPeriod =
    pregnancy.lastMenstrualPeriod ||
    "Not available";

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="baby-development-page">

        <div className="baby-loading">

          <div className="loading-spinner"></div>

          <h3>
            Loading baby's development...
          </h3>

          <p>
            Please wait a moment.
          </p>

        </div>

      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="baby-development-page">

        <div className="baby-error">

          <div className="error-icon">
            ⚠️
          </div>

          <h3>
            Unable to load information
          </h3>

          <p>
            {error}
          </p>

          <button
            onClick={
              fetchProfile
            }
            className="retry-button"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="baby-development-page">

      {/* HEADER */}

      <div className="baby-page-header">

        <div>

          <h1>
            👶 Baby Development
          </h1>

          <p>
            Follow your baby's beautiful journey week by week.
          </p>

        </div>

      </div>

      {/* MAIN BABY CARD */}

      <div className="baby-main-card">

        <div className="baby-emoji-container">

          <div className="baby-fruit">
            {babyInfo.fruit}
          </div>

        </div>

        <div className="baby-main-content">

          <span className="week-badge">

            {pregnancyWeek !== null &&
            pregnancyWeek !==
              undefined
              ? `Week ${pregnancyWeek}`
              : "Pregnancy Week"}

          </span>

          <h2>
            Your baby is about the size of{" "}
            {babyInfo.size.toLowerCase()}
          </h2>

          <p>
            {babyInfo.description}
          </p>

        </div>

      </div>

      {/* =================================================
          PREGNANCY INFORMATION
      ================================================= */}

      <div className="pregnancy-info-grid">

        <div className="pregnancy-info-card">

          <div className="info-card-icon">
            📅
          </div>

          <div>

            <span>
              Pregnancy Week
            </span>

            <strong>

              {pregnancyWeek !==
                null &&
              pregnancyWeek !==
                undefined
                ? `Week ${pregnancyWeek}`
                : "Not available"}

            </strong>

          </div>

        </div>

        <div className="pregnancy-info-card">

          <div className="info-card-icon">
            🌸
          </div>

          <div>

            <span>
              Trimester
            </span>

            <strong>
              {trimester}
            </strong>

          </div>

        </div>

        <div className="pregnancy-info-card">

          <div className="info-card-icon">
            👶
          </div>

          <div>

            <span>
              Baby Count
            </span>

            <strong>
              {babyCount}
            </strong>

          </div>

        </div>

        <div className="pregnancy-info-card">

          <div className="info-card-icon">
            🗓️
          </div>

          <div>

            <span>
              Due Date
            </span>

            <strong>
              {dueDate}
            </strong>

          </div>

        </div>

      </div>

      {/* =================================================
          DEVELOPMENT SECTION
      ================================================= */}

      <div className="development-section">

        <div className="section-header">

          <h2>
            🌱 This Week's Development
          </h2>

          <span>
            Week{" "}
            {pregnancyWeek ??
              "--"}
          </span>

        </div>

        <div className="development-content">

          <div className="development-icon">
            {babyInfo.fruit}
          </div>

          <div>

            <h3>
              Growing beautifully
            </h3>

            <p>
              {babyInfo.description}
            </p>

          </div>

        </div>

      </div>

      {/* =================================================
          PREGNANCY DETAILS
      ================================================= */}

      <div className="pregnancy-details">

        <div className="section-header">

          <h2>
            💗 Pregnancy Details
          </h2>

        </div>

        <div className="details-grid">

          <div className="detail-item">

            <span>
              Last Menstrual Period
            </span>

            <strong>
              {lastMenstrualPeriod}
            </strong>

          </div>

          <div className="detail-item">

            <span>
              Pregnancy Type
            </span>

            <strong>
              {pregnancyType}
            </strong>

          </div>

          <div className="detail-item">

            <span>
              First Pregnancy
            </span>

            <strong>
              {pregnancy.firstPregnancy
                ? "Yes"
                : "No"}
            </strong>

          </div>

          <div className="detail-item">

            <span>
              High Risk
            </span>

            <strong>
              {pregnancy.highRisk
                ? "Yes"
                : "No"}
            </strong>

          </div>

        </div>

      </div>

      {/* =================================================
          HEALTH NOTE
      ================================================= */}

      <div className="baby-health-note">

        <div className="health-note-icon">
          💕
        </div>

        <div>

          <h3>
            Take care of yourself
          </h3>

          <p>
            Every pregnancy is unique. Follow your
            healthcare provider's advice and attend
            your regular prenatal appointments.
          </p>

        </div>

      </div>

    </div>
  );
};

export default BabyDevelopment;