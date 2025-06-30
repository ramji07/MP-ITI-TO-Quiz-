// src/routes/ModuleList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const modules = [
  { id: "Module-1", title: "Introduction to Computer" },
  { id: "Module-2", title: "Using Windows OS" },
  { id: "Module-3", title: "Computer Basics And Software Installation" },
  { id: "Module-4", title: "Install Windows Operating System" },
  { id: "Module-5", title: "DOS Commands Line Interface" },
  { id: "Module-6", title: "Install Ubuntu Linux Operating System" },
  { id: "Module-7", title: "Introduction to Linux Operating System" },
  { id: "Module-8", title: "Using Word Processing Software" },
  { id: "Module-9", title: "Using MS Word 2010 Software" },
  { id: "Module-10", title: "Using MS Excels Software" },
  { id: "Module-11", title: "Computer Networks and internet" },
  { id: "Module-12", title: "Demonstrate on MySql" },
  { id: "Module-13", title: "HTML Structure" },
  { id: "Module-14", title: "CSS Styling" },
  { id: "Module-15", title: "JavaScript Soul" },
];

export default function ModuleList() {
  const navigate = useNavigate();
  const [completedModules, setCompletedModules] = useState({});

  useEffect(() => {
    modules.forEach((mod) => {
      import(`../data/${mod.id}.json`)
        .then((data) => {
          const submodules = data[mod.id]?.submodules || {};
          const subKeys = Object.keys(submodules);
          const isAllCompleted = subKeys.every((subId) => {
            const key = `progress_${mod.id}_${subId}`;
            return localStorage.getItem(key) === "true";
          });

          setCompletedModules((prev) => ({
            ...prev,
            [mod.id]: isAllCompleted,
          }));
        })
        .catch(() => {});
    });
  }, []);

  return (
    <div className="container my-4">
      <h2 className="mb-4 text-center text-primary">All Modules</h2>
      <div className="row g-3">
        {modules.map((mod) => (
          <div className="col-12 col-md-4" key={mod.id}>
            <button
              onClick={() => navigate(`/submodules/${mod.id}`)}
              className={`btn w-100 text-start border shadow-sm p-3 rounded ${
                completedModules[mod.id] ? "btn-success text-white" : "btn-light"
              }`}
            >
              <h5 className="fw-bold mb-1">
                {mod.id}
                {completedModules[mod.id] && (
                  <span className="ms-2 badge bg-light text-success">✔ Completed</span>
                )}
              </h5>
              <p className="text-muted mb-0">{mod.title}</p>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
