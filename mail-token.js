const jwt = require('jsonwebtoken');

const generateToken = (email) => {
  // Sign the token with a secret key
  const token = jwt.sign(
    {email}, 
    // FIXME: Take it from env var
    'your-secret-key', 
    { expiresIn: '1h' },
    );

  return token;
};

module.exports = { generateToken };
