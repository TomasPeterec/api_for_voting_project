const knex = require("./knex");

function createVote(vote){
    return knex("votings").insert(vote);
};

function getAllVotes() {
    return knex("votings").select("*");
};

function getVotes(electionID) {
    return knex("votings").where("foreign_key", electionID).select("*");
};

function deleteVote(id) {
    return knex("votings").where("primary_key", id).del();
};

function updateVote(id, vote){
    return knex("votings").where("primary_key", id).update(vote);
};

module.exports = {
    createVote,
    getAllVotes,
    deleteVote,
    updateVote,
    getVotes
}