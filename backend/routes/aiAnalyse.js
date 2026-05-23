const express                = require('express');
const router                 = express.Router();
const multer                 = require('multer');
const mammoth                = require('mammoth');
const path                   = require('path');
const { extractTextFromPDF } = require('../utils/pdfExtractor');
const { matchKeywords }      = require('../utils/keywordMatcher');
const { analyseWithAI }      = require('../utils/aiAnalyser');
const db                     = require('../utils/db');

const upload = multer({
  storage: multer.memoryStorage(),
  limits : { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.doc'];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error('Only PDF and Word files allowed'));
  }
});

router.post('/ai-analyse', upload.single('resume'), async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a resume file.' });
    }
    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({ error: 'Please provide a job description (at least 50 characters).' });
    }

    // Extract resume text
    const ext = path.extname(req.file.originalname).toLowerCase();
    let resumeText = '';

    if (ext === '.pdf') {
      resumeText = await extractTextFromPDF(req.file.buffer);
    } else {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      resumeText = result.value;
    }

    if (!resumeText.trim()) {
      return res.status(422).json({ error: 'Could not read text from your resume.' });
    }

    // Keyword matching
    const matchResult = matchKeywords(resumeText, jobDescription);

    // AI analysis
    console.log('Calling OpenAI API...');
    const aiResult = await analyseWithAI(resumeText, jobDescription, matchResult);
    console.log('AI analysis complete!');

    // Save to database
    await db.query(
      `INSERT INTO analyses (
        filename, match_score, matched_count, missing_count,
        top_matched, top_missing, ai_summary, fit_verdict,
        strength_areas, gap_areas, missing_skills,
        resume_improvements, job_description_preview
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        req.file.originalname,
        matchResult.score,
        matchResult.matchedCount,
        matchResult.missingCount,
        matchResult.topMatched,
        matchResult.topMissing,
        aiResult.overallSummary,
        aiResult.fitVerdict,
        aiResult.strengthAreas,
        aiResult.gapAreas,
        JSON.stringify(aiResult.missingSkills),
        JSON.stringify(aiResult.resumeImprovements),
        jobDescription.slice(0, 200)
      ]
    );

    console.log('Saved to database!');

    res.json({
      filename   : req.file.originalname,
      matchResult,
      aiResult
    });

  } catch (err) {
    console.error('=== AI ANALYSE ERROR ===');
    console.error(err.message);
    res.status(500).json({ error: err.message || 'Something went wrong.' });
  }
});

module.exports = router;