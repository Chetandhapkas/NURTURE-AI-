
import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// =============================================================
// AUTH
// =============================================================

import Login from "./pages/Login/login.jsx";
import Register from "./pages/Register/register.jsx";

// =============================================================
// MOTHER DASHBOARD
// =============================================================

import Dashboard from "./pages/Dashboard/dashboard.jsx";

// =============================================================
// COMMON COMPONENTS
// =============================================================

import Navbar from "./components/Navbar/Navbar.jsx";
import Sidebar from "./components/sidebar/Sidebar.jsx";

// =============================================================
// WELCOME
// =============================================================

import Welcome from "./pages/Welcome page/welcome.jsx";

// =============================================================
// DOCTOR CONSULTATION
// =============================================================

import Doctor from "./pages/Doctor/Doctor.jsx";

// =============================================================
// EMERGENCY
// =============================================================

import Emergency from "./pages/Emergency/Emergency.jsx";

// =============================================================
// MOTHER FORMS
// =============================================================

import PersonalInfo from "./pages/Form/PersonalInfo/personalInfo.jsx";
import PregnancyDetails from "./pages/Form/PregnancyDetails/PregnancyDetails.jsx";
import MedicalHistory from "./pages/Form/MedicalHistory/MedicalHistory.jsx";

// =============================================================
// APPOINTMENTS
// =============================================================

import Appointment from "./pages/Appointment/Appointment.jsx";
import AppointmentHistory from "./pages/Appointment/AppointmentHistory.jsx";

// =============================================================
// PROFILE
// =============================================================

import Profile from "./pages/Profile/Profile.jsx";

// =============================================================
// BABY DEVELOPMENT
// =============================================================

import BabyDevelopment from "./components/WelcomeCard/BabyDevelopment.jsx";

// =============================================================
// FAMILY MEMBER
// =============================================================

import FamilyForm from "./pages/FamilyForm/FForm.jsx";
import FamilyFormDetails from "./pages/FamilyForm/FForm1.jsx";
import FamilyDashboard from "./pages/FamilyDashboard/familyDashboard.jsx";
import MotherFamilyDashboard from "./pages/MotherFamilyDashboard/MotherFamilyDashboard.jsx";

// =============================================================
// HEALTH TRACKING
// =============================================================

import HealthTracking from "./pages/HealthTracking/HealthTracking.jsx";
import Report from "./pages/Report/Report.jsx";

// =============================================================
// AI ASSISTANT
// =============================================================

import Assistant from "./pages/AIAssistant/Assistant.jsx";

// =============================================================
// MEDICINE & VACCINATION
// =============================================================

import Healthcare from "./pages/MedicineVaccination/HealthCare.jsx";

// =============================================================
// PROTECTED ROUTE
// =============================================================

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";

// =============================================================
// NUTRITION
// =============================================================

import Nutrition from "./pages/Nutrition/Nutrition.jsx";

// =============================================================
// SETTINGS
// =============================================================

import Settings from "./pages/Settings/Settings.jsx";

// =============================================================
// FORGOT & RESET PASSWORD
// =============================================================

import ForgotPassword from "./pages/ForgotPassword/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword/ResetPassword.jsx";

// =============================================================
// PRESCRIPTION GALLERY
// =============================================================

import PrescriptionGallery from "./pages/PrescriptionGallery/PrescriptionGallery";

// =============================================================
// APP
// =============================================================

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* WELCOME */}

        <Route
          path="/"
          element={<Welcome />}
        />

        {/* AUTHENTICATION */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* MOTHER DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* COMMON COMPONENTS */}

        <Route
          path="/navbar"
          element={
            <ProtectedRoute allowedRoles={["mother", "family member"]}>
              <Navbar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sidebar"
          element={
            <ProtectedRoute allowedRoles={["mother", "family member"]}>
              <Sidebar />
            </ProtectedRoute>
          }
        />

        {/* DOCTOR CONSULTATION — ONLY MOTHER */}

        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <Doctor />
            </ProtectedRoute>
          }
        />

        {/* EMERGENCY — ONLY MOTHER */}

        <Route
          path="/emergency"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <Emergency />
            </ProtectedRoute>
          }
        />

        {/* NUTRITION ANALYZER — ONLY MOTHER */}

        <Route
          path="/nutrition"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <Nutrition />
            </ProtectedRoute>
          }
        />

        {/* AI ASSISTANT — ONLY MOTHER */}

        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <Assistant />
            </ProtectedRoute>
          }
        />

        {/* MOTHER FAMILY DASHBOARD */}

        <Route
          path="/my-family"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <MotherFamilyDashboard />
            </ProtectedRoute>
          }
        />

        {/* MEDICINE & VACCINATION */}

        <Route
          path="/medicine"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <Healthcare />
            </ProtectedRoute>
          }
        />

        {/* PERSONAL INFORMATION */}

        <Route
          path="/personal-info"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <PersonalInfo />
            </ProtectedRoute>
          }
        />

        {/* PREGNANCY DETAILS */}

        <Route
          path="/pregnancy-details"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <PregnancyDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pregnancy-profile"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <PregnancyDetails />
            </ProtectedRoute>
          }
        />

        {/* PRESCRIPTION GALLERY */}

        <Route
          path="/prescriptions"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <PrescriptionGallery />
            </ProtectedRoute>
          }
        />

        {/* MEDICAL HISTORY */}

        <Route
          path="/medical-history"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <MedicalHistory />
            </ProtectedRoute>
          }
        />

        {/* APPOINTMENTS */}

        <Route
          path="/appointment"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <Appointment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointment-history"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <AppointmentHistory />
            </ProtectedRoute>
          }
        />

        {/* PROFILE */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* BABY DEVELOPMENT */}

        <Route
          path="/baby-development"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <BabyDevelopment />
            </ProtectedRoute>
          }
        />

        {/* HEALTH TRACKING */}

        <Route
          path="/health-tracking"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <HealthTracking />
            </ProtectedRoute>
          }
        />

        {/* REPORT */}

        <Route
          path="/report"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <Report />
            </ProtectedRoute>
          }
        />

        {/* FAMILY MEMBER FORM */}

        <Route
          path="/family-form"
          element={
            <ProtectedRoute allowedRoles={["family member"]}>
              <FamilyForm />
            </ProtectedRoute>
          }
        />

        {/* FAMILY MEMBER DETAILS */}

        <Route
          path="/family-form-details"
          element={
            <ProtectedRoute allowedRoles={["family member"]}>
              <FamilyFormDetails />
            </ProtectedRoute>
          }
        />

        {/* SETTINGS — MOTHER & FAMILY MEMBER */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["mother", "family member"]}>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* FAMILY DASHBOARD */}

        <Route
          path="/family-dashboard"
          element={
            <ProtectedRoute allowedRoles={["family member"]}>
              <FamilyDashboard />
            </ProtectedRoute>
          }
        />

        {/* FORGOT & RESET PASSWORD */}

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* UNKNOWN ROUTE */}

        <Route
          path="*"
          element={<RoleBasedHome />}
        />
      </Routes>
    </BrowserRouter>
  );
}

// =============================================================
// ROLE BASED HOME
// =============================================================

function RoleBasedHome() {
  const userId = sessionStorage.getItem("userId");

  const role = String(
    sessionStorage.getItem("role") || ""
  )
    .trim()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ");

  // NOT LOGGED IN

  if (
    !userId ||
    userId === "null" ||
    userId === "undefined"
  ) {
    return <Welcome />;
  }

  // FAMILY MEMBER

  if (role === "family member") {
    return (
      <Navigate
        to="/family-dashboard"
        replace
      />
    );
  }

  // MOTHER

  if (role === "mother") {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  // UNKNOWN ROLE

  return (
    <Navigate
      to="/login"
      replace
    />
  );
}

// =============================================================
// EXPORT
// =============================================================

export default App;
