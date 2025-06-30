import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MarkedReview() {
  const [markedQuestions, setMarkedQuestions] = useState([]);
  const [quizInfo, setQuizInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const moduleId = localStorage.getItem("last_module");
    const subId = localStorage.getItem("last_submodule");

    if (!moduleId || !subId) {
      console.warn("Missing moduleId or subId from localStorage.");
      return;
    }

    const bookmarkKey = `bookmark_${moduleId}_${subId}`;
    const saved = localStorage.getItem(bookmarkKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const markedIndexes = parsed.marked || [];
        import(`../data/${moduleId}.json`)
          .then((data) => {
            const sub = data[moduleId]?.submodules?.[subId];
            if (sub?.questions) {
              const markedQs = markedIndexes.map((index) => ({
                index,
                ...sub.questions[index],
              }));
              setMarkedQuestions(markedQs);
              setQuizInfo({ moduleId, subId, title: sub.title || subId });
            }
          })
          .catch((err) => {
            console.error("Error loading quiz data:", err);
          });
      } catch (err) {
        console.error("Error parsing saved bookmark:", err);
      }
    }
  }, []);

  if (!markedQuestions.length) {
    return (
      <div className="container my-5">
        <h4 className="text-danger">⚠️ No marked questions found.</h4>
        <button onClick={() => navigate(-1)} className="btn btn-outline-primary mt-3">
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h3 className="mb-4 text-primary">
        📌 Marked Questions - {quizInfo?.title}
      </h3>
      <button onClick={() => navigate(-1)} className="btn btn-outline-secondary mb-4">
        ← Back to Quiz
      </button>

      {markedQuestions.map((q, i) => (
        <div className="card mb-4 shadow-sm" key={i}>
          <div className="card-body">
            <h5>Q{q.index + 1}: {q.question}</h5>
            <ul className="list-group mt-3">
              {q.options.map((opt, idx) => (
                <li key={idx} className={`list-group-item ${opt === q.answer ? 'list-group-item-success' : ''}`}>
                  {opt}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
