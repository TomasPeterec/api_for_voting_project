//config.js
/* eslint-disable no-process-env */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

// Centralized configuration
const config = {
  app: {
    port: process.env.PORT || 3001,
    frontendUrl: process.env.FRONTEND_URL,
    useHttps: process.env.USE_HTTPS === 'true',
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    caCertPath: process.env.CA_CERT_PATH,
  },
  ssl: {
    keyPath: process.env.SSL_KEY_PATH,
    certPath: process.env.SSL_CERT_PATH,
  },
  firebase: {
    apiKey: process.env.FIREBASE_APIKEY,
    authDomain: process.env.FIREBASE_AUTHDOMAIN,
    projectId: process.env.FIREBASE_PROJECTID,
    storageBucket: process.env.FIREBASE_STORAGEBUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID,
    appId: process.env.FIREBASE_APPID,
  },
};

module.exports = config;
