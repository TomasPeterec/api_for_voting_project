const admin = require('firebase-admin');
const path = require('path');

const UNAUTHORIZED = 401;
const FORBIDDEN = 403;
const TOKEN_POSITION = 1; // Token is the second element after splitting

// Initialize Firebase Admin
const serviceAccount = path.resolve(__dirname, '../firebase-adminsdk.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[TOKEN_POSITION];

  if (!token) {
    return res.sendStatus(UNAUTHORIZED);
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.sendStatus(FORBIDDEN);
  }
};

module.exports = authenticateToken;
