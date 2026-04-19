const express = require('express');
const rateLimit = require('express-rate-limit');
const { callGemini } = require('../services/gemini');
const { createHeyGenVideo } = require('../services/heygen');
const { generatePptx } = require('../services/pptxgen');
const { createShortLink } = require('../services/shortlink');
const pool = require('../db/db');

const router = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again in an hour.' },
});

router.post('/', limiter, async (req, res) => {
  const { jobDescription } = req.body;

  if (!jobDescription || typeof jobDescription !== 'string') {
    return res.status(400).json({ error: 'jobDescription is required.' });
  }

  const trimmed = jobDescription.trim();
  if (trimmed.length < 50) {
    return res.status(400).json({ error: 'Job description must be at least 50 characters.' });
  }

  let geminiData;
  try {
    geminiData = await callGemini(trimmed);
  } catch (err) {
    console.error('Gemini error:', err);
    return res.status(502).json({ error: 'Failed to generate proposal. Please try again.' });
  }

  const { proposalText, videoScript, slides } = geminiData;

  // Generate slug for pptx
  const pptxSlugRaw = Math.random().toString(36).slice(2, 10);
  let pptxPath;
  try {
    pptxPath = await generatePptx(slides, pptxSlugRaw);
  } catch (err) {
    console.error('PPTX error:', err);
    return res.status(500).json({ error: 'Failed to generate PowerPoint file.' });
  }

  const shortDomain = process.env.SHORT_DOMAIN || `http://localhost:${process.env.PORT || 3001}`;
  const pptxPublicUrl = `/p/${pptxSlugRaw}`; // serves file directly

  const pptxSlug = await createShortLink(`${shortDomain}/public/files/${pptxSlugRaw}.pptx`, 'pptx');

  // HeyGen video generation (non-blocking on timeout)
  let videoUrl = null;
  let videoSlug = null;
  let status = 'complete';

  try {
    videoUrl = await createHeyGenVideo(videoScript);
  } catch (err) {
    console.error('HeyGen error:', err);
  }

  if (videoUrl) {
    videoSlug = await createShortLink(videoUrl, 'video');
  } else {
    status = 'video_processing';
  }

  // Save to DB
  const dbResult = await pool.query(
    `INSERT INTO proposals
      (job_description, proposal_text, video_url, pptx_path, video_slug, pptx_slug, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [trimmed, proposalText, videoUrl, pptxPath, videoSlug, pptxSlug, status]
  );

  const videoShortLink = videoSlug ? `${shortDomain}/v/${videoSlug}` : null;
  const pptxShortLink = `${shortDomain}/p/${pptxSlug}`;

  return res.json({
    proposalText,
    videoShortLink,
    pptxShortLink,
    status,
    id: dbResult.rows[0].id,
  });
});

module.exports = router;
