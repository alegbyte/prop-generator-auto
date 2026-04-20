require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db/db');

const generateRouter = require('./routes/generate');
const redirectRouter = require('./routes/redirect');

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.use('/public/files', express.static(path.join(__dirname, 'public/files')));

app.use('/api/generate', generateRouter);
app.use('/', redirectRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});
