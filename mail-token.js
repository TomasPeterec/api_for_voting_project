require('dotenv').config();
const jwt = require('jsonwebtoken');

const generateToken = (email) => {
  // Sign the token with a secret key
  const token = jwt.sign(
    { email }, 
    `${process.env.MAIL_TOKEN_SECRET_KEY}`, 
    { expiresIn: '1h' },
    );

  return token;
};

module.exports = { generateToken };
