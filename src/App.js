import { Routes, Route } from "react-router-dom";
import ModuleList from "./routes/ModuleList";
import SubModuleList from "./routes/SubModuleList";
import QuizPage from "./routes/QuizPage";
import ResultPage from "./routes/ResultPage";
import MarkedReview from "./routes/MarkedReview"; // ✅ Import the new component  

const App = () => {
  return (
    <div className="min-h-screen bg-light p-4 text-center">
      <h1 className="text-3xl fw-bold mb-4">🧠 MCQ Practice App (Module-wise)</h1>
      <Routes>
       <Route path="/" element={<ModuleList />} />
      <Route path="/submodules/:moduleId" element={<SubModuleList />} />
      <Route path="/quiz/:moduleId/:subId" element={<QuizPage />} />
      <Route path="/result" element={<ResultPage />} />
              <Route path="/marked-review" element={<MarkedReview />} /> {/* ✅ New Route */}
      </Routes>
    </div>
  );
};

export default App;
