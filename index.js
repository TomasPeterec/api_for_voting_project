const express = require('express');
const votingsRoutes = require('./routes/votings/votings-api');
const users = require('./routes/users/users-api');

const app = express();

// Mount route files
app.use('/api/userVotes', votingsRoutes);
app.use('/api/users', users);

app.listen(5000, () => {
  console.log('Server started on port 5000');
});
