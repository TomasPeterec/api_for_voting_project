const knex = require("../../knex");

function createList(list){
    console.log("preslodo funkcie")
    console.log(list)
    return knex("list_of_votings").insert(list);
};

function getAllLists() {
    return knex("list_of_votings").select("*");
};

function getUserVotes(idOfUser) {
    return knex("list_of_votings").where("id_of_user", idOfUser).select("*");
};

function deleteList(id) {
    return knex("list_of_votings").where("id", id).del();
};

function updateList(id, list){
    return knex("list_of_votings").where("id", id).update(list);
};

module.exports = {
    createList,
    getAllLists,
    deleteList,
    updateList,
    getUserVotes
}
