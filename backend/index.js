const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// Configure CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://gameguru-delta.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  credentials: false,
  maxAge: 86400
}));

app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('<h1>Welcome to the Game Guru Backend API Server</h1>');
});

// GET /football-questions?count=10
app.get('/football-questions', (req, res) => {
  const filePath = path.join(__dirname, 'soccer_questions.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading questions:', err);
      return res.status(500).json({ error: 'Failed to load questions' });
    }

    try {
      const questions = JSON.parse(data);
      const count = parseInt(req.query.count) || 10;

      // Shuffle and slice random questions
      const shuffled = questions.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, count);

      res.json(selected);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      res.status(500).json({ error: 'Invalid questions format' });
    }
  });
});

// Start server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
