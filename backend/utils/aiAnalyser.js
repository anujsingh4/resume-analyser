require('dotenv').config();
const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000,      // 30 second timeout
  maxRetries: 1
});

async function analyseWithAI(resumeText, jobDescription, matchResult) {
  const prompt = `
You are an expert career coach and resume analyst.

Analyse the following resume against the job description and provide detailed feedback.

=== RESUME ===
${resumeText.slice(0, 2000)}

=== JOB DESCRIPTION ===
${jobDescription.slice(0, 1500)}

=== KEYWORD MATCH SUMMARY ===
- Match Score: ${matchResult.score}%
- Matched Keywords: ${matchResult.topMatched.slice(0, 10).join(', ')}
- Missing Keywords: ${matchResult.topMissing.slice(0, 10).join(', ')}

Respond ONLY with this exact JSON format, no extra text:
{
  "overallSummary": "2-3 sentence summary of how well this resume matches the job",
  "strengthAreas": ["strength 1", "strength 2", "strength 3"],
  "gapAreas": ["gap 1", "gap 2", "gap 3"],
  "missingSkills": [
    {
      "skill": "skill name",
      "importance": "high",
      "suggestion": "how to address this gap"
    }
  ],
  "resumeImprovements": [
    {
      "section": "section name",
      "suggestion": "specific improvement suggestion"
    }
  ],
  "fitVerdict": "Strong Fit"
}
`;

  console.log('Calling OpenAI API...');

  const response = await client.chat.completions.create({
    model      : 'gpt-4o-mini',
    messages   : [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens : 1000
  });

  console.log('OpenAI response received!');

  const raw     = response.choices[0].message.content.trim();
  const cleaned = raw.replace(/```json|```/g, '').trim();

  return JSON.parse(cleaned);
}

module.exports = { analyseWithAI };