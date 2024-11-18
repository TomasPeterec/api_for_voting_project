const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { v4: uuidv4 } = require('uuid'); // Import the v4 UUID function from uuid

const authenticateToken = require('../authenticateToken');
const myKnex = require('../myKnex');

// Initialize Knex with the configuration
const db = myKnex;
const router = express.Router();

// HTTP Status Codes
const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_SERVER_ERROR = 500;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;
const NO_AFFECTED_ROWS = 0; // Added constant for better clarity

// Helper function to send error responses
const sendErrorResponse = (res, errorCode, message) => {
  console.error(message);
  res.status(errorCode).json({ error: message });
};

// Endpoint to get subset of voting data
router.get('/subset', authenticateToken, async (req, res) => {
  const { uid: userId } = req.user;

  try {
    const results = await db('list_of_votings').where({ id_of_user: userId }).select('name_of_voting', 'lov_id');

    return res.status(HTTP_OK).json({ results }); // Ensure this line is executed before returning
  } catch (err) {
    sendErrorResponse(res, HTTP_SERVER_ERROR, 'Error fetching data: ' + err.message);
    return; // Explicit return after sending response
  }
  // Return ensures no other code executes
  return;
});

// Endpoint to insert a new voting item
router.post('/insert', authenticateToken, async (req, res) => {
  const { uid: userId } = req.user;
  const { name_of_voting } = req.body;

  const lov_id = uuidv4();

  try {
    await db('list_of_votings').insert({
      id_of_user: userId,
      lov_id,
      name_of_voting,
    });

    return res.status(HTTP_CREATED).json({
      message: 'New voting item added successfully',
      lov_id,
    });
  } catch (err) {
    if (err.code === '23505') {
      return sendErrorResponse(res, HTTP_CONFLICT, 'Voting item already exists');
    }
    sendErrorResponse(res, HTTP_SERVER_ERROR, 'Error inserting data: ' + err.message);
    return; // Explicit return after sending response
  }
  // Return ensures no other code executes
  return;
});

// Endpoint to delete a voting item
router.delete('/delete', authenticateToken, async (req, res) => {
  const { uid: _userId } = req.user; // User ID is not needed here
  const { lov_id } = req.body;

  try {
    const result = await db('list_of_votings').where({ lov_id }).del();

    if (result === NO_AFFECTED_ROWS) {
      return sendErrorResponse(res, HTTP_NOT_FOUND, 'Voting item not found');
    }

    return res.status(HTTP_OK).send();
  } catch (err) {
    sendErrorResponse(res, HTTP_SERVER_ERROR, 'Error deleting data: ' + err.message);
    return; // Explicit return after sending response
  }
  // Return ensures no other code executes
  return;
});

// Export the router instance using module.exports
module.exports = router;
