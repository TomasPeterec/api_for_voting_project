const Joi = require('joi');
const cors = require('cors');
const express = require('express');
const db = require("./user-votes");

const router = express.Router();
router.use(cors({
    origin: 'http://localhost:3000'
  }));
router.use(express.json());

//get all votes 
router.get("/", async (req, res) => {
    const allVotes = await db.getAllVotes();
    res.send(allVotes);
});

//get part of votes by election id (foreign_key)
router.get("/:foreignKey", async (req, res) => {
    const partOfVotes = await db.getVotes(req.params.foreignKey);
    res.send(partOfVotes);
});

//insertion of new voting record
router.post("/", async (req, res) => {
    const {error} = validateUser(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    const recordedVote = await db.createVote(req.body)
    res.send(recordedVote)
});

router.put('/:id', async (req, res) => {
    const updatedVote = await db.updateVote(req.params.id, req.body)
    if(!updatedVote) return res.status(404).send('The userVote with the given ID was not found.');
})

router.delete('/:id', async (req, res) => {
    const userVote = await db.deleteVote(req.params.id)
    if(!userVote) return res.status(404).send('The userVote with the given ID was not found.');
})

function validateUser(userVote) {
    const schema = {
        foreign_key: Joi.number().min(1).required(),
        mail_or_id: Joi.string().min(3).required(),
        voted_values: Joi.string().min(3).required()
    };
    return Joi.validate(userVote, schema);
}

module.exports = router;
