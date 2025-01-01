const express = require('express');
const path = require('path');
const SendSingleEmail = require('../../send-single-email');
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

router.get('/:uuId/:uuIdSecond', async (req, res) => {
  const { uuId, uuIdSecond } = req.params; // Extracting IDs from URL parameters

  // Validate input parameters
  if (!uuId || !uuIdSecond) {
    return sendErrorResponse(res, HTTP_BAD_REQUEST, 'Missing required parameters');
  }

  try {
    // Query the database for matching records
    const results = await db('voting_records')
      .where({ id_of_votes: uuId, email_id: uuIdSecond })
      .select('mail', 'voted');

    const results2 = await db('list_of_votings').where({ lov_id: uuId }).select('name_of_voting').first();

    // Send response with the results
    if (results && results2) {
      return res.status(HTTP_OK).json({ results, results2 });
    }
  } catch (err) {
    // Handle errors
    sendErrorResponse(res, HTTP_SERVER_ERROR, 'Error querying data: ' + err.message);
  }
});

// sending emails
router.post('/:idOfVotes', authenticateToken, async (req, res) => {
  const idOfVotes = req.params.idOfVotes; // Extracting voting ID from URL parameters
  const { uid: userId } = req.user;
  const { mails } = req.body;

  const tempList = mails.map((email) => ({
    id_of_votes: idOfVotes,
    email_id: uuidv4(),
    mail: email,
    voted: 'no',
  }));

  await db('voting_records').insert(tempList);

  tempList.map(async (mail) => {

    SendSingleEmail(mail.mail, `/voting-records/${mail.id_of_votes}/votingform/${mail.email_id}`).then(() =>
      console.log('Email sent successfully'),
    );
  });

  // Return ensures no other code executes
  return;
});

// Export the router instance using module.exports
module.exports = router;
