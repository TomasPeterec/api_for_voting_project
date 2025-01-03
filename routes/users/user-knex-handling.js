const knex = require('../../knex');

const createUser = (vote) => knex('users').insert(vote);

async function getAllUsers() {
  return await knex('users').select('*');
}

async function getUserByEmail(email) {
  return await knex('users').where('email', email);
}

async function deleteUser(id) {
  return await knex('users').where('id', id).del();
}

async function updateUser(id, vote) {
  return await knex('users').where('id', id).update(vote);
}

async function setAsVerified(token) {
  return await knex('users').where('verified', token).update({ verified: 'verified' });
}

module.exports = {
  createUser,
  getAllUsers,
  deleteUser,
  updateUser,
  getUserByEmail,
  setAsVerified,
};
