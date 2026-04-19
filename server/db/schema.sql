-- Upwork Proposal Generator DB Schema

CREATE TABLE IF NOT EXISTS proposals (
  id SERIAL PRIMARY KEY,
  job_description TEXT NOT NULL,
  proposal_text TEXT,
  video_url TEXT,
  pptx_path TEXT,
  video_slug VARCHAR(16),
  pptx_slug VARCHAR(16),
  status VARCHAR(20) DEFAULT 'complete' CHECK (status IN ('complete', 'video_processing', 'error')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS short_links (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(16) UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('video', 'pptx')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_short_links_slug ON short_links(slug);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals(created_at DESC);
