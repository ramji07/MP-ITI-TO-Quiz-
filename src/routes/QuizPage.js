import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function QuizPage() {
  const { moduleId, subId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [marked, setMarked] = useState([]);
  const [showSubmit, setShowSubmit] = useState(false);
  //eslint-disable-next-line no-unused-vars
  const [resumed, setResumed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [dailyProgress, setDailyProgress] = useState(0);
  const [timePerQuestion, setTimePerQuestion] = useState(10);
  const [showTimeInput, setShowTimeInput] = useState(true);
  const [waitingToShowUI, setWaitingToShowUI] = useState(true);
  const [checkedAnswers, setCheckedAnswers] = useState({});

  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const delayTimerRef = useRef(null);

  const DAILY_GOAL = 30;

  useEffect(() => {
    const unlock = () => {
      audioRef.current?.play().then(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      });
      document.removeEventListener("click", unlock);
    };
    document.addEventListener("click", unlock);
  }, []);

  useEffect(() => {
    import(`../data/${moduleId}.json`)
      .then((data) => {
        const sub = data[moduleId]?.submodules?.[subId];
        if (sub?.questions?.length) {
          setQuiz(sub);
        }
      })
      .catch((err) => console.error("Quiz load error:", err));
  }, [moduleId, subId]);

  const startQuiz = () => {
    if (quiz) {
      setTimeLeft(timePerQuestion + 3);
      setShowTimeInput(false);
      const saved = localStorage.getItem(`bookmark_${moduleId}_${subId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.answers?.length) {
          const confirmResume = window.confirm("⚠️ Resume your previous quiz attempt?");
          if (confirmResume) {
            setCurrent(parsed.current);
            setUserAnswers(parsed.answers);
            setMarked(parsed.marked || []);
            setResumed(true);
          }
        }
      }
    }
  };

  useEffect(() => {
    if (quiz && !showTimeInput) {
      const data = {
        current,
        answers: userAnswers,
        marked,
      };
      localStorage.setItem(`bookmark_${moduleId}_${subId}`, JSON.stringify(data));
    }
  }, [quiz, current, userAnswers, marked, showTimeInput, moduleId, subId]);

  const handleSubmit = useCallback(() => {
    if (!quiz) return;

    const correctAnswers = quiz.questions.map((q) => q.answer);
    localStorage.setItem(`progress_${moduleId}_${subId}`, "true");
    localStorage.removeItem(`bookmark_${moduleId}_${subId}`);

    navigate("/result", {
      state: {
        moduleId,
        subModuleId: subId,
        userAnswers,
        correctAnswers,
        questions: quiz.questions,
      },
    });
  }, [quiz, moduleId, subId, userAnswers, navigate]);

  useEffect(() => {
    if (!quiz || showTimeInput) return;

    clearInterval(intervalRef.current);
    clearTimeout(delayTimerRef.current);

    setTimeLeft(timePerQuestion + 3);
    setWaitingToShowUI(true);

    delayTimerRef.current = setTimeout(() => {
      setWaitingToShowUI(false);
    }, 3000);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          audioRef.current?.play().catch(() => {});
          if (current === quiz.questions.length - 1) {
            handleSubmit();
          } else {
            setCurrent((prevQ) => prevQ + 1);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(delayTimerRef.current);
    };
  }, [current, quiz, showTimeInput, timePerQuestion, handleSubmit]);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(delayTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const key = `daily_goal_${today}`;
    const count = parseInt(localStorage.getItem(key)) || 0;
    setDailyProgress(count);
  }, []);

  const updateDailyProgress = () => {
    const today = new Date().toISOString().split("T")[0];
    const key = `daily_goal_${today}`;
    const count = parseInt(localStorage.getItem(key)) || 0;
    localStorage.setItem(key, count + 1);
    setDailyProgress(count + 1);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleAnswer = (answer) => {
    const updated = [...userAnswers];
    updated[current] = answer;
    setUserAnswers(updated);
    updateDailyProgress();
    if (current === quiz.questions.length - 1) {
      setShowSubmit(true);
    }
  };

  const handleMark = () => {
    if (!marked.includes(current)) {
      setMarked([...marked, current]);
    }
  };

  const handleUnmark = () => {
    setMarked(marked.filter((m) => m !== current));
  };

  if (!quiz) return <div className="alert alert-info">⏳ Loading quiz...</div>;

  if (showTimeInput) {
    return (
      <div className="container mt-5">
        <h4 className="mb-3">⏱️ Set Time Per Question (seconds)</h4>
        <input
          type="number"
          className="form-control w-25 mb-3"
          value={timePerQuestion}
          min={5}
          onChange={(e) => setTimePerQuestion(Number(e.target.value))}
        />
        <button onClick={startQuiz} className="btn btn-primary">Start Quiz</button>
      </div>
    );
  }

  const question = quiz.questions[current];
  const isMarked = marked.includes(current);
  const userAnswer = userAnswers[current];
  const isChecked = checkedAnswers[current];

  return (
    <div className="container my-5">
      <audio ref={audioRef}>
        <source src="/sounds/timeout.mp3" type="audio/mp3" />
        Your browser does not support the audio tag.
      </audio>

      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h4 className="text-primary">{quiz.title}</h4>
        <div>
          <span className="text-muted me-3">Q{current + 1}/{quiz.questions.length}</span>
          <span className="badge bg-dark">
            ⏱️ {waitingToShowUI ? "Get Ready..." : formatTime(timeLeft - 3)}
          </span>
        </div>
      </div>

      <div className="alert alert-info mb-3">
        🎯 Daily Practice: <strong>{dailyProgress}</strong> / {DAILY_GOAL} questions
      </div>

      <div className="card p-4 shadow-sm">
        <h5>Q{current + 1}: {question.question}</h5>
        <ul className="list-group mt-3">
          {question.options.map((opt, i) => (
            <li
              key={i}
              className={`list-group-item list-group-item-action ${userAnswer === opt ? "active" : ""}`}
              onClick={() => handleAnswer(opt)}
              style={{ cursor: "pointer" }}
            >
              {opt}
            </li>
          ))}
        </ul>

        {/* ✅ Show Result after Check */}
        {isChecked !== undefined && (
          <div className={`mt-3 alert ${isChecked ? 'alert-success' : 'alert-danger'}`}>
            {isChecked ? '✅ Correct Answer!' : '❌ Wrong Answer'}
          </div>
        )}

        {/* ✅ Check Answer Button */}
        {userAnswer && isChecked === undefined && (
          <button
            className="btn btn-info mt-3"
            onClick={() => {
              const correct = question.answer === userAnswer;
              setCheckedAnswers((prev) => ({ ...prev, [current]: correct }));
            }}
          >
            Check Answer
          </button>
        )}
      </div>

      <div className="d-flex justify-content-between mt-3">
        <button
          onClick={() => setCurrent((prev) => Math.max(prev - 1, 0))}
          disabled={current === 0}
          className="btn btn-outline-secondary"
        >
          ⬅️ Previous
        </button>
        <div>
          {isMarked ? (
            <button onClick={handleUnmark} className="btn btn-warning me-2">Unmark</button>
          ) : (
            <button onClick={handleMark} className="btn btn-outline-warning me-2">Mark for Review</button>
          )}
          {showSubmit && (
            <button onClick={handleSubmit} className="btn btn-success">
              Submit Quiz
            </button>
          )}
        </div>
        <button
          onClick={() => setCurrent((prev) => Math.min(prev + 1, quiz.questions.length - 1))}
          disabled={current === quiz.questions.length - 1}
          className="btn btn-outline-secondary"
        >
          Next ➡️
        </button>
      </div>

      <div className="mt-4">
        <h6 className="text-muted">📍 Jump to Question:</h6>
        <div className="d-flex flex-wrap gap-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              className={`btn btn-sm ${
                current === index
                  ? "btn-primary"
                  : marked.includes(index)
                  ? "btn-warning"
                  : userAnswers[index]
                  ? "btn-success"
                  : "btn-outline-dark"
              }`}
              onClick={() => setCurrent(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
