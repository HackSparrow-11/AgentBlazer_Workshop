import { useState } from "react";
import QuestionInput from "./components/QuestionInput";
import StageView from "./components/StageView";
import SessionsView from "./components/SessionsView";
import "./index.css";

export default function App() {
  const [stage, setStage] = useState(0);
  const [question, setQuestion] = useState("");
  const [stage1Data, setStage1Data] = useState(null);
  const [stage2Data, setStage2Data] = useState(null);
  const [stage3Data, setStage3Data] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  

  const [view, setView] = useState("question"); // "question" | "sessions"
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  const BASE = "http://localhost:8000";

  async function handleSubmit(q, selectedModels) {
    setQuestion(q);
    setError(null);
    setLoading(true);
    setStage(1);
    try {
      const r = await fetch(`${BASE}/stage1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, selected_models: selectedModels }),
      });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      setStage1Data(data.responses);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStage2() {
    setError(null);
    setLoading(true);
    setStage(2);
    try {
      const r = await fetch(`${BASE}/stage2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, responses: stage1Data }),
      });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      setStage2Data(data.reviews);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStage3() {
    setError(null);
    setLoading(true);
    setStage(3);
    try {
      const r = await fetch(`${BASE}/stage3`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, responses: stage1Data, reviews: stage2Data }),
      });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      setStage3Data(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setStage(0);
    setQuestion("");
    setStage1Data(null);
    setStage2Data(null);
    setStage3Data(null);
    setError(null);
    setView("question");
    setSessionLoaded(false);
  }

  async function loadSessions() {
    setSessionsError(null);
    setSessionsLoading(true);
    setView("sessions");

    try {
      const r = await fetch(`${BASE}/sessions`);
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      setSessions(data);
    } catch (e) {
      setSessionsError(e.message);
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }

  async function loadSession(sessionId) {
    setError(null);
    setLoading(true);

    try {
      const r = await fetch(`${BASE}/sessions/${sessionId}`);
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();

      setQuestion(data.question);
      setStage1Data(data.stage1);
      setStage2Data(data.stage2);
      setStage3Data(data.stage3);
      setStage(1);
      setSessionLoaded(true);
      setView("question");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteSession(sessionId) {
    try {
      const r = await fetch(`${BASE}/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (!r.ok) throw new Error(await r.text());
      // Reload sessions after deletion
      await loadSessions();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-bracket">[</span>
            <span className="logo-text">LLM COUNCIL</span>
            <span className="logo-bracket">]</span>
          </div>
          <p className="tagline">Multi-model reasoning — step by step</p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {view === "sessions" ? (
            <button className="btn-ghost" onClick={() => setView("question")}>Back</button>
          ) : (
            <button className="btn-ghost" onClick={loadSessions}>History</button>
          )}

          {stage > 0 && view === "question" && (
            <div className="stage-indicator">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`stage-pip ${stage >= s ? "active" : ""} ${stage === s && loading ? "pulsing" : ""}`}>
                  <span className="pip-num">{s}</span>
                  <span className="pip-label">{["Opinions", "Review", "Verdict"][s - 1]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="main">
        {error && (
          <div className="error-banner">
            <span className="error-tag">ERROR</span> {error}
          </div>
        )}
        {view === "sessions" ? (
          <SessionsView
            sessions={sessions}
            loading={sessionsLoading}
            error={sessionsError}
            onSelect={loadSession}
            onDelete={deleteSession}
            onBack={() => setView("question")}
          />
        ) : stage === 0 ? (
          <QuestionInput onSubmit={handleSubmit} />
        ) : (
          <StageView
            stage={stage}
            loading={loading}
            question={question}
            stage1Data={stage1Data}
            stage2Data={stage2Data}
            stage3Data={stage3Data}
            onNext={sessionLoaded
              ? () => setStage((s) => Math.min(3, s + 1))
              : stage === 1 && !loading && stage1Data
              ? handleStage2
              : stage === 2 && !loading && stage2Data
              ? handleStage3
              : null}
            onReset={handleReset}
          />
        )}
      </main>

      <footer className="footer">
        <span>AgentBlazer Workshop</span>
        <span className="footer-sep">·</span>
        <span>LLaMA 70B · Compound Beta · Mistral</span>
      </footer>
    </div>
  );
}