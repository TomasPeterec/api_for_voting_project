const knex = require('../../knex')

function createList(list) {
  return knex('list_of_votings').insert(list)
}

function getAllLists() {
  return knex('list_of_votings').select('*')
}

function getUserLists(idOfUser) {
  return knex('list_of_votings').where('id_of_user', idOfUser).select('*')
}

function getUserCurentList(id, lovId) {
  return knex('list_of_votings')
    .where('lov_id', lovId)
    .andWhere('id_of_user', id)
    .select('template')
}

function deleteList(id) {
  return knex('list_of_votings').where('lov_id', id).del()
}

function updateListTemplate(id, lovId, newDescription) {
  const jsonString = JSON.stringify(newDescription, null, 2)
  return knex('list_of_votings')
    .where('lov_id', lovId)
    .andWhere('id_of_user', id)
    .update({
      template: jsonString
    })
}

module.exports = {
  createList,
  getAllLists,
  deleteList,
  getUserLists,
  getUserCurentList,
  updateListTemplate
}
