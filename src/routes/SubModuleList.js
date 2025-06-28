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

          return (
            <div className="col-md-4" key={subId}>
              <button
                onClick={() => navigate(`/quiz/${moduleId}/${subId}`)}
                className={`btn w-100 p-3 border shadow-sm ${
                  isCompleted ? "btn-success" : "btn-outline-dark"
                }`}
              >
                {subData.title || subId}
                {isCompleted && (
                  <span className="ms-2 badge bg-light text-success">✔ Completed</span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
