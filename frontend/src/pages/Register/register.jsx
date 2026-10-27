import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUserTag,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaHome,
} from "react-icons/fa";

import { FcGoogle } from "react-icons/fc";

import API from "../../services/api";

import "./register.css";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  // ==========================================
  // FORMAT OTP TIMER
  // ==========================================

  const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // OTP COUNTDOWN
  // ==========================================

  useEffect(() => {
    let interval;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timer]);

  // ==========================================
  // SEND OTP
  // ==========================================

  const handleSendOtp = async () => {
    const email = formData.email.trim();

    if (!email) {
      alert("Please enter your email.");
      return;
    }

    // Basic email validation
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setSendingOtp(true);

    try {
      console.log("==============================");
      console.log("SENDING OTP");
      console.log("EMAIL:", email);
      console.log("==============================");

      const response = await API.post(
        "/auth/send-otp",
        {
          email: email,
        },
        {
          withCredentials: true,
        }
      );

      console.log("OTP API SUCCESS");
      console.log("STATUS:", response.status);
      console.log("DATA:", response.data);

      if (response.status === 200) {
        setOtpSent(true);

        // 5 minute countdown
        setTimer(300);

        alert("OTP sent successfully to your email.");
      }
    } catch (error) {
      console.error("==============================");
      console.error("OTP ERROR");
      console.error("MESSAGE:", error?.message);
      console.error("CODE:", error?.code);
      console.error(
        "STATUS:",
        error?.response?.status
      );
      console.error(
        "DATA:",
        error?.response?.data
      );
      console.error("==============================");

      if (error.response) {
        if (typeof error.response.data === "string") {
          alert(error.response.data);
        } else {
          alert(
            error.response.data?.message ||
              "Unable to send OTP."
          );
        }
      } else if (error.request) {
        alert(
          "Unable to connect to the server.\n\n" +
            "Please make sure Nurture AI and the backend server are running."
        );
      } else {
        alert(
          "Something went wrong while sending OTP."
        );
      }
    } finally {
      setSendingOtp(false);
    }
  };

  // ==========================================
  // REGISTER
  // ==========================================

  const handleRegister = async (e) => {
    e.preventDefault();

    // ------------------------------
    // Validation
    // ------------------------------

    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.role ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.otp.trim()
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (!otpSent) {
      alert(
        "Please verify your email with OTP first."
      );
      return;
    }

    if (formData.otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }

    if (formData.phoneNumber.length !== 10) {
      alert(
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      console.log("==============================");
      console.log("REGISTER REQUEST");
      console.log("==============================");

      const requestData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        role: formData.role,
        password: formData.password,
        otp: formData.otp.trim(),
      };

      console.log("Request:", requestData);

      const response = await API.post(
        "/auth/register",
        requestData,
        {
          withCredentials: true,
        }
      );

      console.log("REGISTER RESPONSE:");
      console.log(response.data);

      // ==========================================
      // REGISTRATION SUCCESS
      // ==========================================

      if (
        response.status === 200 &&
        response.data === "Registration Successful"
      ) {
        alert(
          "Account created successfully. Please login."
        );

        // Clear form
        setFormData({
          fullName: "",
          email: "",
          phoneNumber: "",
          role: "",
          password: "",
          confirmPassword: "",
          otp: "",
        });

        setOtpSent(false);
        setTimer(0);

        // Go to login
        navigate("/login");
      } else {
        alert(
          response.data ||
            "Registration failed."
        );
      }
    } catch (error) {
      console.error(
        "REGISTER ERROR:",
        error
      );

      if (error.response) {
        console.error(
          "STATUS:",
          error.response.status
        );

        console.error(
          "DATA:",
          error.response.data
        );

        if (
          typeof error.response.data ===
          "string"
        ) {
          alert(error.response.data);
        } else {
          alert(
            error.response.data?.message ||
              "Registration failed."
          );
        }
      } else if (error.request) {
        alert(
          "Unable to connect to the server.\n\n" +
            "Please make sure Nurture AI and the backend server are running."
        );
      } else {
        alert(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // PHONE NUMBER
  // ==========================================

  const handlePhoneChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 10);

    setFormData((prev) => ({
      ...prev,
      phoneNumber: value,
    }));
  };

  // ==========================================
  // OTP
  // ==========================================

  const handleOtpChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setFormData((prev) => ({
      ...prev,
      otp: value,
    }));
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="register-container">

      {/* ======================================
          HOME BUTTON
      ====================================== */}

      <Link to="/" className="home-btn">
        <FaHome />
      </Link>

      {/* ======================================
          LEFT SECTION
      ====================================== */}

      <div className="register-left">
        <div className="overlay">

          <h1>🤱 Nurture AI</h1>

          <h2>Create Your Account</h2>

          <p>
            Join thousands of mothers using
            AI-powered pregnancy tracking,
            personalized wellness insights,
            and family support throughout
            every stage of motherhood.
          </p>

        </div>
      </div>

      {/* ======================================
          RIGHT SECTION
      ====================================== */}

      <div className="register-right">

        <form
          className="register-form"
          onSubmit={handleRegister}
        >

          <h2>Register</h2>

          <p className="subtitle">
            Begin your pregnancy wellness journey.
          </p>

          {/* ==================================
              FULL NAME
          ================================== */}

          <div className="input-group">

            <label>Full Name</label>

            <div className="input-box">

              <FaUser className="input-icon" />

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />

            </div>

          </div>

          {/* ==================================
              EMAIL
          ================================== */}

          <div className="input-group">

            <label>Email Address</label>

            <div className="input-box">

              <FaEnvelope className="input-icon" />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />

              <button
                type="button"
                className="otp-btn"
                disabled={
                  sendingOtp || timer > 0
                }
                onClick={handleSendOtp}
              >

                {sendingOtp ? (
                  <span className="small-loader"></span>
                ) : timer > 0 ? (
                  formatTimer(timer)
                ) : otpSent ? (
                  "Resend OTP"
                ) : (
                  "Send OTP"
                )}

              </button>

            </div>

          </div>

          {/* ==================================
              OTP
          ================================== */}

          {otpSent && (
            <div className="input-group">

              <label>Email OTP</label>

              <div className="input-box">

                <FaShieldAlt className="input-icon" />

                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleOtpChange}
                  placeholder="Enter 6-digit OTP"
                  inputMode="numeric"
                  maxLength="6"
                  required
                />

              </div>

              <p className="otp-info">
                OTP has been sent to your email.
              </p>

            </div>
          )}

          {/* ==================================
              PHONE
          ================================== */}

          <div className="input-group">

            <label>Phone Number</label>

            <div className="input-box">

              <FaPhone className="input-icon" />

              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                placeholder="Enter phone number"
                inputMode="numeric"
                maxLength="10"
                required
              />

            </div>

          </div>

          {/* ==================================
              ROLE
          ================================== */}

          <div className="input-group">

            <label>Role</label>

            <div className="input-box">

              <FaUserTag className="input-icon" />

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select Role
                </option>

                <option value="Mother">
                  Mother
                </option>

                <option value="Family Member">
                  Family Member
                </option>

              </select>

            </div>

          </div>

          {/* ==================================
              PASSWORD
          ================================== */}

          <div className="input-group">

            <label>Password</label>

            <div className="input-box">

              <FaLock className="input-icon" />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create Password"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="show-btn"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >

                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}

              </button>

            </div>

          </div>

          {/* ==================================
              CONFIRM PASSWORD
          ================================== */}

          <div className="input-group">

            <label>Confirm Password</label>

            <div className="input-box">

              <FaLock className="input-icon" />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                value={
                  formData.confirmPassword
                }
                onChange={handleChange}
                placeholder="Confirm Password"
                autoComplete="new-password"
                required
              />

            </div>

          </div>

          {/* ==================================
              TERMS
          ================================== */}

          <div className="terms">

            <label>

              <input
                type="checkbox"
                required
              />

              <span>
                I agree to{" "}
                <a href="/terms">
                  Terms & Conditions
                </a>
              </span>

            </label>

          </div>

          {/* ==================================
              REGISTER BUTTON
          ================================== */}

          <button
            className="register-btn"
            type="submit"
            disabled={
              loading || !otpSent
            }
          >

            {loading ? (
              <>
                <span className="button-loader"></span>
                Creating Account...
              </>
            ) : (
              "Verify OTP & Create Account"
            )}

          </button>

          {!otpSent && (
            <p className="otp-required">
              Please verify your email with OTP
              before creating your account.
            </p>
          )}

          {/* ==================================
              GOOGLE
          ================================== */}

          <div className="divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="google-btn"
          >

            <FcGoogle className="google-icon" />

            <span>
              Continue with Google
            </span>

          </button>

          {/* ==================================
              LOGIN
          ================================== */}

          <p className="login-link">

            Already have an account?

            <Link to="/login">
              {" "}
              Login
            </Link>

          </p>

          {/* ==================================
              QUOTE
          ================================== */}

          <p className="quote">
            ❤️ Every mother deserves
            personalized care because every
            pregnancy is unique.
          </p>

        </form>

      </div>

    </div>
  );
}

export default Register;