
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
  FaHeart,
  FaBaby,
  FaCheckCircle,
  FaArrowRight,
  FaLeaf,
  FaStar,
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

  const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // A new email needs a fresh OTP.
    if (name === "email") {
      setOtpSent(false);
      setTimer(0);
      setFormData((prev) => ({
        ...prev,
        email: value,
        otp: "",
      }));
    }
  };

  useEffect(() => {
    if (timer <= 0) return undefined;

    const interval = setInterval(() => {
      setTimer((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // SEND OTP
  const handleSendOtp = async () => {
    const email = formData.email.trim();

    if (!email) {
      alert("Please enter your email.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setSendingOtp(true);

    try {
      const response = await API.post(
        "/auth/send-otp",
        { email },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setOtpSent(true);
        setTimer(300);

        setFormData((prev) => ({
          ...prev,
          otp: "",
        }));

        alert("OTP sent successfully to your email.");
      }
    } catch (error) {
      console.error("OTP ERROR:", error);

      if (error.response) {
        const data = error.response.data;

        alert(
          typeof data === "string"
            ? data
            : data?.message || "Unable to send OTP."
        );
      } else if (error.request) {
        alert(
          "Unable to connect to the server. Please try again."
        );
      } else {
        alert("Something went wrong while sending OTP.");
      }
    } finally {
      setSendingOtp(false);
    }
  };

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();

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
      alert("Please verify your email with OTP first.");
      return;
    }

    if (formData.otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }

    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        role: formData.role,
        password: formData.password,
        otp: formData.otp.trim(),
      };

      const response = await API.post(
        "/auth/register",
        requestData,
        { withCredentials: true }
      );

      if (
        response.status === 200 &&
        response.data === "Registration Successful"
      ) {
        alert("Account created successfully. Please login.");

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

        navigate("/login");
      } else {
        alert(
          typeof response.data === "string"
            ? response.data
            : response.data?.message || "Registration failed."
        );
      }
    } catch (error) {
      console.error("REGISTER ERROR:", error);

      if (error.response) {
        const data = error.response.data;

        alert(
          typeof data === "string"
            ? data
            : data?.message || "Registration failed."
        );
      } else if (error.request) {
        alert(
          "Unable to connect to the server. Please try again."
        );
      } else {
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);

    setFormData((prev) => ({
      ...prev,
      phoneNumber: value,
    }));
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);

    setFormData((prev) => ({
      ...prev,
      otp: value,
    }));
  };

  return (
    <div className="register-container">
      <Link to="/" className="home-btn" aria-label="Go to home">
        <FaHome />
      </Link>

      {/* LEFT: BRANDING AND MOTHERHOOD ILLUSTRATION */}
      <aside className="register-left">
        <div className="left-orb orb-one" />
        <div className="left-orb orb-two" />
        <div className="left-orb orb-three" />

        <div className="overlay">
          <div className="brand-mark">
            <span className="brand-icon">
              <FaHeart />
            </span>
            <span>Nurture <strong>AI</strong></span>
            <span className="brand-sparkle">✦</span>
          </div>

          <div className="hero-copy">
            <span className="hero-eyebrow">
              <FaLeaf /> YOUR JOURNEY, OUR CARE
            </span>

            <h1>
              A little care.
              <br />
              <span>A lifetime of love.</span>
            </h1>

            <p>
              Your motherhood journey deserves gentle guidance,
              personalized wellness, and a caring family by your side.
            </p>
          </div>

          <div className="mother-art" aria-label="Mother and baby illustration">
            <div className="art-halo" />

            <span className="art-heart heart-one">♥</span>
            <span className="art-heart heart-two">✦</span>
            <span className="art-heart heart-three">♡</span>
            <span className="art-heart heart-four">✧</span>

            <div className="art-plant plant-left">
              <FaLeaf />
              <FaLeaf />
              <FaLeaf />
            </div>

            <div className="mother-illustration">
              <div className="mother-hair" />
              <div className="mother-face">
                <span className="face-eye eye-left" />
                <span className="face-eye eye-right" />
                <span className="face-smile" />
                <span className="face-blush blush-left" />
                <span className="face-blush blush-right" />
              </div>
              <div className="mother-neck" />
              <div className="mother-body" />
              <div className="mother-arm" />
              <div className="baby-wrap">
                <div className="baby-head">
                  <span />
                </div>
                <div className="baby-body" />
              </div>
              <div className="mother-hand" />
            </div>

            <div className="art-caption">
              <span className="caption-heart"><FaHeart /></span>
              <div>
                <strong>Growing with love</strong>
                <small>Every little moment matters</small>
              </div>
            </div>
          </div>

          <div className="care-points">
            <div>
              <span className="care-point-icon"><FaShieldAlt /></span>
              <span>
                <strong>Private & secure</strong>
                <small>Your journey matters</small>
              </span>
            </div>

            <div>
              <span className="care-point-icon"><FaBaby /></span>
              <span>
                <strong>Personalized care</strong>
                <small>Support at every step</small>
              </span>
            </div>
          </div>

          <div className="left-footer">
            <span>Made with love for every mother</span>
            <span className="footer-hearts">♥ ♥ ♥</span>
          </div>
        </div>
      </aside>

      {/* RIGHT: REGISTRATION FORM */}
      <main className="register-right">
        <div className="mobile-brand">
          <span className="mobile-brand-icon"><FaHeart /></span>
          <span>Nurture <strong>AI</strong></span>
          <span className="mobile-brand-emoji">🤱</span>
        </div>

        <form className="register-form" onSubmit={handleRegister}>
          <div className="form-heading">
            <span className="welcome-pill">
              <FaStar /> A beautiful journey begins here
            </span>

            <h2>Create your <span>account</span></h2>

            <p className="subtitle">
              Join Nurture AI for personalized pregnancy wellness
              and family support. 💗
            </p>
          </div>

          <div className="form-section-title">
            <span className="section-number">01</span>
            <span>Your details</span>
            <span className="section-line" />
          </div>

          {/* FULL NAME */}
          <div className="input-group">
            <label htmlFor="fullName">Full Name</label>
            <div className="input-box">
              <FaUser className="input-icon" />
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                maxLength={100}
                required
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-box">
              <FaEnvelope className="input-icon" />
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
              <button
                type="button"
                className="otp-btn"
                disabled={sendingOtp || timer > 0}
                onClick={handleSendOtp}
              >
                {sendingOtp ? (
                  <span className="small-loader" />
                ) : timer > 0 ? (
                  formatTimer(timer)
                ) : otpSent ? (
                  "Resend OTP"
                ) : (
                  "Send OTP"
                )}
              </button>
            </div>
            <p className="field-hint">
              <FaShieldAlt /> We'll use this email to verify your account.
            </p>
          </div>

          {/* OTP */}
          {otpSent && (
            <div className="input-group otp-group">
              <label htmlFor="otp">Email Verification Code</label>
              <div className="input-box">
                <FaShieldAlt className="input-icon" />
                <input
                  id="otp"
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleOtpChange}
                  placeholder="Enter 6-digit OTP"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                />
                <span className="verified-indicator">
                  <FaCheckCircle />
                </span>
              </div>
              <p className="otp-info">
                ✨ Enter the code sent to your email.
                {timer > 0 && ` Expires in ${formatTimer(timer)} on this form timer.`}
              </p>
            </div>
          )}

          {/* PHONE */}
          <div className="input-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <div className="input-box">
              <FaPhone className="input-icon" />
              <input
                id="phoneNumber"
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                placeholder="Enter 10-digit phone number"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
                pattern="[0-9]{10}"
                required
              />
            </div>
          </div>

          {/* ROLE */}
          <div className="input-group">
            <label htmlFor="role">I am registering as</label>
            <div className="input-box">
              <FaUserTag className="input-icon" />
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Choose your role</option>
                <option value="Mother">Mother 🤱</option>
                <option value="Family Member">Family Member 💗</option>
              </select>
            </div>
          </div>

          <div className="form-section-title password-section-title">
            <span className="section-number">02</span>
            <span>Protect your account</span>
            <span className="section-line" />
          </div>

          {/* PASSWORD */}
          <div className="input-group">
            <label htmlFor="password">Create Password</label>
            <div className="input-box">
              <FaLock className="input-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="show-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-box">
              <FaLock className="input-icon" />
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Enter your password again"
                autoComplete="new-password"
                required
              />
            </div>
            {formData.confirmPassword &&
              formData.password !== formData.confirmPassword && (
                <p className="password-mismatch">
                  Passwords do not match yet.
                </p>
              )}
          </div>

          {/* TERMS */}
          <div className="terms">
            <label>
              <input type="checkbox" required />
              <span>
                I agree to the <Link to="/terms">Terms & Conditions</Link>
                {" "}and understand that Nurture AI provides wellness
                information, not a substitute for professional medical care.
              </span>
            </label>
          </div>

          {/* REGISTER */}
          <button
            className="register-btn"
            type="submit"
            disabled={loading || !otpSent}
          >
            {loading ? (
              <>
                <span className="button-loader" />
                Creating your account...
              </>
            ) : (
              <>
                Verify & Create Account
                <FaArrowRight className="register-arrow" />
              </>
            )}
          </button>

          {!otpSent && (
            <p className="otp-required">
              <FaShieldAlt /> Please verify your email before creating
              your account.
            </p>
          )}

          {/* DIVIDER */}
          <div className="divider">
            <span>OR CONTINUE WITH</span>
          </div>

          {/* GOOGLE */}
          <button type="button" className="google-btn">
            <FcGoogle className="google-icon" />
            <span>Continue with Google</span>
          </button>

          <p className="login-link">
            Already part of our family?
            <Link to="/login"> Sign in <FaArrowRight /></Link>
          </p>

          <div className="quote">
            <span className="quote-heart">♡</span>
            <p>
              Every mother deserves personalized care,
              because every pregnancy is unique.
            </p>
            <span className="quote-emoji">🌷 💗 🌷</span>
          </div>

          <p className="form-bottom-note">
            <FaShieldAlt /> Your motherhood journey starts with care.
          </p>
        </form>
      </main>
    </div>
  );
}

export default Register;
