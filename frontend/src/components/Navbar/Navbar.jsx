
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaChevronDown,
  FaTimes,
  FaUserMd,
  FaAmbulance,
} from "react-icons/fa";

import Sidebar from "../sidebar/Sidebar";
import "./Navbar.css";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/ai-assistant": "AI Assistant",
  "/profile": "Pregnancy Profile",
  "/pregnancy-profile": "Pregnancy Profile",
  "/nutrition": "Nutrition",
  "/medicine": "Medicine",
  "/appointment": "Appointments",
  "/appointments": "Appointments",
  "/report": "Reports",
  "/reports": "Reports",
  "/my-family": "Family Dashboard",
  "/family-dashboard": "Family Dashboard",
  "/settings": "Settings",
  "/doctor": "Find a Doctor",
  "/emergency": "Emergency",
};

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");

  const notificationButtonRef = useRef(null);
  const notificationPanelRef = useRef(null);
  const profileButtonRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const userId = localStorage.getItem("userId");
  const fullName = localStorage.getItem("fullName") || "User";
  const role = localStorage.getItem("role") || "Mother";

  const formattedRole =
    role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

  const pageTitle = pageTitles[location.pathname] || "NURTURE AI";

  const unreadCount = notifications.filter(
    (item) => item.read === false
  ).length;

  useEffect(() => {
    function handleOutsideClick(event) {
      const target = event.target;

      if (
        notificationButtonRef.current?.contains(target) ||
        notificationPanelRef.current?.contains(target)
      ) {
        return;
      }

      setIsNotificationsOpen(false);

      if (
        profileButtonRef.current?.contains(target) ||
        profileDropdownRef.current?.contains(target)
      ) {
        return;
      }

      setIsProfileOpen(false);
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!isNotificationsOpen) return undefined;

    if (!userId) {
      setNotifications([]);
      setNotificationError("Please log in to view notifications.");
      return undefined;
    }

    const controller = new AbortController();

    async function loadNotifications() {
      setIsLoadingNotifications(true);
      setNotificationError("");

      try {
        const response = await fetch(
          `/api/notifications/history/${encodeURIComponent(userId)}`,
          {
            headers: { Accept: "application/json" },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Notification history API was not found."
              : "Unable to load notifications."
          );
        }

        const data = await response.json();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.content)
            ? data.content
            : [];

        setNotifications(
          list.map((item) => ({
            ...item,
            read: item.read ?? item.isRead ?? item.is_read ?? true,
          }))
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          setNotificationError(
            error.message || "Unable to load notifications."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingNotifications(false);
        }
      }
    }

    loadNotifications();

    return () => controller.abort();
  }, [isNotificationsOpen, userId]);

  function toggleNotifications() {
    setIsNotificationsOpen((previous) => !previous);
    setIsProfileOpen(false);
  }

  function toggleProfile() {
    setIsProfileOpen((previous) => !previous);
    setIsNotificationsOpen(false);
  }

  function openDoctorPage() {
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
    navigate("/doctor");
  }

  function openEmergencyPage() {
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
    navigate("/emergency");
  }

  function handleLogout() {
    localStorage.clear();
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
    navigate("/login", { replace: true });
  }

  function formatNotificationDate(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const notificationMenu =
    isNotificationsOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="navbar-notification-panel navbar-floating-menu"
            ref={notificationPanelRef}
            role="dialog"
            aria-label="Notifications"
          >
            <div className="navbar-panel-header">
              <div>
                <h3>Notifications</h3>
                <p>
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${
                        unreadCount === 1 ? "" : "s"
                      }`
                    : "You're all caught up"}
                </p>
              </div>

              <button
                type="button"
                className="navbar-panel-close"
                onClick={() => setIsNotificationsOpen(false)}
                aria-label="Close notifications"
              >
                <FaTimes />
              </button>
            </div>

            <div className="navbar-notification-list">
              {isLoadingNotifications ? (
                <div className="navbar-notification-state">
                  Loading notifications...
                </div>
              ) : notificationError ? (
                <div className="navbar-notification-state navbar-error">
                  {notificationError}
                </div>
              ) : notifications.length === 0 ? (
                <div className="navbar-notification-state">
                  <FaBell className="navbar-empty-bell" />
                  <p>No notifications yet</p>
                  <span>
                    Medicine and appointment reminders will appear here
                    when they are saved by the backend.
                  </span>
                </div>
              ) : (
                notifications.map((item, index) => (
                  <div
                    className={`navbar-notification-item ${
                      !item.read ? "unread" : ""
                    }`}
                    key={item.id ?? `notification-${index}`}
                  >
                    <span className="navbar-notification-dot" />

                    <div className="navbar-notification-content">
                      <h4>
                        {item.title ||
                          item.notificationType ||
                          item.notification_type ||
                          "Notification"}
                      </h4>

                      <p>
                        {item.body ||
                          item.message ||
                          "You have a new notification."}
                      </p>

                      <span className="navbar-notification-date">
                        {formatNotificationDate(
                          item.sentAt ||
                            item.sent_at ||
                            item.createdAt
                        )}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  const profileMenu =
    isProfileOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="navbar-profile-dropdown navbar-floating-menu"
            ref={profileDropdownRef}
            role="menu"
            aria-label="Profile menu"
          >
            <div className="navbar-dropdown-user">
              <FaUserCircle />

              <div>
                <strong>{fullName}</strong>
                <span>{formattedRole}</span>
              </div>
            </div>

            <div className="navbar-dropdown-divider" />

            <button
              type="button"
              className="navbar-logout-btn"
              onClick={handleLogout}
              role="menuitem"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <header className="navbar">
        <div className="navbar-left">
          <button
            type="button"
            className="navbar-menu-btn"
            onClick={() => setIsSidebarOpen((previous) => !previous)}
            aria-label="Toggle sidebar"
            aria-expanded={isSidebarOpen}
          >
            <FaBars />
          </button>

          <h1 className="navbar-page-title">{pageTitle}</h1>
        </div>

        <div className="navbar-right">
          {/* Consult a Doctor */}
          <button
            type="button"
            className={`navbar-doctor-consult-btn ${
              location.pathname === "/doctor" ? "active" : ""
            }`}
            onClick={openDoctorPage}
            aria-label="Consult a doctor"
            title="Consult a Doctor"
          >
            <span className="navbar-doctor-icon-wrap">
              <FaUserMd />
            </span>

            <span className="navbar-doctor-label">
              Consult a Doctor
            </span>
          </button>

          {/* Emergency */}
          <button
            type="button"
            className={`navbar-emergency-btn ${
              location.pathname === "/emergency" ? "active" : ""
            }`}
            onClick={openEmergencyPage}
            aria-label="Open emergency contacts"
            title="Emergency"
          >
            <span className="navbar-emergency-icon-wrap">
              <FaAmbulance />
            </span>

            <span className="navbar-emergency-label">
              Emergency
            </span>
          </button>

          {/* Notifications */}
          <button
            ref={notificationButtonRef}
            type="button"
            className={`navbar-icon-btn ${
              isNotificationsOpen ? "active" : ""
            }`}
            onClick={toggleNotifications}
            aria-label="Notifications"
            aria-expanded={isNotificationsOpen}
          >
            <FaBell />

            {unreadCount > 0 && (
              <span className="navbar-notification-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            ref={profileButtonRef}
            type="button"
            className={`navbar-profile-btn ${
              isProfileOpen ? "active" : ""
            }`}
            onClick={toggleProfile}
            aria-label="Open profile menu"
            aria-expanded={isProfileOpen}
          >
            <FaUserCircle className="navbar-profile-icon" />

            <span className="navbar-profile-details">
              <span className="navbar-user-name">{fullName}</span>
              <span className="navbar-user-role">{formattedRole}</span>
            </span>

            <FaChevronDown className="navbar-profile-chevron" />
          </button>
        </div>
      </header>

      {notificationMenu}
      {profileMenu}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
}

export default Navbar;
