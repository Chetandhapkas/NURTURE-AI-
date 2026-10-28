import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import "./Profile.css";

import API from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";

/* =========================================================
   DATE HELPERS
========================================================= */

const parseDateInput = (value) => {
  if (!value) {
    return null;
  }

  const parts = value.split("-");

  if (parts.length !== 3) {
    return null;
  }

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

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

/* =========================================================
   GET TODAY
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
   CALCULATE CURRENT PREGNANCY
========================================================= */

const calculateCurrentPregnancy = (pregnancy) => {
  if (!pregnancy) {
    return pregnancy;
  }

  const lmpDate = parseDateInput(
    pregnancy.lastMenstrualPeriod
  );

  if (!lmpDate) {
    return pregnancy;
  }

  const today = getToday();
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  const totalDays = Math.floor(
    (today.getTime() - lmpDate.getTime()) /
      millisecondsPerDay
  );

  if (totalDays < 0) {
    return pregnancy;
  }

  const pregnancyWeek = Math.floor(totalDays / 7);

  let trimester;

  if (pregnancyWeek <= 13) {
    trimester = "First Trimester";
  } else if (pregnancyWeek <= 27) {
    trimester = "Second Trimester";
  } else {
    trimester = "Third Trimester";
  }

  return {
    ...pregnancy,
    pregnancyWeek,
    pregnancyDays: totalDays % 7,
    trimester,
  };
};

/* =========================================================
   PROFILE COMPONENT
========================================================= */

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* SIDEBAR */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* FETCH PROFILE */
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/profile/me", {
        withCredentials: true,
      });

      const data = response.data;

      console.log("=================================");
      console.log("PROFILE DATA FROM BACKEND");
      console.log(data);
      console.log("=================================");

      setUser(data);
    } catch (err) {
      console.error("Profile Error:", err);

      if (err.response?.status === 401) {
        setError(
          "Your login session has expired. Please login again."
        );
      } else if (err.response?.status === 404) {
        setError("Profile information was not found.");
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load profile information."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /* LOAD PROFILE */
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /* CURRENT PREGNANCY */
  const currentPregnancy = useMemo(() => {
    return calculateCurrentPregnancy(
      user?.pregnancyProfile
    );
  }, [user]);

  /* AUTOMATIC UPDATE WHILE PAGE IS OPEN */
  const [todayKey, setTodayKey] = useState(
    () => getToday().toDateString()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const currentDay = getToday().toDateString();

      setTodayKey((previousDay) =>
        previousDay === currentDay
          ? previousDay
          : currentDay
      );
    }, 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const livePregnancy = useMemo(() => {
    // todayKey forces recalculation when the calendar date changes.
    return calculateCurrentPregnancy(
      user?.pregnancyProfile
    );
  }, [user, todayKey]);

  /* LOADING */
  if (loading) {
    return (
      <div className="profile-page">
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        <div className="profile-main">
          <button
            type="button"
            className="profile-mobile-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>

          <div className="profile-loading">
            <div className="loader"></div>
            <h3>Loading Profile</h3>
            <p>
              Please wait while we load your information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ERROR */
  if (error) {
    return (
      <div className="profile-page">
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        <div className="profile-main">
          <button
            type="button"
            className="profile-mobile-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>

          <div className="profile-error">
            <div className="error-icon">!</div>
            <h3>Unable to Load Profile</h3>
            <p>{error}</p>
            <button
              className="retry-btn"
              type="button"
              onClick={fetchProfile}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* NO USER */
  if (!user) {
    return (
      <div className="profile-page">
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        <div className="profile-main">
          <button
            type="button"
            className="profile-mobile-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>

          <div className="profile-error">
            <div className="error-icon">!</div>
            <h3>Profile Not Found</h3>
            <p>We could not find your profile.</p>
            <button
              className="retry-btn"
              type="button"
              onClick={fetchProfile}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* USER INFORMATION */
  const fullName = user.fullName || "User";
  const email = user.email || "No email available";
  const mobile =
    user.mobile || user.phoneNumber || "Not provided";
  const role = user.role || "User";
  const userId = user.id || user.userId || "Not available";

  /* PREGNANCY PROFILE */
  const pregnancy =
    livePregnancy || currentPregnancy || null;

  /* PROFILE PAGE */
  return (
    <div className="profile-page">
      {/* SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* MAIN CONTENT */}
      <div className="profile-main">
        {/* MOBILE MENU */}
        <button
          type="button"
          className="profile-mobile-menu"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>

        {/* BACK BUTTON */}
        <button
          type="button"
          className="profile-back-button"
          onClick={() => navigate(-1)}
          aria-label="Go back to previous page"
        >
          <span className="profile-back-arrow" aria-hidden="true">
            ←
          </span>
          <span>Back</span>
        </button>

        {/* HEADER */}
        <div className="profile-header">
          <div>
            <span className="profile-page-label">
              NURTURE AI
            </span>
            <h1>My Profile</h1>
            <p>
              View and manage your personal information
            </p>
          </div>

          <button
            className="edit-profile-btn"
            type="button"
          >
            ✏️ Edit Profile
          </button>
        </div>

        {/* PROFILE OVERVIEW */}
        <div className="profile-overview">
          <div className="profile-avatar">
            {fullName.charAt(0).toUpperCase()}
          </div>

          <div className="profile-main-info">
            <h2>{fullName}</h2>
            <p className="profile-email">{email}</p>

            <div className="profile-badges">
              <span className="profile-role">{role}</span>
              <span className="profile-status">
                <span className="status-dot"></span>
                Active
              </span>
            </div>
          </div>
        </div>

        {/* PERSONAL INFORMATION */}
        <div className="profile-section">
          <div className="section-heading">
            <div className="section-icon">👤</div>
            <div>
              <h2>Personal Information</h2>
              <p>Your basic personal details</p>
            </div>
          </div>

          <div className="profile-grid">
            <ProfileItem label="Full Name" value={user.fullName} />
            <ProfileItem label="Email Address" value={user.email} />
            <ProfileItem label="Mobile Number" value={mobile} />
            <ProfileItem label="Role" value={user.role} />
          </div>
        </div>

        {/* ACCOUNT INFORMATION */}
        <div className="profile-section">
          <div className="section-heading">
            <div className="section-icon">🔐</div>
            <div>
              <h2>Account Information</h2>
              <p>Information related to your account</p>
            </div>
          </div>

          <div className="profile-grid">
            <ProfileItem label="User ID" value={userId} />
            <ProfileItem label="Account Role" value={role} />
            <ProfileItem label="Account Status" value="Active" />
            <ProfileItem label="Email Verification" value="Verified" />
          </div>
        </div>

        {/* PREGNANCY INFORMATION */}
        {pregnancy && (
          <div className="profile-section">
            <div className="section-heading">
              <div className="section-icon pregnancy-icon">
                ❤️
              </div>
              <div>
                <h2>Pregnancy Information</h2>
                <p>Your pregnancy profile details</p>
              </div>
            </div>

            {/* PREGNANCY DETAILS */}
            <div className="profile-subheading">
              <h3>Pregnancy Details</h3>
            </div>

            <div className="profile-grid">
              <ProfileItem label="Due Date" value={pregnancy.dueDate} />
              <ProfileItem
                label="Pregnancy Week"
                value={
                  pregnancy.pregnancyWeek !== null &&
                  pregnancy.pregnancyWeek !== undefined
                    ? `Week ${pregnancy.pregnancyWeek}`
                    : null
                }
              />
              <ProfileItem label="Trimester" value={pregnancy.trimester} />
              <ProfileItem
                label="Last Menstrual Period"
                value={pregnancy.lastMenstrualPeriod}
              />
              <ProfileItem
                label="Pregnancy Type"
                value={pregnancy.pregnancyType}
              />
              <ProfileItem label="Baby Count" value={pregnancy.babyCount} />
            </div>

            {/* PREGNANCY HISTORY */}
            <div className="profile-subheading">
              <h3>Pregnancy History</h3>
            </div>

            <div className="profile-grid">
              <ProfileItem
                label="First Pregnancy"
                value={formatBoolean(pregnancy.firstPregnancy)}
              />
              <ProfileItem
                label="Previous Pregnancies"
                value={pregnancy.previousPregnancies}
              />
              <ProfileItem
                label="Live Births"
                value={pregnancy.liveBirths}
              />
              <ProfileItem
                label="Miscarriages"
                value={pregnancy.miscarriages}
              />
            </div>

            {/* PREGNANCY RISK */}
            <div className="profile-subheading">
              <h3>Pregnancy Risk &amp; Medical Information</h3>
            </div>

            <div className="profile-grid">
              <ProfileItem
                label="High Risk Pregnancy"
                value={formatBoolean(pregnancy.highRisk)}
              />
              <ProfileItem
                label="IVF Pregnancy"
                value={formatBoolean(pregnancy.ivfPregnancy)}
              />
              <ProfileItem
                label="Multiple Pregnancy"
                value={formatBoolean(pregnancy.multiplePregnancy)}
              />
            </div>

            {/* DOCTOR NOTES */}
            <div className="doctor-notes">
              <div className="doctor-notes-header">
                <span className="doctor-notes-icon">🩺</span>
                <div>
                  <h3>Doctor Notes</h3>
                  <p>Medical notes saved by your doctor</p>
                </div>
              </div>

              <div className="doctor-notes-content">
                {pregnancy.doctorNotes
                  ? pregnancy.doctorNotes
                  : "No doctor notes available."}
              </div>
            </div>
          </div>
        )}

        {/* NO PREGNANCY PROFILE */}
        {!pregnancy && (
          <div className="profile-section">
            <div className="section-heading">
              <div className="section-icon pregnancy-icon">
                ❤️
              </div>
              <div>
                <h2>Pregnancy Information</h2>
                <p>Your pregnancy profile details</p>
              </div>
            </div>

            <div className="no-pregnancy">
              <div className="no-pregnancy-icon">📋</div>
              <h3>Pregnancy Profile Not Available</h3>
              <p>
                Your pregnancy information has not been added yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* FORMAT BOOLEAN VALUES */
function formatBoolean(value) {
  if (value === true) {
    return "Yes";
  }

  if (value === false) {
    return "No";
  }

  return null;
}

/* REUSABLE PROFILE ITEM */
function ProfileItem({ label, value }) {
  return (
    <div className="profile-item">
      <span className="profile-label">{label}</span>
      <span className="profile-value">
        {value !== null && value !== undefined && value !== ""
          ? value
          : "Not provided"}
      </span>
    </div>
  );
}

export default Profile;
