import { useNavigate } from "react-router-dom";
import "./welcome.css";

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-page">
    {/* ================= NAVBAR ================= */}
<nav className="navbar">

  {/* LEFT SIDE - LOGO + WEBSITE NAME */}
  <div
    className="brand"
    onClick={() => navigate("/")}
  >
    <div className="brand-logo">
  <img
    src="\Image\nurturelogo-removebg-preview.png"
    alt="Nurture AI Logo"
  />
</div>
    <div className="brand-name-wrapper">
      <span className="brand-name">Nurture</span>
      <span className="brand-ai">AI</span>
    </div>
  </div>

  {/* RIGHT SIDE - NAVIGATION */}
  <div className="nav-right">

    <div className="nav-links">
      <a href="#features">Features</a>
      <a href="#about">About</a>
    </div>

    <button
      className="login-nav-btn"
      onClick={() => navigate("/login")}
    >
      Login
    </button>

    <button
      className="signup-nav-btn"
      onClick={() => navigate("/register")}
    >
      Sign Up
    </button>

  </div>

</nav>
      {/* ================= HERO SECTION ================= */}

      <main className="hero-section">

        <section className="hero-content">

          <div className="welcome-badge">
            ✨ Your personalized pregnancy wellness companion
          </div>


          <h1>
            Nurturing You Through
            <span>
              Every Step of Pregnancy
            </span>
          </h1>


          <p>
            Nurture AI brings personalized pregnancy wellness, AI-powered
            health guidance, nutrition support, symptom analysis, and family
            connection together in one supportive platform.
          </p>


          <div className="hero-buttons">

  <button
    className="secondary-btn"
    onClick={() => navigate("/login")}
  >
    I Already Have an Account
  </button>

  <button
  className="get-app-btn"
  onClick={() => alert("The Nurture AI app will be available soon for download.")}
>
  📱 Get App
</button>
</div>

          <div className="trust-text">

            <span>
              🔒
            </span>

            Your pregnancy journey deserves personalized care and support.

          </div>

        </section>


        {/* ================= HERO VISUAL ================= */}

        <section className="hero-visual">

          <div className="soft-circle"></div>


          <div className="mother-illustration">
            🤰
          </div>


          <div className="floating-card health-card">

            <div className="card-icon">
              💗
            </div>

            <div>

              <strong>
                Daily Wellness
              </strong>

              <small>
                Personalized insights
              </small>

            </div>

          </div>


          <div className="floating-card family-card">

            <div className="card-icon">
              👨‍👩‍👧
            </div>

            <div>

              <strong>
                Family Support
              </strong>

              <small>
                Stay connected
              </small>

            </div>

          </div>


          <div className="floating-card ai-card">

            <div className="card-icon">
              🤖
            </div>

            <div>

              <strong>
                AI Assistant
              </strong>

              <small>
                Here when you need help
              </small>

            </div>

          </div>

        </section>

      </main>


      {/* ================= ABOUT SECTION ================= */}

      <section
        className="about-section"
        id="about"
      >

        <div className="about-content">

          <div className="about-label">
            ABOUT NURTURE AI
          </div>


          <h2>

            A Smarter Way to Experience

            <span>
              Pregnancy Wellness
            </span>

          </h2>


          <p>
            Nurture AI is an AI-powered pregnancy wellness and family support
            platform designed to provide personalized guidance throughout the
            pregnancy journey.
          </p>


          <p>
            From pregnancy tracking and nutrition analysis to AI-powered health
            insights, family support, digital records, reminders, and
            personalized recommendations, Nurture AI brings essential pregnancy
            wellness tools together in one supportive platform.
          </p>


          <div className="about-points">


            <div className="about-point">

              <span>
                ✦
              </span>

              <div>

                <strong>
                  Personalized AI Guidance
                </strong>

                <p>
                  Recommendations based on your individual pregnancy journey.
                </p>

              </div>

            </div>


            <div className="about-point">

              <span>
                ✦
              </span>

              <div>

                <strong>
                  Connected Family Support
                </strong>

                <p>
                  Keep loved ones involved and connected throughout pregnancy.
                </p>

              </div>

            </div>


            <div className="about-point">

              <span>
                ✦
              </span>

              <div>

                <strong>
                  Digital Pregnancy Records
                </strong>

                <p>
                  Keep important health information organized in one place.
                </p>

              </div>

            </div>

          </div>

        </div>


        <div className="about-highlight">

          <div className="highlight-circle">
            🤰
          </div>


          <h3>

            Your Journey.

            <br />

            Your Wellness.

            <br />

            Your Support.

          </h3>


          <p>
            Powered by intelligent technology and designed with care.
          </p>

        </div>

      </section>
      {/* ================= JOURNEY TIMELINE ================= */}

<section className="journey-section">

    <div className="journey-heading">

        <span className="journey-tag">
            YOUR JOURNEY
        </span>

        <h2>
            With You at <span>Every Step</span>
        </h2>

        <p>
One platform that supports you from planning your pregnancy through delivery and keeps your family connected every step of the way.        
</p>

    </div>

    <div className="timeline">

        <div className="timeline-line"></div>

        <div className="timeline-item">

            <div className="timeline-icon">
                ❤️
                <span>01</span>
            </div>

            <div className="timeline-card">

                <h3>Planning & Conception</h3>

                <p>
                    Ovulation tracking, fertility guidance, preconception health
                    checks and expert recommendations.
                </p>

            </div>

        </div>

        <div className="timeline-item">

            <div className="timeline-icon">
                🤰
                <span>02</span>
            </div>

            <div className="timeline-card">

                <h3>Pregnancy (9 Months)</h3>

                <p>
                    Week-by-week tracking, trimester milestones, nutrition,
                    exercise guidance and AI support.
                </p>

            </div>

        </div>

        <div className="timeline-item">

            <div className="timeline-icon">
                🏥
                <span>03</span>
            </div>

            <div className="timeline-card">

                <h3>Delivery Preparation</h3>

                <p>
                    Hospital checklist, birth plan, health records,
                    reminders and consultation support.
                </p>

            </div>

        </div>

        <div className="timeline-item">
    <div className="timeline-icon">
        👨‍👩‍👧
        <span>04</span>
    </div>

    <div className="timeline-card">
        <h3>Family Support</h3>

        <p>
            Keep your loved ones involved throughout the pregnancy journey
            with shared health updates, appointment reminders, emotional
            support, and personalized guidance for every family member.
        </p>
    </div>
</div>

    </div>

</section>


      {/* ================= FEATURES SECTION ================= */}

      <section
        className="features-section"
        id="features"
      >

        <div className="section-heading">

          <p>
            DESIGNED AROUND YOUR JOURNEY
          </p>


          <h2>
            Support That Grows With You
          </h2>

        </div>


        <div className="features-grid">


          <div className="feature-card">

            <div className="feature-icon">
              🤖
            </div>

            <h3>
              AI Pregnancy Assistant
            </h3>

            <p>
              Get personalized answers and pregnancy-related health guidance
              whenever you need support.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              🥗
            </div>

            <h3>
              Nutrition Analyzer
            </h3>

            <p>
              Track your food intake and receive personalized suggestions for
              improving your nutrition.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              📈
            </div>

            <h3>
              Wellness Monitoring
            </h3>

            <p>
              Monitor daily wellness and understand symptom patterns through
              intelligent analysis.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              👨‍👩‍👧
            </div>

            <h3>
              Family Support
            </h3>

            <p>
              Keep family members connected and involved throughout the
              pregnancy journey.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              📂
            </div>

            <h3>
              Digital Health Records
            </h3>

            <p>
              Keep important pregnancy reports and health information
              organized in one place.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              🔔
            </div>

            <h3>
              Smart Reminders
            </h3>

            <p>
              Receive reminders for medicines, checkups, and important
              pregnancy wellness activities.
            </p>

          </div>

        </div>

      </section>
      {/* ================================================= */}
{/* ================= DOCTOR SECTION ================= */}
{/* ================================================= */}

<section className="doctor-section" id="doctors">

  <div className="doctor-heading">

    <span className="doctor-tag">
      🩺 EXPERT MEDICAL SUPPORT
    </span>

    <h2>
      Connect With Your
      <span>Trusted Doctor</span>
    </h2>

    <p>
      Get professional guidance throughout your pregnancy journey.
      Connect with experienced healthcare specialists whenever you
      need personalized support.
    </p>

  </div>


  <div className="doctor-grid">

    {/* ================= DOCTOR 1 ================= */}

    <div className="doctor-card">

      <div className="doctor-card-top">

        <div className="doctor-avatar">
          👩‍⚕️
        </div>

        <div className="doctor-info">

          <h3>Dr. Rajshri Raut</h3>

          <p className="doctor-degree">
            MBBS, MD
          </p>

          <p className="doctor-specialization">
            Obstetrician & Gynecologist
          </p>

        </div>

      </div>


      <p className="doctor-description">
        Specialized in pregnancy care, prenatal health,
        maternal wellness, and pregnancy-related guidance.
      </p>


      <div className="doctor-status">
        <span className="status-dot"></span>
        <span>Available for consultation</span>
      </div>


      <button
        type="button"
        className="doctor-connect-btn"
        onClick={() => navigate("/doctor-consultation")}
      >
        <span className="button-text">
          Connect with Doctor
        </span>

        <span className="button-arrow">
          →
        </span>
      </button>

    </div>


    {/* ================= DOCTOR 2 ================= */}

    <div className="doctor-card">

      <div className="doctor-card-top">

        <div className="doctor-avatar doctor-avatar-two">
          👨‍⚕️
        </div>

        <div className="doctor-info">

          <h3>Dr. Rahul Mehta</h3>

          <p className="doctor-degree">
            MBBS, DNB
          </p>

          <p className="doctor-specialization">
            Maternal & Child Health Specialist
          </p>

        </div>

      </div>


      <p className="doctor-description">
        Focused on maternal wellness, pregnancy support,
        prenatal care, and family health guidance.
      </p>


      <div className="doctor-status">
        <span className="status-dot"></span>
        <span>Available for consultation</span>
      </div>


      <button
        type="button"
        className="doctor-connect-btn"
        onClick={() => navigate("/doctor-consultation")}
      >
        <span className="button-text">
          Connect with Doctor
        </span>

        <span className="button-arrow">
          →
        </span>
      </button>

    </div>

  </div>


  {/* ================= SECURITY MESSAGE ================= */}

  <div className="doctor-note">
    <span>🔒</span>
    <span>Your health information is kept private and secure.</span>
  </div>

</section>
{/* ================================================= */}
{/* ========== PREGNANCY VIDEO GUIDANCE ============= */}
{/* ================================================= */}

<section className="video-guidance-section" id="video-guidance">

  <div className="video-guidance-heading">

    <span className="video-guidance-tag">
      🎥 WELLNESS VIDEO GUIDANCE
    </span>

    <h2>
      Guidance That Supports
      <span>Your Pregnancy Journey</span>
    </h2>

    <p>
      Nurture AI also provides curated YouTube video guidance
      to help expecting mothers learn, relax, stay active,
      and make informed wellness choices throughout pregnancy.
    </p>

  </div>


  <div className="video-guidance-content">

    {/* ================= INTRODUCTION ================= */}

    <div className="video-guidance-intro">

      <div className="video-main-icon">
        🎬
      </div>

      <div>

        <h3>
          Learn Through Trusted Video Guidance
        </h3>

        <p>
          Pregnancy is a journey of continuous learning.
          Nurture AI brings useful video-based guidance
          together so mothers can easily explore topics
          related to pregnancy wellness, healthy lifestyle,
          relaxation, and emotional well-being.
        </p>

        <p>
          These videos are provided as an additional
          educational and wellness resource inside the
          Nurture AI experience.
        </p>

      </div>

    </div>


    {/* ================= VIDEO CATEGORIES ================= */}

    <div className="video-category-grid">

      {/* EXERCISE */}

      <div className="video-category-card">

        <div className="video-category-icon">
          🧘‍♀️
        </div>

        <div>

          <h3>
            Pregnancy Exercise
          </h3>

          <p>
            Guidance videos covering gentle pregnancy-friendly
            exercises, stretching, movement, breathing practices,
            and physical wellness activities.
          </p>

        </div>

      </div>


      {/* DIET */}

      <div className="video-category-card">

        <div className="video-category-icon">
          🥗
        </div>

        <div>

          <h3>
            Diet & Nutrition
          </h3>

          <p>
            Educational videos about healthy pregnancy nutrition,
            balanced meals, important nutrients, healthy eating
            habits, and pregnancy-friendly food choices.
          </p>

        </div>

      </div>


      {/* MENTAL PEACE */}

      <div className="video-category-card">

        <div className="video-category-icon">
          🧠
        </div>

        <div>

          <h3>
            Mental Peace & Relaxation
          </h3>

          <p>
            Explore relaxation, mindfulness, meditation,
            breathing exercises, and other wellness practices
            that can support emotional well-being during pregnancy.
          </p>

        </div>

      </div>


      {/* MUSIC */}

      <div className="video-category-card">

        <div className="video-category-icon">
          🎵
        </div>

        <div>

          <h3>
            Pregnancy Music
          </h3>

          <p>
            Discover calming music, soothing sounds, meditation
            music, and relaxing audio experiences designed to
            create a peaceful pregnancy environment.
          </p>

        </div>

      </div>


      {/* GARBH SANSKAR */}

      <div className="video-category-card">

        <div className="video-category-icon">
          🪷
        </div>

        <div>

          <h3>
            Garbh Sanskar
          </h3>

          <p>
            Access educational and cultural content related
            to Garbh Sanskar, including positive thoughts,
            meditation, mantras, music, and traditional practices.
          </p>

        </div>

      </div>


      {/* GENERAL GUIDANCE */}

      <div className="video-category-card">

        <div className="video-category-icon">
          💕
        </div>

        <div>

          <h3>
            Pregnancy Wellness
          </h3>

          <p>
            Explore additional educational videos covering
            pregnancy care, healthy lifestyle habits,
            preparation, awareness, and everyday wellness.
          </p>

        </div>

      </div>

    </div>


    {/* ================= BOTTOM MESSAGE ================= */}

    <div className="video-guidance-bottom">

      <div className="video-bottom-icon">
        ▶
      </div>

      <div>

        <h3>
          Curated Guidance, All in One Place
        </h3>

        <p>
          Nurture AI makes it easier to discover useful
          pregnancy-related video resources without searching
          through multiple platforms. Video guidance is designed
          to complement your personalized wellness journey.
        </p>

      </div>

    </div>

  </div>


  <div className="video-guidance-note">

    🔒 Video content is provided for general educational and
    wellness purposes. Always consult a qualified healthcare
    professional for personalized medical advice.

  </div>

</section>
{/* ================================================= */}
{/* ================= APP PREVIEW =================== */}
{/* ================================================= */}

<section className="app-preview-section" id="app-preview">

  <div className="app-preview-heading">

    <span className="app-preview-tag">
      📱 NURTURE AI MOBILE APP
    </span>

    <h2>
      Your Wellness Journey,
      <span> Right in Your Hands</span>
    </h2>

    <p>
      Experience the Nurture AI mobile app designed to keep your
      pregnancy wellness journey simple, personalized, and connected.
    </p>

  </div>


  <div className="mobile-preview-container">

    {/* PHONE 1 */}
    <div className="phone-wrapper phone-left">

      <div className="phone-frame">


        <img
          src="/Image/n3.jpeg"
          alt="Nurture AI Home Screen"
          className="phone-screen"
        />

      </div>

      <h3>Personalized Dashboard</h3>

      <p>
        View your wellness information and pregnancy journey
        from one simple dashboard.
      </p>

    </div>


    {/* PHONE 2 */}
    <div className="phone-wrapper phone-main">

      <div className="phone-frame">


        <img
          src="/Image/nutur1.jpeg"
          alt="Nurture AI Assistant Screen"
          className="phone-screen"
        />

      </div>

      <h3>Resgiteration Form </h3>

      <p>
        Get register with personalized AI-powered guidance whenever you need it.
      </p>

    </div>


    {/* PHONE 3 */}
    <div className="phone-wrapper phone-right">

      <div className="phone-frame">


        <img
          src="/Image/n5.jpeg"
          alt="Nurture AI Nutrition Screen"
          className="phone-screen"
        />

      </div>

      <h3>Nutrition & Wellness</h3>

      <p>
        Track nutrition and receive personalized wellness insights.
      </p>

    </div>

  </div>


  {/* FAMILY APP SCREEN */}

  <div className="app-preview-bottom">

    <div className="bottom-preview-image">

      <div className="phone-frame small-phone">


        <img
          src="/Image/nuture2.jpeg"
          alt="Nurture AI Family Support Screen"
          className="phone-screen"
        />

      </div>

    </div>


    <div className="bottom-preview-content">

      <span>CONNECTED CARE</span>

      <h3>
        Keep Your Family
        <strong> Connected</strong>
      </h3>

      <p>
        Nurture AI helps families stay involved throughout
        the pregnancy journey with shared updates, reminders,
        and personalized support.
      </p>

      <div className="preview-points">

        <div>
          <span>✓</span>
          Shared health updates
        </div>

        <div>
          <span>✓</span>
          Appointment reminders
        </div>

        <div>
          <span>✓</span>
          Family support
        </div>

      </div>

    </div>

  </div>

</section>
      {/* ================= FOOTER ================= */}

      <footer className="footer">
        <div className="footer-brand">
          ✦ Nurture AI
        </div>


        <p>
          AI-powered pregnancy wellness and family support.
        </p>


        <small>
          For wellness support only. Always consult qualified healthcare
          professionals for medical advice.
        </small>

        <div className="footer-contact">
  <span>📧</span>
  <a href="mailto:nurtureai@gmail.com">nurtureai@gmail.com</a>
</div>

      </footer>

    </div>
  );
}
export default Welcome;
