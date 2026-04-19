const pool = require('../db/db');

const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const SLUG_LENGTH = 8;

function generateSlug() {
  let slug = '';
  for (let i = 0; i < SLUG_LENGTH; i++) {
    slug += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return slug;
}

async function createUniqueSlug() {
  let slug;
  let exists = true;

  while (exists) {
    slug = generateSlug();
    const result = await pool.query('SELECT id FROM short_links WHERE slug = $1', [slug]);
    exists = result.rows.length > 0;
  }

  return slug;
}

async function createShortLink(targetUrl, type) {
  const slug = await createUniqueSlug();
  await pool.query(
    'INSERT INTO short_links (slug, target_url, type) VALUES ($1, $2, $3)',
    [slug, targetUrl, type]
  );
  return slug;
}

async function resolveSlug(slug) {
  const result = await pool.query(
    'SELECT target_url, type FROM short_links WHERE slug = $1',
    [slug]
  );
  return result.rows[0] || null;
}

module.exports = { createShortLink, resolveSlug };
