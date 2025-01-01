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

// Endpoint to get voting template
router.get('/template', authenticateToken, async (req, res) => {
  const { uid: userId } = req.user;
  const { id: currentId } = req.query; // Extract `id` from query parameters

  try {
    // You can now use `currentId` in your database query if necessary
    const results = await db('candidates')
      .where({ voting_id: currentId }) // Assuming `lov_id` is the column for `id`
      .select('candidate_id', 'name', 'description', 'voting_value');

    return res.status(200).json({ results }); // Return the results
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching data: ' + err.message });
  }
});

// Endpoint to write new candidate
router.post('/:votingId/candidates', authenticateToken, async (req, res) => {
  const votingId = req.params.votingId; // Extracting voting ID from URL parameters
  const { title, description } = req.body; // Extracting title and description from request body

  try {
    // Generate a new candidate ID (UUID)
    const candidateId = uuidv4();

    // Insert new candidate into the database
    const result = await db('candidates').insert({
      voting_id: votingId,
      candidate_id: candidateId, // New UUID for the candidate
      name: title, // Using 'title' as name
      description: description, // Using 'description' as description
    });

    // Check if the insert was successful and send appropriate response
    if (result) {
      return res.status(201).json({
        message: 'Candidate added successfully',
        candidate: {
          voting_id: votingId,
          candidate_id: candidateId,
          name: title,
          description: description,
        },
      });
    } else {
      return res.status(500).json({ error: 'Error inserting candidate' });
    }
  } catch (err) {
    console.error('Error inserting candidate:', err.message);
    return res.status(500).json({ error: 'Error inserting candidate: ' + err.message });
  }
});

router.get('/:votingId/candidates/:mailId', async (req, res) => {
  const votingId = req.params.votingId; // Extracting voting ID from URL parameters
  const mailId = req.params.mailId; // Extracting vmail ID from URL parameters

  try {
    const results = await db('candidates').where({ voting_id: votingId }).select('candidate_id', 'name', 'description');
    const results2 = await db('voting_records').where({ email_id: mailId }).select('voted');

    return res.status(HTTP_OK).json({ results, results2 }); // Ensure this line is executed before returning
  } catch (err) {
    sendErrorResponse(res, HTTP_SERVER_ERROR, 'Error fetching data: ' + err.message);
    return; // Explicit return after sending response
  }
  // Return ensures no other code executes
  return;
});

// Endpoint to edit the row
router.put('/:votingId/candidates/:candidateId', authenticateToken, async (req, res) => {
  const votingId = req.params.votingId; // Extracting voting ID from URL parameters
  const candidateId = req.params.candidateId; // Extracting candidate ID from URL parameters
  const { title, description } = req.body; // Extracting title and description from request body

  try {
    // Update the existing candidate in the database
    const result = await db('candidates')
      .where({ voting_id: votingId, candidate_id: candidateId }) // Identify the row by `voting_id` and `candidate_id`
      .update({
        name: title, // Update 'name' field with 'title'
        description: description, // Update 'description' field with the new value
      });

    // Check if the update was successful
    if (result) {
      return res.status(200).json({
        message: 'Candidate updated successfully',
        candidate: {
          voting_id: votingId,
          candidate_id: candidateId,
          name: title,
          description: description,
        },
      });
    } else {
      // If no row was updated, that means the candidate may not exist
      return res.status(404).json({ error: 'Candidate not found' });
    }
  } catch (err) {
    console.error('Error updating candidate:', err.message);
    return res.status(500).json({ error: 'Error updating candidate: ' + err.message });
  }
});

router.get('/:votingId/candidates', authenticateToken, async (req, res) => {
  const votingId = req.params.votingId; // Extracting voting ID from URL parameters

  try {
    const candidates = await db('candidates')
      .where({ voting_id: votingId })
      .select('name', 'voting_value', 'average_variance', 'submitted_votes');

    if (!candidates || candidates.length === 0) {
      return res.status(HTTP_NOT_FOUND).json({ error: 'No candidates found for this voting ID' });
    }

    return res.status(HTTP_OK).json(candidates);
  } catch (err) {
    sendErrorResponse(res, HTTP_SERVER_ERROR, 'Error fetching candidates: ' + err.message);
  }
});

// Endpoint to delete a candidate
router.delete('/:votingId/candidates/:candidateId', authenticateToken, async (req, res) => {
  const votingId = req.params.votingId; // Extracting voting ID from URL parameters
  const candidateId = req.params.candidateId; // Extracting candidate ID from URL parameters

  try {
    // Delete candidate from the database based on voting_id and candidate_id
    const result = await db('candidates')
      .where({ voting_id: votingId, candidate_id: candidateId }) // Use `voting_id` and `candidate_id` to identify the row
      .del(); // Delete the row

    // Check if the delete was successful
    if (result) {
      return res.status(200).json({
        message: 'Candidate deleted successfully',
        voting_id: votingId,
        candidate_id: candidateId,
      });
    } else {
      return res.status(404).json({ error: 'Candidate not found or already deleted' });
    }
  } catch (err) {
    console.error('Error deleting candidate:', err.message);
    return res.status(500).json({ error: 'Error deleting candidate: ' + err.message });
  }
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

// Endpoint to insert voting data
router.put('/:votingId/insert-voting-data/:emailId', async (req, res) => {
  const votingId = req.params.votingId;
  const emailId = req.params.emailId;
  const { votingData } = req.body;

  try {
    // Start a transaction
    await db.transaction(async (trx) => {
      await Promise.all(
        votingData.votingsResult.map(async (candidate) => {
          // Fetch the old data for the candidate
          const oldData = await trx('candidates')
            .where({ candidate_id: candidate.candidateId, voting_id: votingId })
            .select('voting_value', 'average_variance', 'submitted_votes')
            .first();

          // Validate and parse `submitted_votes`
          const submittedVotes = parseInt(oldData?.submitted_votes, 10) || 0;

          // Validate `candidate.votingValue`
          const votingValue = parseFloat(candidate.votingValue);
          if (isNaN(votingValue) || votingValue < 0 || votingValue > 100) {
            throw new Error(`Invalid voting value for candidate ${candidate.candidateId}: ${candidate.votingValue}`);
          }

          // Calculate new values
          const newVotingValue = submittedVotes
            ? (oldData.voting_value * submittedVotes + votingValue) / (submittedVotes + 1)
            : votingValue;

          const difference = submittedVotes ? Math.abs(oldData.voting_value - votingValue) : 0;

          const newAverageVariance = submittedVotes
            ? (oldData.average_variance * submittedVotes + difference) / (submittedVotes + 1)
            : difference;

          const newSubmittedVotes = submittedVotes + 1;

          // Update the candidate's data
          const updatedRows = await trx('candidates')
            .where({ candidate_id: candidate.candidateId, voting_id: votingId })
            .update({
              voting_value: newVotingValue,
              average_variance: newSubmittedVotes == 1 ? 0 : newAverageVariance,
              submitted_votes: newSubmittedVotes,
            });

          if (updatedRows === 0) {
            console.error(`No rows updated for candidate ${candidate.candidateId}`);
          }
        }),
      );

      // Update the voting record
      const updatedVotingRecord = await trx('voting_records')
        .where({ id_of_votes: votingId, email_id: emailId })
        .update({ voted: 'voted' });

      if (updatedVotingRecord === 0) {
        console.error('No rows updated in "voting_records"');
      } else {
        console.log(`Rows updated in 'voting_records': ${updatedVotingRecord}`);
      }
    });

    // Return a success response
    return res.status(201).json({
      message: 'New voting item updated successfully',
      votingId,
    });
  } catch (err) {
    // Handle errors
    console.error('Error inserting data:', err.message);
    return res.status(500).json({
      error: 'Error inserting data',
      details: err.message,
    });
  }
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
