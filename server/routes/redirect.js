const express = require('express');
const path = require('path');
const fs = require('fs');
const { resolveSlug } = require('../services/shortlink');

const router = express.Router();

// GET /v/:slug → redirect to HeyGen video URL
router.get('/v/:slug', async (req, res) => {
  const { slug } = req.params;
  const link = await resolveSlug(slug);

  if (!link || link.type !== 'video') {
    return res.status(404).send('Video link not found.');
  }

  return res.redirect(301, link.target_url);
});

// GET /p/:slug → serve .pptx file
router.get('/p/:slug', async (req, res) => {
  const { slug } = req.params;
  const link = await resolveSlug(slug);

  if (!link || link.type !== 'pptx') {
    return res.status(404).send('Presentation link not found.');
  }

  // The target_url is the full URL; extract the filename portion
  const url = new URL(link.target_url);
  const fileName = path.basename(url.pathname);
  const filePath = path.join(__dirname, '../public/files', fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found.');
  }

  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
  return res.sendFile(filePath);
});

module.exports = router;
