const knex = require('knex');
const fs = require('fs');
const path = require('path');
const config = require('../config'); // Import config

const caCert = fs.readFileSync(path.resolve(config.db.caCertPath)).toString();

const knexConfig = {
  client: 'pg',
  connection: {
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
    ssl: {
      ca: caCert,
      rejectUnauthorized: false, // For development, set to true in production
    },
  },
  migrations: {
    directory: './migrations',
  },
};

const db = knex(knexConfig);

db.raw('SELECT NOW()')
  .then(() => console.log('Database connected'))
  .catch((err) => console.error('Database connection error:', err));

module.exports = db;
