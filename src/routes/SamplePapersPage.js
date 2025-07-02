import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SamplePapersPage() {
  const navigate = useNavigate();
  const [samplePapers, setSamplePapers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    import("../data/Sample-Papers.json")
      .then((data) => {
        const subs = data["Sample-Papers"].submodules;
        const list = Object.keys(subs).map((key, index) => {
          const progressKey = `progress_Sample-Papers_${key}`;
          const isAttempted = localStorage.getItem(progressKey) === "true";
          return {
            id: key,
            title: subs[key].title,
            questions: subs[key].questions.length,
            index: index + 1,
            attempted: isAttempted
          };
        });
        setSamplePapers(list);
      })
      .catch((err) => console.error("Failed to load sample papers:", err));
  }, []);

  const filteredPapers = samplePapers.filter((paper) =>
    paper.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-primary text-center">📑 All Sample Paper Tests ({filteredPapers.length} Total)</h2>

            <div className="mb-4 text-start">
        <button onClick={() => navigate('/')} className="btn btn-outline-secondary">
          ← Back to Modules
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Search sample paper by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="row g-4">
        {filteredPapers.map((paper) => (
          <div className="col-md-4" key={paper.id}>
            <div className="card shadow-sm h-100 p-3">
              <h5 className="text-dark fw-bold mb-2">
                {paper.index}. {paper.title}
              </h5>
              <p className="text-muted">Total Questions: {paper.questions}</p>
              <span
                className={`badge mb-2 ${paper.attempted ? "bg-success" : "bg-secondary"}`}
              >
                {paper.attempted ? "✔ Attempted" : "🕒 Not Attempted"}
              </span>
              <br />
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => navigate(`/quiz/Sample-Papers/${paper.id}`)}
              >
                Start Test
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
