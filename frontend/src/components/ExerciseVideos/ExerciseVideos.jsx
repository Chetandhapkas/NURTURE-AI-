
import React from "react";
import { FaPlay, FaDumbbell, FaClock } from "react-icons/fa";
import "./ExerciseVideos.css";

const exerciseVideos = [
  {
    id: "quMHccQuH6A",
    title: "Beginner Pregnancy Workout",
    category: "Full Body",
    duration: "35 min",
    description: "A beginner-friendly routine with warm-up and stretching.",
  },
  {
    id: "U8CCYGgPn60",
    title: "Prenatal Walking Workout",
    category: "Low Impact",
    duration: "30 min",
    description: "A low-impact, standing workout without equipment.",
  },
  {
    id: "6cMwUHOoTIM",
    title: "Full Body Pregnancy Workout",
    category: "Full Body",
    duration: "27 min",
    description: "A prenatal routine with warm-up and cool-down stretches.",
  },
  {
    id: "mkrSYQnA5cQ",
    title: "Pregnancy Pelvic Floor Workout",
    category: "Pelvic Floor",
    duration: "Workout",
    description: "Guided pelvic floor exercises for pregnancy.",
  },
  {
    id: null,
    title: "Gentle Prenatal Yoga",
    category: "Yoga & Relaxation",
    duration: "Beginner",
    description: "Find a gentle prenatal yoga session for your comfort level.",
    search: "gentle prenatal yoga workout pregnancy beginner",
  },
  {
    id: null,
    title: "Pregnancy Stretching",
    category: "Stretching",
    duration: "Beginner",
    description: "Gentle pregnancy stretches for flexibility and relaxation.",
    search: "pregnancy stretching workout beginner prenatal",
  },
];

export default function ExerciseVideos() {
  const openVideo = (video) => {
    const url = video.id
      ? `https://www.youtube.com/watch?v=${video.id}`
      : `https://www.youtube.com/results?search_query=${encodeURIComponent(
          video.search
        )}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="exercise-section">
      <div className="exercise-header">
        <div className="exercise-heading-icon">
          <FaDumbbell />
        </div>

        <div>
          <h2>Pregnancy Exercise</h2>
          <p>
            Gentle movement and guided workouts to support your wellness.
          </p>
        </div>
      </div>

      <div className="exercise-video-grid">
        {exerciseVideos.map((video) => (
          <article className="exercise-video-card" key={video.title}>
            <button
              type="button"
              className="exercise-thumbnail"
              onClick={() => openVideo(video)}
              aria-label={`Play ${video.title} on YouTube`}
            >
              <img
                src={
                  video.id
                    ? `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
                    : "https://placehold.co/640x360/f3e9e9/765b68?text=Pregnancy+Exercise"
                }
                alt={video.title}
                loading="lazy"
              />

              <span className="exercise-play-button">
                <FaPlay />
              </span>

              <span className="exercise-duration">
                <FaClock /> {video.duration}
              </span>
            </button>

            <div className="exercise-video-info">
              <span className="exercise-category">{video.category}</span>

              <h3>{video.title}</h3>

              <p>{video.description}</p>

              <button
                type="button"
                className="exercise-watch-button"
                onClick={() => openVideo(video)}
              >
                <FaPlay /> Watch on YouTube
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="exercise-safety-note">
        <strong>Stay safe while exercising</strong>
        <p>
          Consult your doctor or midwife before starting a new exercise
          routine. Choose activities suitable for your pregnancy and stop
          if you feel pain, dizziness, bleeding, or unwell.
        </p>
      </div>
    </section>
  );
}
