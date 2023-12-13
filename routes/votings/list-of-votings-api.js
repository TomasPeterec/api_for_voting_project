const Joi = require('joi');
const cors = require('cors');
const express = require('express');
const db = require("./list-of-votings-f");

const router = express.Router();
const reactJsRootUrl = process.env.ALLOWED_ORIGINS;

router.use(cors({
  origin: reactJsRootUrl ? [reactJsRootUrl] : [], // Use the origin directly
}));
router.use(express.json());

//get all Lists 
router.get("/", async (req, res) => {
  const allLists = await db.getAllLists();
  res.send(allLists);
});

//get part of Lists by user id (id_of_user)
router.get("/:userId", async (req, res) => {
  console.log("zachyt get")
  const partOfLists = await db.getUserLists(req.params.userId);
  res.send(partOfLists);
});

//adds a new user vote
router.post("/", async (req, res) => {
  console.log("zachyt post")
  const {error} = validateUser(req.body)
  if(error) return res.status(400).send(error.details[0].message)
  const recordedList = await db.createList(req.body)
  res.send(recordedList)
});

router.put('/:id', async (req, res) => {
  try{
    const updatedList = await db.updateList(req.params.id, req.body)
    if(updatedList) {
      return res.send('The userList with the given ID was updated.');
    } else {
      return res.status(404).send('The userList with the given ID was not found.');
    }
  }catch (error) {
    return res.status(500).send(error.message);
  }
})

router.delete('/:id', async (req, res) => {
  try{
    const userList = await db.deleteList(req.params.id)
    if(userList) {
      return res.send('The userList with the given ID was deleted.');
    } else {
      return res.status(404).send('The userList with the given ID was not found.');
    }
  }catch (error) {
    return res.status(500).send(error.message);
  }

})

function validateUser(userListName) {
  const schema = {
    id_of_user: Joi.number().min(1).required(),
    name_of_voting: Joi.string().min(3).required()
  };
  return Joi.validate(userListName, schema);
}

module.exports = router;
