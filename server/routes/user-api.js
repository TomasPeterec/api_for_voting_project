const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const authenticateToken = require('../authenticateToken');
const myKnex = require('../myKnex');

// Constants for HTTP status codes
const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const HTTP_SERVER_ERROR = 500;
const HTTP_CREATED = 201;

// Initialize Knex with the configuration
const db = myKnex;
const router = express.Router();

// Endpoint to get username
router.get('/username', authenticateToken, async (req, res) => {
  const userId = req.user.uid;

  try {
    const user = await db('users').where({ firebase_uid: userId }).first();
    if (user) {
      return res.status(HTTP_OK).json({ username: user.username });
    } else {
      return res.status(HTTP_NOT_FOUND).json({ error: 'User not found' });
    }
  } catch (err) {
    // Replace logger.error with console.error
    console.error('Error fetching username:', err);
    return res.status(HTTP_SERVER_ERROR).json({ error: 'Internal server error' });
  }
});

// Endpoint to set or update username
router.post('/set-username', authenticateToken, async (req, res) => {
  const { username } = req.body;
  const userId = req.user.uid;

  try {
    const [updatedUser] = await db('users').where({ firebase_uid: userId }).update({ username }).returning('*');

    if (updatedUser) {
      return res.status(HTTP_OK).json({ message: 'Username updated successfully', user: updatedUser });
    } else {
      const [newUser] = await db('users').returning('*').insert({ firebase_uid: userId, username });

      return res.status(HTTP_CREATED).json({ message: 'User created and username set', user: newUser });
    }
  } catch (err) {
    // Replace logger.error with console.error
    console.error('Database update error:', err);
    return res.status(HTTP_SERVER_ERROR).json({ error: 'Internal server error' });
  }
});

// Endpoint to register new user
router.post('/register', authenticateToken, async (req, res) => {
  const { firebase_uid, email } = req.body;

  try {
    const [newUser] = await db('users').returning('*').insert({ firebase_uid, email });

    return res.status(HTTP_CREATED).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    // Replace logger.error with console.error
    console.error('Database insert error:', err);
    return res.status(HTTP_SERVER_ERROR).json({ error: 'Internal server error' });
  }
});

module.exports = router;
