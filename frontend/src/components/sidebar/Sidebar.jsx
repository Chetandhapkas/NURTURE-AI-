import "./Sidebar.css";
import { useLocation, useNavigate } from "react-router-dom";

import {
  FaHome,
  FaRobot,
  FaUser,
  FaAppleAlt,
  FaPills,
  FaCalendarAlt,
  FaChartBar,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";

function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  // =========================================================
  // CHECK ACTIVE PAGE
  // =========================================================

  const isAppointmentPage =
    location.pathname === "/appointment" ||
    location.pathname === "/appointments" ||
    location.pathname === "/appointment-history" ||
    location.pathname.startsWith("/appointment/");


  // =========================================================
  // NAVIGATION
  // =========================================================

  const handleNavigation = (path) => {
    navigate(path);

    // Close sidebar on tablet/mobile
    if (window.innerWidth <= 1024 && setIsOpen) {
      setIsOpen(false);
    }
  };


  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    // Clear frontend session information
    localStorage.clear();

    if (setIsOpen) {
      setIsOpen(false);
    }

    navigate("/login");
  };


  // =========================================================
  // CLOSE SIDEBAR
  // =========================================================

  const closeSidebar = () => {
    if (setIsOpen) {
      setIsOpen(false);
    }
  };


  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
          ===================================================== */}

      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}


      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside
        className={`sidebar ${
          isOpen ? "sidebar-open" : ""
        }`}
      >

        {/* ===================================================
            CLOSE BUTTON
            =================================================== */}

        <button
          type="button"
          className="sidebar-close"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        >
          <FaTimes />
        </button>


        {/* ===================================================
            LOGO
            =================================================== */}

        <div className="logo">

          <h2>Nurture AI</h2>

          <p>
            Pregnancy Wellness
          </p>

        </div>


        {/* ===================================================
            MENU
            =================================================== */}

        <ul className="menu">

          {/* Dashboard */}

          <li
            className={
              location.pathname === "/dashboard"
                ? "active"
                : ""
            }
            onClick={() =>
              handleNavigation("/dashboard")
            }
          >
            <FaHome className="icon" />

            <span>
              Dashboard
            </span>
          </li>


          {/* AI Assistant */}

          <li
            className={
              location.pathname === "/ai-assistant"
                ? "active"
                : ""
            }
            onClick={() =>
              handleNavigation("/ai-assistant")
            }
          >
            <FaRobot className="icon" />

            <span>
              AI Assistant
            </span>
          </li>


          {/* Pregnancy Profile */}

          <li
            className={
              location.pathname === "/profile"
                ? "active"
                : ""
            }
            onClick={() =>
              handleNavigation("/profile")
            }
          >
            <FaUser className="icon" />

            <span>
              Pregnancy Profile
            </span>
          </li>


          {/* Nutrition */}

          <li
            className={
              location.pathname === "/nutrition"
                ? "active"
                : ""
            }
            onClick={() =>
              handleNavigation("/nutrition")
            }
          >
            <FaAppleAlt className="icon" />

            <span>
              Nutrition
            </span>
          </li>


          {/* Medicine */}

          <li
            className={
              location.pathname === "/medicine"
                ? "active"
                : ""
            }
            onClick={() =>
              handleNavigation("/medicine")
            }
          >
            <FaPills className="icon" />

            <span>
              Medicine
            </span>
          </li>


          {/* Appointments */}

          <li
            className={
              isAppointmentPage
                ? "active"
                : ""
            }
            onClick={() =>
              handleNavigation("/appointment")
            }
          >
            <FaCalendarAlt className="icon" />

            <span>
              Appointments
            </span>
          </li>


          {/* Reports */}

          <li
            className={
              location.pathname === "/report" 
                ? "active"
                : ""
            }
            onClick={() =>
              handleNavigation("/report")
            }
          >
            <FaChartBar className="icon" />

            <span>
              Reports
            </span>
          </li>


          {/* My Family - Mother */}

            <li
              className={
                  location.pathname === "/my-family"
                  ? "active"
                  : ""
              }
              onClick={() => handleNavigation("/my-family")}
                >
                <FaUsers className="icon" />

                <span>
                     My Family
                </span>
            </li>


          {/* Settings */}

          <li
            className={
              location.pathname === "/settings"
                ? "active"
                : ""
            }
            onClick={() =>
              handleNavigation("/settings")
            }
          >
            <FaCog className="icon" />

            <span>
              Settings
            </span>
          </li>

        </ul>


        {/* ===================================================
            LOGOUT
            =================================================== */}

        <div
          className="logout"
          onClick={handleLogout}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              handleLogout();
            }
          }}
        >
          <FaSignOutAlt className="icon" />

          <span>
            Logout
          </span>
        </div>

      </aside>
    </>
  );
}

export default Sidebar;