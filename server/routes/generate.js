const express = require('express');
const rateLimit = require('express-rate-limit');
const { callGemini } = require('../services/gemini');
const { createHeyGenVideo } = require('../services/heygen');
const { generatePptx } = require('../services/pptxgen');
const { createShortLink } = require('../services/shortlink');
const { Proposal } = require('../db/models');

const router = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
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

  const pptxSlugRaw = Math.random().toString(36).slice(2, 10);
  let pptxPath;
  try {
    pptxPath = await generatePptx(slides, pptxSlugRaw);
  } catch (err) {
    console.error('PPTX error:', err);
    return res.status(500).json({ error: 'Failed to generate PowerPoint file.' });
  }

  const shortDomain = process.env.SHORT_DOMAIN || `http://localhost:${process.env.PORT || 3001}`;
  const pptxSlug = await createShortLink(`${shortDomain}/public/files/${pptxSlugRaw}.pptx`, 'pptx');

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

  const saved = await Proposal.create({
    job_description: trimmed,
    proposal_text:   proposalText,
    video_url:       videoUrl,
    pptx_path:       pptxPath,
    video_slug:      videoSlug,
    pptx_slug:       pptxSlug,
    status,
  });

  const videoShortLink = videoSlug ? `${shortDomain}/v/${videoSlug}` : null;
  const pptxShortLink  = `${shortDomain}/p/${pptxSlug}`;

  return res.json({
    proposalText,
    videoShortLink,
    pptxShortLink,
    status,
    id: saved._id,
  });
});

module.exports = router;
