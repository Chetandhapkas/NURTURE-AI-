
import Navbar from "../../components/Navbar/Navbar";
import WelcomeCard from "../../components/WelcomeCard/WelcomeCard";
import HealthSummary from "../../components/HealthSummary/HealthSummary";
import AppointmentCard from "../../components/AppointmentCard/AppointmentCard";
import ExerciseVideos from "../../components/ExerciseVideos/ExerciseVideos";

import NotificationPermission from "../../components/Notification/NotificationPermission";

import "./dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-layout">

      <div className="dashboard-main">

        <Navbar />

        <main className="dashboard-content">

          {/* Welcome */}
          <WelcomeCard />

          {/* Notification Permission */}
          <NotificationPermission />

          {/* Health Summary */}
          <HealthSummary />

          {/* Appointments */}
          <AppointmentCard />

          {/* Exercise Videos */}
          <ExerciseVideos />

        </main>

      </div>

    </div>
  );
}

export default Dashboard;