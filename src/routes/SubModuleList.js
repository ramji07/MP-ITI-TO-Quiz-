// src/routes/SubModuleList.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function SubModuleList() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [submodules, setSubmodules] = useState({});

  useEffect(() => {
    import(`../data/${moduleId}.json`)
      .then((data) => {
        const moduleData = data[moduleId];
        if (moduleData?.submodules) {
          setSubmodules(moduleData.submodules);
        }
      })
      .catch(() => {});
  }, [moduleId]);

  return (
    <div className="container my-4">
      <h3 className="text-center text-primary mb-4">Submodules of {moduleId}</h3>
      <div className="mb-4 text-start">
        <button onClick={() => navigate('/')} className="btn btn-outline-secondary">
          ← Back to Modules
        </button>
      </div>
      <div className="row g-3">
        {Object.entries(submodules).map(([subId, subData]) => {
          const key = `progress_${moduleId}_${subId}`;
          const isCompleted = localStorage.getItem(key) === "true";
          const resultRaw = localStorage.getItem(`result_${moduleId}_${subId}`);
          const result = resultRaw ? JSON.parse(resultRaw) : null;

          return (
            <div className="col-md-4" key={subId}>
              <div className={`border rounded p-3 shadow-sm ${isCompleted ? "bg-light" : ""}`}>
                <h6>{subData.title || subId}</h6>

                {isCompleted && result && (
                  <div className="small text-muted">
                    ✅ Completed <br />
                    📌 Marked: {result.marked?.length || 0} <br />
                    🏆 Score: {result.score}/{result.total} <br />
                    🕒 {result.date}
                  </div>
                )}

                <div className="mt-2">
                  {isCompleted && result ? (
                    <button
                      className="btn btn-sm btn-outline-primary w-100"
                      onClick={() =>
                        navigate("/result", {
                          state: {
                            moduleId,
                            subModuleId: subId,
                            ...result,
                          },
                        })
                      }
                    >
                      📊 View Result
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/quiz/${moduleId}/${subId}`)}
                      className="btn btn-outline-dark w-100"
                    >
                      Start Quiz
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
