import React, { useEffect, useState } from "react";
import "../../../styles/student/quiz/attemptquiz.css";

export default function QuizTimer({ totalMinutes, onTimeUp }) {
  const [secondsLeft, setSecondsLeft] = useState(totalMinutes * 60);

 useEffect(() => {
  const interval = setInterval(() => {
    setSecondsLeft((prev) => {
      if (prev <= 1) {
        clearInterval(interval);
        onTimeUp();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [onTimeUp]); // eslint-disable-line react-hooks/exhaustive-deps

  // Format time as MM:SS
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Change color based on time left
  function getTimerClass() {
    const totalSeconds = totalMinutes * 60;
    const percentLeft = (secondsLeft / totalSeconds) * 100;
    if (percentLeft <= 10) return "quiz-timer danger";
    if (percentLeft <= 25) return "quiz-timer warning";
    return "quiz-timer";
  }

  return (
    <div className={getTimerClass()}>
      ⏱️ {formatted}
    </div>
  );
}