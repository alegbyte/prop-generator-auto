@ -1,187 +1 @@
# Upwork Proposal Generator

A full-stack web app that turns any Upwork job description into a polished proposal, a PowerPoint slide deck, and a personalized HeyGen avatar video — all in under 2 minutes.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Node.js + Express |
| Database | PostgreSQL (via `pg`) |
| AI text | Google Gemini 2.0 Flash |
| AI video | HeyGen API |
| Slides | pptxgenjs (server-side) |
| Short links | Custom slug table in PostgreSQL |

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (running locally or remote)
- A Google Gemini API key
- A HeyGen API key with an avatar and voice configured

---

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo>
cd prop-generator-auto

# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 2. Configure environment variables

```bash
cd server
cp .env.example .env
# Edit .env with your actual keys
```

**All required variables** (see `.env.example` for comments):

| Variable | Where to get it |
|---|---|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `HEYGEN_API_KEY` | [HeyGen Settings → API](https://app.heygen.com/settings?nav=API) |
| `HEYGEN_AVATAR_ID` | [HeyGen Avatars list](https://docs.heygen.com/reference/list-avatars-v2) or your dashboard |
| `HEYGEN_VOICE_ID` | [HeyGen Voices list](https://docs.heygen.com/reference/list-voices-v2) |
| `SHORT_DOMAIN` | Your public server URL, e.g. `https://go.yourdomain.com` |
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Server port (default: `3001`) |

### 3. Set up the database

```bash
# Create the database
createdb proposals_db

# Run schema
psql proposals_db < server/db/schema.sql
```

### 4. Run locally

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Custom Domain Setup (Short Links)

To use `go.yourdomain.com` for short links:

1. Point the DNS A record for `go.yourdomain.com` to your server's IP.
2. Set `SHORT_DOMAIN=https://go.yourdomain.com` in your `.env`.
3. Configure your reverse proxy (nginx/caddy) to forward all traffic to the Express server:

**Nginx example:**
```nginx
server {
    listen 80;
    server_name go.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Short links take the form:
- `go.yourdomain.com/v/<slug>` → HeyGen video
- `go.yourdomain.com/p/<slug>` → Download PowerPoint

---

## Production Build

```bash
# Build the frontend
cd client && npm run build

# Serve static files from Express (add to server/index.js if needed):
# app.use(express.static(path.join(__dirname, '../client/dist')));

# Start the server
cd server && npm start
```

---

## API Reference

### `POST /api/generate`

**Body:**
```json
{ "jobDescription": "..." }
```

**Response:**
```json
{
  "proposalText": "...",
  "videoShortLink": "https://go.yourdomain.com/v/abc12345",
  "pptxShortLink": "https://go.yourdomain.com/p/xyz98765",
  "status": "complete"
}
```

`status` values:
- `complete` — proposal + slides + video all ready
- `video_processing` — HeyGen timed out; proposal + slides are ready

**Rate limit:** 5 requests per IP per hour.

### `GET /v/:slug` → 301 redirect to video URL
### `GET /p/:slug` → Download `.pptx` file

---

## Project Structure

```
/client              React + Vite frontend
  /src
    /components
      JobForm.jsx
      GeneratingSteps.jsx
      ProposalResult.jsx
    App.jsx

/server
  /routes
    generate.js      POST /api/generate
    redirect.js      GET /v/:slug, /p/:slug
  /services
    gemini.js        Gemini API + JSON parsing
    heygen.js        HeyGen video generation + polling
    pptxgen.js       PowerPoint rendering
    shortlink.js     Slug generation + DB
  /db
    schema.sql       CREATE TABLE statements
    db.js            pg Pool
  /public/files      Generated .pptx files (auto-created)
  index.js
  .env.example
```
