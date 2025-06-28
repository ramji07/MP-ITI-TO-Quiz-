// 📁 ResultPage.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Legend,
  Title,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  //eslint-disable-next-line
  const { moduleId, subModuleId, userAnswers, correctAnswers, questions } = location.state || {};

  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5;

  const score = userAnswers?.reduce(
    (acc, ans, i) => (ans === correctAnswers?.[i] ? acc + 1 : acc),
    0
  );
  const incorrect = questions?.length - score;
  const percentage = ((score / questions.length) * 100).toFixed(2);

  // ✳️ Topic-wise Performance
  const topicStats = {};
  questions.forEach((q, i) => {
    const topic = q.topic || "Unknown";
    if (!topicStats[topic]) topicStats[topic] = { correct: 0, total: 0 };
    topicStats[topic].total++;
    if (userAnswers[i] === q.answer) topicStats[topic].correct++;
  });

  const currentQuestions = questions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  if (!questions || !userAnswers) return <div className="alert alert-danger">❌ Invalid data</div>;

  return (
    <div className="container my-5">
      <h2 className="text-primary text-center mb-4">📊 Quiz Result</h2>

      <div className="row mb-5">
        <div className="col-md-6">
          <Bar
            data={{
              labels: Object.keys(topicStats),
              datasets: [
                {
                  label: "Correct",
                  data: Object.values(topicStats).map((t) => t.correct),
                  backgroundColor: "#28a745",
                },
                {
                  label: "Incorrect",
                  data: Object.values(topicStats).map((t) => t.total - t.correct),
                  backgroundColor: "#dc3545",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { position: "bottom" }, title: { display: true, text: "Topic-wise Performance" } },
            }}
          />
        </div>
        <div className="col-md-6 text-start">
          <div className="bg-success text-white p-3 rounded mb-3 shadow-sm">
            ✅ Correct: <strong>{score}</strong>
          </div>
          <div className="bg-danger text-white p-3 rounded mb-3 shadow-sm">
            ❌ Incorrect: <strong>{incorrect}</strong>
          </div>
          <div className="bg-primary text-white p-3 rounded mb-3 shadow-sm">
            🎯 Score: <strong>{percentage}%</strong>
          </div>
        </div>
      </div>

      <h4 className="mb-3">📋 Question-wise Review</h4>
      {currentQuestions.map((q, i) => {
        const globalIndex = (currentPage - 1) * questionsPerPage + i;
        const isCorrect = userAnswers[globalIndex] === q.answer;
        return (
          <div
            key={globalIndex}
            className={`p-3 mb-3 rounded border shadow-sm ${
              isCorrect ? "border-success bg-light" : "border-danger bg-light"
            }`}
          >
            <h6>Q{globalIndex + 1}: {q.question}</h6>
            <p>
              <strong>Your Answer:</strong>{" "}
              <span className={isCorrect ? "text-success" : "text-danger"}>{userAnswers[globalIndex]}</span>
            </p>
            {!isCorrect && (
              <p>
                <strong>Correct Answer:</strong> <span className="text-success">{q.answer}</span>
              </p>
            )}
          </div>
        );
      })}

      <div className="d-flex justify-content-between align-items-center mt-4">
        <button
          className="btn btn-outline-secondary"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >⬅️ Prev</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          className="btn btn-outline-secondary"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >Next ➡️</button>
      </div>

      <div className="text-center mt-4">
        <button onClick={() => navigate(`/submodules/${moduleId}`)} className="btn btn-outline-primary me-2">
          🔁 Try Another Submodule
        </button>
        <button onClick={() => navigate("/")} className="btn btn-primary">
          🏠 Go to Home
        </button>
      </div>
    </div>
  );
}
