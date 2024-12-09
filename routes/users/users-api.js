const Joi = require('joi');
const cors = require('cors');
const express = require('express');
const db = require('./user-knex-handling');
const bcrypt = require('bcrypt');
const { sendVerificationEmail } = require('../../send-verification-email');
const SendMultipleEmails = require('../../send-multiple-emails');
const tokenGen = require('../../mail-token');
const { VERIFY_EMAIL_API_ENDPOINT } = require('../../constants');

const router = express.Router();
const reactJsRootUrl = process.env.ALLOWED_ORIGINS;

router.use(
  cors({
    origin: reactJsRootUrl ? [reactJsRootUrl] : [], // Use the origin directly
  }),
);
router.use(express.json());

// get all users
router.get('/', async (req, res) => {
  const allUsers = await db.getAllUsers();
  res.send(allUsers);
});

router.get('/login', async (req, res) => {
  const { email, password } = req.query;

  const selectedUser = await db.getUserByEmail(email);

  if (selectedUser.length > 0) {
    const storedHashedPassword = selectedUser[0].password;

    const passwordMatch = await bcrypt.compare(password, storedHashedPassword);

    if (passwordMatch) {
      res.send('Login successful');
    } else {
      res.status(401).send('Incorrect password');
    }
  } else {
    res.status(404).send('User not found');
  }
});

// insertion of new user record
router.post('/', async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const token = tokenGen.generateToken(email);
    const recordedUser = await db.createUser({
      email,
      password: hashedPassword,
      verified: token,
    });

    if (parseInt(recordedUser) === parseInt(recordedUser) * 1) {
      console.log(`New primary key ${recordedUser} was send.`);
      sendVerificationEmail.sendVerificationEmail(email, token);
    } else {
      console.log('New primary key was not send.');
    }

    res.send(recordedUser);
  } catch (error) {
    console.error(error);
  }
});

router.post('/multiplemails', async (req, res) => {
  // console.log(req.body)
  // const { error } = validateUser(req.body)
  // if (error) return res.status(400).send(error.details[0].message)

  try {
    const token = tokenGen.generateToken(req.body.mails[0]);
    console.log(req.body.lov_id);
    // const recordedUser = await db.createUser({
    //   email,
    //   password: hashedPassword,
    //   verified: token
    // })

    // if (parseInt(recordedUser) === parseInt(recordedUser) * 1) {
    //   console.log(`New primary key ${recordedUser} was send.`)
    //   SendMultipleEmails.SendMultipleEmails(email, token)
    // } else {
    //   console.log('New primary key was not send.')
    // }

    for (let i = 0; i < req.body.mails.length; i++) {
      SendMultipleEmails(req.body.mails[i], token);
    }

    // res.send(recordedUser)
  } catch (error) {
    console.error(error);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await db.updateUser(req.params.id, req.body);
    if (updatedUser) {
      return res.send('The user with the given ID was updated.');
    } else {
      return res.status(404).send('The user with the given ID was not found.');
    }
  } catch (error) {
    console.error('Error creating user vote:', error);
  }
});

router.get(`/${VERIFY_EMAIL_API_ENDPOINT}/:token`, async (req, res) => {
  try {
    const updatedUser = await db.setAsVerified(req.params.token);
    if (updatedUser) {
      return res.send('Mail verified');
    } else {
      return res.status(401).send('Unauthorized');
    }
  } catch (error) {
    console.error('Error creating user vote:', error);
  }
});

router.delete('/:id', async (req, res) => {
  const someUser = await db.deleteUser(req.params.id);
  if (!someUser) {
    return res.status(404).send('The user with the given ID was not found.');
  }

  console.log(`User ${someUser} was deleted`);
});

const schema = {
  email: Joi.string().min(3).required(),
  password: Joi.string().min(3).required(),
};

function validateUser(someUser) {
  return Joi.validate(someUser, schema);
}

module.exports = router;
