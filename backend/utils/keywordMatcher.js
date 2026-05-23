// Common English words to ignore (stop words)
const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'by','from','is','are','was','were','be','been','being','have','has',
  'had','do','does','did','will','would','could','should','may','might',
  'i','me','my','we','our','you','your','they','their','it','its',
  'this','that','these','those','as','if','then','than','so','yet',
  'both','either','not','no','nor','such','also','just','about','above',
  'after','before','between','into','through','during','over','under'
]);

// Extract meaningful keywords from text
function extractKeywords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s+#]/g, ' ')  // keep letters, numbers, + and #
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

// Count how often each keyword appears
function getKeywordFrequency(keywords) {
  const freq = {};
  for (const word of keywords) {
    freq[word] = (freq[word] || 0) + 1;
  }
  return freq;
}

// Main matching function
function matchKeywords(resumeText, jobText) {
  const resumeKeywords = extractKeywords(resumeText);
  const jobKeywords    = extractKeywords(jobText);

  const resumeFreq = getKeywordFrequency(resumeKeywords);
  const jobFreq    = getKeywordFrequency(jobKeywords);

  const jobUniqueKeywords = Object.keys(jobFreq);

  const matched  = [];
  const missing  = [];

  for (const keyword of jobUniqueKeywords) {
    if (resumeFreq[keyword]) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  const score = jobUniqueKeywords.length > 0
    ? Math.round((matched.length / jobUniqueKeywords.length) * 100)
    : 0;

  // Top missing keywords sorted by how often they appear in the job description
  const topMissing = missing
    .sort((a, b) => jobFreq[b] - jobFreq[a])
    .slice(0, 20);

  // Top matched keywords
  const topMatched = matched
    .sort((a, b) => jobFreq[b] - jobFreq[a])
    .slice(0, 20);

  return {
    score,
    totalJobKeywords : jobUniqueKeywords.length,
    matchedCount     : matched.length,
    missingCount     : missing.length,
    topMatched,
    topMissing
  };
}

module.exports = { matchKeywords };