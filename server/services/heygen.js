const axios = require('axios');

const HEYGEN_BASE = 'https://api.heygen.com';
const POLL_INTERVAL_MS = 5000;
const TIMEOUT_MS = 120000;

async function generateVideo(videoScript) {
  const response = await axios.post(
    `${HEYGEN_BASE}/v2/video/generate`,
    {
      video_inputs: [
        {
          character: {
            type: 'avatar',
            avatar_id: process.env.HEYGEN_AVATAR_ID,
            avatar_style: 'normal',
          },
          voice: {
            type: 'text',
            input_text: videoScript,
            voice_id: process.env.HEYGEN_VOICE_ID,
          },
        },
      ],
      dimension: { width: 1280, height: 720 },
    },
    {
      headers: {
        'X-Api-Key': process.env.HEYGEN_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );

  const videoId = response.data?.data?.video_id;
  if (!videoId) {
    throw new Error('HeyGen did not return a video_id');
  }
  return videoId;
}

async function pollVideoStatus(videoId) {
  const start = Date.now();

  while (Date.now() - start < TIMEOUT_MS) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const res = await axios.get(
      `${HEYGEN_BASE}/v1/video_status.get?video_id=${videoId}`,
      {
        headers: { 'X-Api-Key': process.env.HEYGEN_API_KEY },
      }
    );

    const data = res.data?.data;
    if (!data) continue;

    if (data.status === 'completed') {
      return data.video_url;
    }
    if (data.status === 'failed') {
      throw new Error(`HeyGen video failed: ${data.error || 'unknown error'}`);
    }
  }

  return null; // timed out
}

async function createHeyGenVideo(videoScript) {
  const videoId = await generateVideo(videoScript);
  const videoUrl = await pollVideoStatus(videoId);
  return videoUrl; // null if timed out
}

module.exports = { createHeyGenVideo };
