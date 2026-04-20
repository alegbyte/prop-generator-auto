const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  job_description: { type: String, required: true },
  proposal_text:   String,
  video_url:       String,
  pptx_path:       String,
  video_slug:      String,
  pptx_slug:       String,
  status: {
    type: String,
    enum: ['complete', 'video_processing', 'error'],
    default: 'complete',
  },
  created_at: { type: Date, default: Date.now },
});

const shortLinkSchema = new mongoose.Schema({
  slug:       { type: String, required: true, unique: true },
  target_url: { type: String, required: true },
  type:       { type: String, enum: ['video', 'pptx'], required: true },
  created_at: { type: Date, default: Date.now },
});

const Proposal  = mongoose.model('Proposal',  proposalSchema);
const ShortLink = mongoose.model('ShortLink', shortLinkSchema);

module.exports = { Proposal, ShortLink };
