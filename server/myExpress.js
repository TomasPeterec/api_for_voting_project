const express = require('express');
const cors = require('cors');
const config = require('../config'); // Import config

const app = express();

const corsOptions = {
  origin: config.app.frontendUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

module.exports = app;
