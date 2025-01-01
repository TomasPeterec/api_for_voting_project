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

// Endpoint to delete a list
router.delete('/:emailListId', authenticateToken, async (req, res) => {
  const emailListId = req.params.emailListId; // Extracting voting ID from URL parameters
  const { uid: userId } = req.user;

  try {
    // Delete list from the database based on voting_id and list_id
    const result = await db('list_of_emaillists')
      .where({ user_id: userId, list_id: emailListId }) // Use `voting_id` and `list_id` to identify the row
      .del(); // Delete the row

    const result2 = await db('emails')
      .where({ list_id: emailListId }) // Use `voting_id` and `list_id` to identify the row
      .del(); // Delete the row

    // Check if the delete was successful
    if (result && result2) {
      return res.status(200).json({
        message: 'list deleted successfully',
        emailListId: emailListId,
      });
    } else {
      return res.status(404).json({ error: 'list not found or already deleted' });
    }
  } catch (err) {
    console.error('Error deleting list:', err.message);
    return res.status(500).json({ error: 'Error deleting list: ' + err.message });
  }
});

// Endpoint to insert a new maillist
router.post('/', authenticateToken, async (req, res) => {
  const { uid: userId } = req.user;
  const { nameOfEmaillist, mails } = req.body;

  const lovId = uuidv4();

  try {
    await db('list_of_emaillists').insert({
      user_id: userId,
      list_name: nameOfEmaillist,
      list_id: lovId,
    });

    const tempList = mails.map((email) => ({
      mail_id: uuidv4(),
      list_id: lovId,
      mail: email,
    }));

    await db('emails').insert(tempList);

    return res.status(HTTP_CREATED).json({
      message: 'New voting item added successfully',
      lovId,
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

router.get('/', authenticateToken, async (req, res) => {
  const { uid: userId } = req.user;

  const lovId = uuidv4();

  try {
    const results = await db('list_of_emaillists').where({ user_id: userId }).select('list_name', 'list_id');

    return res.status(HTTP_CREATED).json({ results });
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

router.get('/:emailListId', authenticateToken, async (req, res) => {
  const emailListId = req.params.emailListId; // Extracting voting ID from URL parameters
  //const { uid: userId } = req.user;

  try {
    const results = await db('emails').where({ list_id: emailListId }).select('mail');

    return res.status(HTTP_CREATED).json(results);
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

// Export the router instance using module.exports
module.exports = router;
