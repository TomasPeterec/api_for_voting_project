require('dotenv').config();
const express = require('express');
const votingsRoutes = require('./routes/votings/votings-api');
const users = require('./routes/users/users-api');

const app = express();
const PORT_VAR = process.env.API_PORT

// Mount route files
app.use('/api/userVotes', votingsRoutes);
app.use('/api/users', users);

app.listen(PORT_VAR, () => {
  console.log(`Server started on port ${PORT_VAR}`);
});
