import { useState, useEffect } from 'react';

function VerdictBadge({ verdict }) {
  const map = {
    'Strong Fit'  : 'verdict-strong-fit',
    'Moderate Fit': 'verdict-moderate-fit',
    'Weak Fit'    : 'verdict-weak-fit'
  };
  return <span className={`verdict ${map[verdict] || 'verdict-moderate-fit'}`}>{verdict}</span>;
}

export default function History({ onBack }) {
  const [analyses, setAnalyses] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/api/history')
      .then(res => res.json())
      .then(data => {
        setAnalyses(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load history.');
        setLoading(false);
      });
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day  : 'numeric',
      month: 'short',
      year : 'numeric',
      hour : '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Analysis History</h1>
        <p>Your past resume analyses</p>
      </header>

      <main className="app-main">
        <button className="back-btn" onClick={onBack}>
          ← Back to Analyser
        </button>

        {loading && <p style={{ textAlign: 'center', color: '#888' }}>Loading history...</p>}
        {error   && <div className="error-box">⚠️ {error}</div>}

        {!loading && analyses.length === 0 && (
          <div className="empty-state">
            <p>📭 No analyses yet.</p>
            <p>Go back and analyse your first resume!</p>
          </div>
        )}

        {analyses.map(a => (
          <div key={a.id} className="history-card">
            <div className="history-card-header">
              <div>
                <p className="history-filename">📄 {a.filename}</p>
                <p className="history-date">{formatDate(a.created_at)}</p>
              </div>
              <div className="history-right">
                <span className="history-score" style={{
                  color: a.match_score >= 70 ? '#16a34a' : a.match_score >= 40 ? '#d97706' : '#dc2626'
                }}>
                  {a.match_score}%
                </span>
                <VerdictBadge verdict={a.fit_verdict} />
              </div>
            </div>

            <p className="history-summary">{a.ai_summary}</p>

            <div className="history-stats">
              <span>✅ {a.matched_count} matched</span>
              <span>❌ {a.missing_count} missing</span>
            </div>

            {a.job_description_preview && (
              <p className="history-jd-preview">
                📋 {a.job_description_preview}...
              </p>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}