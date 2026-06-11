const knex = require('knex');
const config = require('../config');

const knexConfig = {
  client: 'pg',
  connection: {
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
    ssl: {
      rejectUnauthorized: false,
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