const express                = require('express');
const router                 = express.Router();
const multer                 = require('multer');
const mammoth                = require('mammoth');
const path                   = require('path');
const { extractTextFromPDF } = require('../utils/pdfExtractor');
const { matchKeywords }      = require('../utils/keywordMatcher');
const { analyseWithAI }      = require('../utils/aiAnalyser');

const upload = multer({
  storage: multer.memoryStorage(),
  limits : { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.doc'];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error('Only PDF and Word files allowed'));
  }
});

// POST /api/ai-analyse
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

    // Run keyword matching first
    const matchResult = matchKeywords(resumeText, jobDescription);

    // Run AI analysis
    console.log('Sending to OpenAI...');
    const aiResult = await analyseWithAI(resumeText, jobDescription, matchResult);
    console.log('AI analysis complete!');

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