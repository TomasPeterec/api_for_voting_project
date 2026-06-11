const admin = require('firebase-admin');
const path = require('path');

const UNAUTHORIZED = 401;
const FORBIDDEN = 403;
const TOKEN_POSITION = 1;

if (!admin.apps.length) {
  let credential;

  if (process.env.FIREBASE_ADMINSDK_JSON) {
    credential = admin.credential.cert(
      JSON.parse(process.env.FIREBASE_ADMINSDK_JSON)
    );
  } else {
    const serviceAccount = path.resolve(__dirname, '../firebase-adminsdk.json');
    credential = admin.credential.cert(serviceAccount);
  }

  admin.initializeApp({ credential });
}

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