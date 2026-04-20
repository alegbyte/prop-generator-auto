const { ShortLink } = require('../db/models');

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
    exists = await ShortLink.exists({ slug });
  }

  return slug;
}

async function createShortLink(targetUrl, type) {
  const slug = await createUniqueSlug();
  await ShortLink.create({ slug, target_url: targetUrl, type });
  return slug;
}

async function resolveSlug(slug) {
  return ShortLink.findOne({ slug }).lean();
}

module.exports = { createShortLink, resolveSlug };
