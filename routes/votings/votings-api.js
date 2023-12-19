const Joi = require('joi');
const cors = require('cors');
const express = require('express');
const db = require("./user-votes-f");

const router = express.Router();
const reactJsRootUrl = process.env.ALLOWED_ORIGINS;

router.use(cors({
  origin: reactJsRootUrl ? [reactJsRootUrl] : [], // Use the origin directly
}));
router.use(express.json());

//get all votes 
router.get("/", async (req, res) => {
  const allVotes = await db.getAllVotes();
  res.send(allVotes);
});

//get part of votes by election id (votings_id)
router.get("/:votings_id", async (req, res) => {
  const partOfVotes = await db.getVotes(req.params.votings_id);
  res.send(partOfVotes);
});

//add a new voting
router.post("/", async (req, res) => {
  const {error} = validateVoting(req.body)
  if(error) return res.status(400).send(error.details[0].message)
  const recordedVote = await db.createVote(req.body)
  res.send(recordedVote)
});

router.put('/:id', async (req, res) => {
  try{
    const updatedVote = await db.updateVote(req.params.id, req.body)
    if(updatedVote) {
      return res.send('The userVote with the given ID was updated.');
    } else {
      return res.status(404).send('The userVote with the given ID was not found.');
    }
  }catch (error) {
    console.error('Error creating user vote:', error);
  }
})

router.delete('/:id', async (req, res) => {
  try{
    const userVote = await db.deleteVote(req.params.id)
    if(userVote) {
      return res.send('The userVote with the given ID was deleted.');
    } else {
      return res.status(404).send('The userVote with the given ID was not found.');
    }
  }catch (error) {
    console.error('Error creating user vote:', error);
  }
})

function validateVoting(userVote) {
  const schema = {
    votings_id: Joi.number().min(1).required(),
    mail_or_id: Joi.string().min(3).required(),
    voted_values: Joi.string().min(3).required()
  };
  return Joi.validate(userVote, schema);
}

module.exports = router;
