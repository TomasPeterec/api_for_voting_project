const knex = require('../../knex')

function createList (list) {
  return knex('list_of_votings').insert(list)
};

function getAllLists () {
  return knex('list_of_votings').select('*')
};

function getUserLists (idOfUser) {
  return knex('list_of_votings').where('id_of_user', idOfUser).select('*')
};

function deleteList (id) {
  return knex('list_of_votings').where('id', id).del()
};

function updateList (id, list) {
  return knex('list_of_votings').where('id', id).update(list)
};

module.exports = {
  createList,
  getAllLists,
  deleteList,
  updateList,
  getUserLists
}
