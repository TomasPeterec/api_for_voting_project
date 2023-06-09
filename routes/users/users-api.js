require('dotenv').config();
const Joi = require('joi');
const cors = require('cors');
const express = require('express');
const db = require("./user-knex-handling");
const bcrypt = require('bcrypt');
const veriMail = require('../../mail-triggered');
const tokenGen = require('../../mail-token');
const { VERIFY_EMAIL } = require('../../constants')

const REACT_JS_ROOT = process.env.REACT_JS_ROOT_URL
const router = express.Router();
router.use(cors({
    origin: `${REACT_JS_ROOT}`
  }));
router.use(express.json());

//get all users 
router.get("/", async (req, res) => {
    const allUsers = await db.getAllUsers();
    res.send(allUsers);
});

router.get("/login", async (req, res) => {
    const { email, password } = req.query;
    
    const selectedUser = await db.getUser(email);
    if (selectedUser.length > 0) {
      const storedHashedPassword = selectedUser[0].password; // Assuming 'password' is the column name for the hashed password
      
      // Compare 'password' with the provided password
      const passwordMatch = await bcrypt.compare(password, storedHashedPassword);
      
      if (passwordMatch) {
        // Passwords match, proceed with login logic
        res.send("Login successful");
      } else {
        // Passwords do not match
        res.status(401).send("Incorrect password");
      }
    } else {
      // User not found
      res.status(404).send("User not found");
    }
  });

//insertion of new user record
router.post("/", async (req, res) => {
    const {error} = validateUser(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const token = tokenGen.generateToken(email)
        const recordedUser = await db.createUser({ email, password: hashedPassword, verified: token });

        if (parseInt(recordedUser) === (parseInt(recordedUser) * 1)) {
          console.log(`New primary key ${recordedUser} was sent`);
          veriMail.sendVerificationEmail(email,token)
        } else {
          console.log('New primary key was not sent');
        }

        res.send(recordedUser);
      } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred during user creation');
      }
});

router.put('/:id', async (req, res) => {
    const updatedUser = await db.updateUser(req.params.id, req.body)
    if(!updatedUser) return res.status(404).send('The user with the given ID was not found.');
})

router.get(`/${VERIFY_EMAIL}/:token`, async (req, res) => {
  //TODO: Errorhandling should be done by middleware
  try {
    const updatedUser = await db.setAsVerified(req.params.token)
    if(updatedUser) {
      return res.send('Mail verified')
    } else {
      return res.status(400).send('Invalid token');
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
})

router.delete('/:id', async (req, res) => {
    const someUser = await db.deleteUser(req.params.id)
    if(!someUser) return res.status(404).send('The user with the given ID was not found.');

    console.log(someUser)
})

function validateUser(someUser) {
    const schema = {
        email: Joi.string().min(3).required(),
        password: Joi.string().min(3).required()
    };
    return Joi.validate(someUser, schema);
}

module.exports = router;
