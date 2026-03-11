import { useState } from "react";
import QuestionInput from "./components/QuestionInput";
import StageView from "./components/StageView";
import "./index.css";

export default function App() {
  const [stage, setStage] = useState(0);
  const [question, setQuestion] = useState("");
  const [stage1Data, setStage1Data] = useState(null);
  const [stage2Data, setStage2Data] = useState(null);
  const [stage3Data, setStage3Data] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASE = "http://localhost:8000";

  async function handleSubmit(q) {
    setQuestion(q);
    setError(null);
    setLoading(true);
    setStage(1);
    try {
      const r = await fetch(`${BASE}/stage1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
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
        {stage > 0 && (
          <div className="stage-indicator">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`stage-pip ${stage >= s ? "active" : ""} ${stage === s && loading ? "pulsing" : ""}`}>
                <span className="pip-num">{s}</span>
                <span className="pip-label">{["Opinions", "Review", "Verdict"][s - 1]}</span>
              </div>
            ))}
          </div>
        )}
      </header>

      <main className="main">
        {error && (
          <div className="error-banner">
            <span className="error-tag">ERROR</span> {error}
          </div>
        )}
        {stage === 0 && <QuestionInput onSubmit={handleSubmit} />}
        {stage >= 1 && (
          <StageView
            stage={stage}
            loading={loading}
            question={question}
            stage1Data={stage1Data}
            stage2Data={stage2Data}
            stage3Data={stage3Data}
            onNext={stage === 1 && !loading && stage1Data ? handleStage2
                  : stage === 2 && !loading && stage2Data ? handleStage3
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