import { useMemo } from "react";

export default function SessionsView({
  sessions,
  loading,
  error,
  onSelect,
  onBack,
  onDelete,
}) {
  const formatted = useMemo(() => {
    return sessions.map((s) => ({
      ...s,
      when: s.timestamp ? new Date(s.timestamp).toLocaleString() : "-",
    }));
  }, [sessions]);

  return (
    <div className="question-screen">
      <div className="question-card">
        <div className="question-header">
          <div className="question-label">SESSION HISTORY</div>
          <p className="question-hint">
            Load a past question + council run to replay the reasoning steps.
          </p>
        </div>

        {loading ? (
          <div style={{ padding: "2rem 0" }}>Loading sessions…</div>
        ) : error ? (
          <div className="error-banner">
            <span className="error-tag">ERROR</span> {error}
          </div>
        ) : formatted.length === 0 ? (
          <div style={{ padding: "1.5rem 0", color: "var(--text2)" }}>
            No sessions found yet. Run a question to create one.
          </div>
        ) : (
          <div className="sample-list">
            {formatted.map((session) => (
              <div key={session.session_id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button
                  className="sample-btn"
                  onClick={() => onSelect(session.session_id)}
                  style={{ flex: 1 }}
                >
                  <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                    <span style={{ fontWeight: 600, color: "var(--text)" }}>
                      {session.question}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text3)" }}>
                      {session.when}
                    </span>
                  </div>
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => onDelete(session.session_id)}
                  style={{ fontSize: "0.7rem", padding: "0.5rem", minWidth: "auto" }}
                  title="Delete session"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="question-actions" style={{ marginTop: "1.25rem" }}>
          <button className="btn-ghost" onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
