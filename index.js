const Joi = require('joi');
const cors = require('cors');
const express = require('express');
const { request } = require('express');
const db = require("./user-votes");



const app = express();
app.use(cors({
    origin: 'http://localhost:3000'
  }));
app.use(express.json());

// const userVotes = [];

//get all votes 
app.get("/api/userVotes", async (req, res) => {
    const allVotes = await db.getAllVotes();
    res.send(allVotes);
});

//get part of votes by election id (foreign_key)
app.get("/api/userVotes/:foreignKey", async (req, res) => {
    const partOfVotes = await db.getVotes(req.params.foreignKey);
    res.send(partOfVotes);
});

//insertion of new voting record
app.post("/api/userVotes", async (req, res) => {
    const {error} = validateCours(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    const recordedVote = await db.createVote(req.body)
    res.send(recordedVote)
});

app.put('/api/userVotes/:id', async (req, res) => {
    const updatedVote = await db.updateVote(req.params.id, req.body)
    if(!updatedVote) return res.status(404).send('The userVote with the given ID was not found.');

    //validate 
    //If invalid, return 400 - Bad request
    // const {error} = validateCours(req.body)
    // if(error) return res.status(400).send(error.details[0].message)
       
    console.log(updatedVote)
    
    // res.send(updatedVote)
    //Return the updated userVote

})

app.delete('/api/userVotes/:id', async (req, res) => {
    const userVote = await db.deleteVote(req.params.id)
    if(!userVote) return res.status(404).send('The userVote with the given ID was not found.');

    console.log(userVote)
    // const index = userVotes.indexOf(userVote)
    // userVotes.splice(index, 1)
    
    // res.send(userVote)
})


function validateCours(userVote) {
    const schema = {
        foreign_key: Joi.number().min(1).required(),
        mail_or_id: Joi.string().min(3).required(),
        voted_values: Joi.string().min(3).required()
    };
    return Joi.validate(userVote, schema);
}






//PORT
// const port = process.env.PORT || 5000;
// app.listen(port, () => console.log(`Listening on port ${port}`))
app.listen(5000, () => {
    console.log('Server started on port 5000');
  });