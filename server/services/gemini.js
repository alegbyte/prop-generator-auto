const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION =
  'You are an expert Upwork freelancer who writes highly persuasive, personalized proposals. Always respond with valid JSON only — no markdown, no explanation.';

function buildPrompt(jobDescription) {
  return `Given this Upwork job description, generate:
1. A persuasive proposal (150-250 words, human tone, no filler phrases)
2. A 60-second spoken video script summarizing the proposal warmly
3. Content for 5 PowerPoint slides: Title, Problem Understanding, Proposed Solution, Why Me, Call to Action

Return ONLY this JSON structure:
{
  "proposalText": "...",
  "videoScript": "...",
  "slides": [
    { "title": "...", "bullets": ["...", "...", "..."] },
    { "title": "...", "bullets": ["...", "...", "..."] },
    { "title": "...", "bullets": ["...", "...", "..."] },
    { "title": "...", "bullets": ["...", "...", "..."] },
    { "title": "...", "bullets": ["...", "...", "..."] }
  ]
}

Job Description:
${jobDescription}`;
}

function stripMarkdownFences(text) {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

async function callGemini(jobDescription) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const result = await model.generateContent(buildPrompt(jobDescription));
  const raw = result.response.text();
  const cleaned = stripMarkdownFences(raw);

  try {
    return JSON.parse(cleaned);
  } catch {
    // Retry once
    const retry = await model.generateContent(buildPrompt(jobDescription));
    const retryRaw = retry.response.text();
    const retryCleaned = stripMarkdownFences(retryRaw);
    return JSON.parse(retryCleaned);
  }
}

module.exports = { callGemini };
