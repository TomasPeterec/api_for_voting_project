const Joi = require('joi');
const cors = require('cors');
const express = require('express');
const db = require('./list-of-votings-f');

const router = express.Router();
const reactJsRootUrl = process.env.ALLOWED_ORIGINS;

router.use((req, res, next) => {
  // Access the 'X-User-ID' header from the request
  const userId = req.headers['x-user-id'];

  // Store the User ID in req.locals for later use
  req.locals = {
    userId: userId,
  };

  next();
});

router.use(cors({
  origin: reactJsRootUrl ? [reactJsRootUrl] : [], // Use the origin directly
}));
router.use(express.json());

// Get all lists 
router.get("/", async (req, res) => {
  const allLists = await db.getAllLists();
  res.send(allLists);
});

// Get part of lists by user ID (id_of_user)
router.get("/subset", async (req, res) => {
  // Access the User ID from req.locals
  const partOfLists = await db.getUserLists(req.locals.userId);
  res.send(partOfLists);
});

// Add a new user vote
router.post("/", async (req, res) => {
  try {
    const userVoteData = {
      ...req.body,
      id_of_user: req.locals.userId,
    };
    const { error } = validateUser(userVoteData);
    if (error) return res.status(400).send(error.details[0].message);
    const recordedList = await db.createList(userVoteData);
    res.send(recordedList);
  } catch (error) {
    console.error('Error creating user vote:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedList = await db.updateList(req.params.id, req.body);
    if (updatedList) {
      return res.send('The userList with the given ID was updated.');
    } else {
      return res.status(404).send('The userList with the given ID was not found.');
    }
  } catch (error) {
    console.error('Error updating user vote:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const userList = await db.deleteList(req.params.id);
    if (userList) {
      return res.send('The userList with the given ID was deleted.');
    } else {
      return res.status(404).send('The userList with the given ID was not found.');
    }
  } catch (error) {
    console.error('Error deleting user vote:', error);
    res.status(500).send('Internal Server Error');
  }
});

function validateUser(userListName) {
  const schema = {
    id_of_user: Joi.number().min(1).required(),
    name_of_voting: Joi.string().min(3).required()
  };
  return Joi.validate(userListName, schema);
}

module.exports = router;
