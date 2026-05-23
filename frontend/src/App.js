import { useState } from 'react';
import './App.css';

function ScoreRing({ score }) {
  const radius       = 54;
  const stroke       = 10;
  const circumference = 2 * Math.PI * radius;
  const offset       = circumference - (score / 100) * circumference;
  const color        = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="score-ring-wrap">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke}/>
        <circle
          cx="65" cy="65" r={radius} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="65" y="60" textAnchor="middle" fontSize="26" fontWeight="700" fill={color}>{score}%</text>
        <text x="65" y="78" textAnchor="middle" fontSize="11" fill="#888">match</text>
      </svg>
      <p className="score-label">
        {score >= 70 ? '🟢 Strong match' : score >= 40 ? '🟡 Partial match' : '🔴 Low match'}
      </p>
    </div>
  );
}

function Pill({ word, type }) {
  return <span className={`pill pill-${type}`}>{word}</span>;
}

function ImportanceBadge({ level }) {
  const colors = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };
  return <span className={`badge ${colors[level] || 'badge-low'}`}>{level}</span>;
}

export default function App() {
  const [file,           setFile]           = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading,        setLoading]        = useState(false);
  const [result,         setResult]         = useState(null);
  const [error,          setError]          = useState('');
  const [dragOver,       setDragOver]       = useState(false);
  const [activeTab,      setActiveTab]      = useState('matched');
  const [aiTab,          setAiTab]          = useState('summary');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    setFile(e.dataTransfer.files[0]);
    setResult(null);
    setError('');
  };

  const handleAnalyse = async () => {
    if (!file)                  return setError('Please upload your resume.');
    if (!jobDescription.trim()) return setError('Please paste a job description.');

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    try {
      const res  = await fetch('http://localhost:8080/api/ai-analyse', {
        method: 'POST',
        body  : formData
      });
      const data = await res.json();

      if (!res.ok) setError(data.error || 'Something went wrong.');
      else         setResult(data);
    } catch {
      setError('Cannot connect to server. Is your backend running on port 8080?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Resume Analyser</h1>
        <p>Upload your resume and paste a job description to get AI-powered feedback</p>
      </header>

      <main className="app-main">

        {/* Upload zone */}
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="upload-icon">📄</div>
          {file
            ? <p className="file-name">✅ {file.name}</p>
            : <p>Drag and drop your resume here</p>
          }
          <label className="browse-btn">
            {file ? 'Change file' : 'Browse file'}
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} style={{ display: 'none' }}/>
          </label>
          <p className="upload-hint">PDF, DOC, DOCX · Max 5MB</p>
        </div>

        {/* Job description */}
        <div className="jd-section">
          <label className="jd-label">Job description</label>
          <textarea
            className="jd-textarea"
            rows={8}
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <p className="jd-hint">{jobDescription.length} characters · minimum 50</p>
        </div>

        {error && <div className="error-box">⚠️ {error}</div>}

        <button className="upload-btn" onClick={handleAnalyse} disabled={loading}>
          {loading ? (
            <span className="loading-text">
              <span className="spinner"/> Analysing with AI — this takes ~15 seconds...
            </span>
          ) : 'Analyse My Resume →'}
        </button>

        {/* Results */}
        {result && (
          <div className="result-box">

            {/* Score header */}
            <div className="result-header">
              <ScoreRing score={result.matchResult.score} />
              <div className="result-stats">
                <h2>Match Report</h2>
                <p>📁 {result.filename}</p>
                <div className="stats-grid">
                  <div className="stat">
                    <span className="stat-num">{result.matchResult.totalJobKeywords}</span>
                    <span className="stat-label">Keywords in JD</span>
                  </div>
                  <div className="stat">
                    <span className="stat-num matched-num">{result.matchResult.matchedCount}</span>
                    <span className="stat-label">Matched</span>
                  </div>
                  <div className="stat">
                    <span className="stat-num missing-num">{result.matchResult.missingCount}</span>
                    <span className="stat-label">Missing</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Keyword tabs */}
            <div className="tabs">
              <button className={`tab ${activeTab === 'matched' ? 'active' : ''}`} onClick={() => setActiveTab('matched')}>
                ✅ Matched keywords
              </button>
              <button className={`tab ${activeTab === 'missing' ? 'active' : ''}`} onClick={() => setActiveTab('missing')}>
                ❌ Missing keywords
              </button>
            </div>
            <div className="pill-list">
              {activeTab === 'matched'
                ? result.matchResult.topMatched.map(w => <Pill key={w} word={w} type="matched"/>)
                : result.matchResult.topMissing.map(w => <Pill key={w} word={w} type="missing"/>)
              }
            </div>

            {/* AI section */}
            {result.aiResult && (
              <div className="ai-section">
                <div className="ai-header">
                  <span className="ai-badge">✨ AI Analysis</span>
                  <span className={`verdict verdict-${result.aiResult.fitVerdict?.replace(/\s+/g, '-').toLowerCase()}`}>
                    {result.aiResult.fitVerdict}
                  </span>
                </div>

                {/* AI tabs */}
                <div className="tabs">
                  <button className={`tab ${aiTab === 'summary'      ? 'active' : ''}`} onClick={() => setAiTab('summary')}>Summary</button>
                  <button className={`tab ${aiTab === 'gaps'         ? 'active' : ''}`} onClick={() => setAiTab('gaps')}>Skill Gaps</button>
                  <button className={`tab ${aiTab === 'improvements' ? 'active' : ''}`} onClick={() => setAiTab('improvements')}>Improvements</button>
                </div>

                {/* Summary tab */}
                {aiTab === 'summary' && (
                  <div className="ai-content">
                    <p className="ai-summary">{result.aiResult.overallSummary}</p>
                    <div className="two-col">
                      <div>
                        <h4>💪 Strengths</h4>
                        <ul className="ai-list">
                          {result.aiResult.strengthAreas?.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4>⚠️ Gaps</h4>
                        <ul className="ai-list gap-list">
                          {result.aiResult.gapAreas?.map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Skill gaps tab */}
                {aiTab === 'gaps' && (
                  <div className="ai-content">
                    {result.aiResult.missingSkills?.map((skill, i) => (
                      <div key={i} className="skill-card">
                        <div className="skill-card-header">
                          <span className="skill-name">{skill.skill}</span>
                          <ImportanceBadge level={skill.importance} />
                        </div>
                        <p className="skill-suggestion">{skill.suggestion}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Improvements tab */}
                {aiTab === 'improvements' && (
                  <div className="ai-content">
                    {result.aiResult.resumeImprovements?.map((item, i) => (
                      <div key={i} className="improvement-card">
                        <span className="improvement-section">{item.section}</span>
                        <p className="improvement-text">{item.suggestion}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {result.matchResult.topMissing.length > 0 && (
              <div className="tip-box">
                💡 <strong>Tip:</strong> Add the missing keywords naturally into your resume where they genuinely apply.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}