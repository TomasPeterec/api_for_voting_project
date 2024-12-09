const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('./myExpress');
const protocolsSwitchServer = require('./protocolsSwitchServer');
const authenticateToken = require('./authenticateToken');

const app = express;

// Logging middleware for incoming requests
app.use((req, res, next) => {
  next();
});

// User-related routes
const usersRouter = require('./routes/user-api');
app.use('/', usersRouter);

// dividing of routes to routing files
const listOfVotingsRouter = require('./routes/listOfVotings-api');
app.use('/api/listOfVotings', listOfVotingsRouter);

const listOfEmailsRouter = require('./routes/listOfEmails');
app.use('/api/emaillists', listOfEmailsRouter);

// Private route example
app.get('/private', authenticateToken, (req, res) => {
  res.json({ message: 'This is a private route', user: req.user });
});

// Start the server
//const serverInstance = protocolsSwitchServer(app);
protocolsSwitchServer(app);
