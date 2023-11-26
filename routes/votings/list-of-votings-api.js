require('dotenv').config();
const Joi = require('joi');
const cors = require('cors');
const express = require('express');
const db = require("./list-of-votings-f");

const REACT_JS_ROOT = process.env.REACT_JS_ROOT_URL
const REACT_ALT_ROOT = process.env.REACT_ALT_ROOT_URL
const router = express.Router();
router.use(cors({
  origin: [`${REACT_JS_ROOT}`, `${REACT_ALT_ROOT}`]
  }));
router.use(express.json());

//get all Lists 
router.get("/", async (req, res) => {
    const allLists = await db.getAllLists();
    res.send(allLists);
});

//get part of Lists by election id (foreign_key)
router.get("/:idOfUser", async (req, res) => {
    const partOfLists = await db.getLists(req.params.idOfUser);
    res.send(partOfLists);
});

//insertion of new voting record
router.post("/", async (req, res) => {
    console.log(req.body);
    // const {error} = validateUser(req.body)
    // if(error) return res.status(400).send(error.details[0].message)
    const recordedList = await db.createList(req.body)
    res.send(recordedList)
});

router.put('/:id', async (req, res) => {
    const updatedList = await db.updateList(req.params.id, req.body)
    if(!updatedList) return res.status(404).send('The userList with the given ID was not found.');
})

router.delete('/:id', async (req, res) => {
    const userList = await db.deleteList(req.params.id)
    if(!userList) return res.status(404).send('The userList with the given ID was not found.');
})

function validateUser(userList) {
    const schema = {
        foreign_key: Joi.number().min(1).required(),
        mail_or_id: Joi.string().min(3).required(),
        listd_values: Joi.string().min(3).required()
    };
    return Joi.validate(userList, schema);
}

module.exports = router;
