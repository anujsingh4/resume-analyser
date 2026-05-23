const express                = require('express');
const router                 = express.Router();
const multer                 = require('multer');
const mammoth                = require('mammoth');
const path                   = require('path');
const { extractTextFromPDF } = require('../utils/pdfExtractor');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.doc'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'));
    }
  }
});

router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    let extractedText = '';

    if (ext === '.pdf') {
      extractedText = await extractTextFromPDF(req.file.buffer);
    } else if (ext === '.docx' || ext === '.doc') {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      extractedText = result.value;
    }

    if (!extractedText.trim()) {
      return res.status(422).json({ error: 'Could not extract text from file.' });
    }

    res.json({
      message        : 'Resume uploaded successfully',
      filename       : req.file.originalname,
      characterCount : extractedText.length,
      text           : extractedText
    });

  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: err.message || 'Something went wrong' });
  }
});

module.exports = router;