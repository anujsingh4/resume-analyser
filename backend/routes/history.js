const express = require('express');
const router  = express.Router();
const db      = require('../utils/db');

// GET /api/history — get all past analyses
router.get('/history', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, filename, match_score, matched_count, missing_count,
              fit_verdict, ai_summary, job_description_preview, created_at
       FROM analyses
       ORDER BY created_at DESC
       LIMIT 20`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('History error:', err.message);
    res.status(500).json({ error: 'Could not fetch history.' });
  }
});

// GET /api/history/:id — get one full analysis
router.get('/history/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM analyses WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Analysis not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('History detail error:', err.message);
    res.status(500).json({ error: 'Could not fetch analysis.' });
  }
});

module.exports = router;