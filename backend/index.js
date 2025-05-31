// index.js

const express = require('express');
const cors = require('cors');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
require('dotenv').config();

// Initialize Firebase Admin SDK
initializeApp({
  credential: applicationDefault(),
});

const app = express();

// Configure CORS with specific options
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'https://airtimeplus-app.vercel.app',
    'https://airtimeplus.xyz',
    'https://airtimeplus-miniapp.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  credentials: false,
  maxAge: 86400
}));

app.use(express.json()); // Parse JSON bodies

// Root route
app.get('/', (req, res) => {
  res.send('<h1>Welcome to the AirtimePlus Backend API Server</h1>');
});

// Start server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
