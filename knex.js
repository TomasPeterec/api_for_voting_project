const knex = require("knex");
const connectedKnex = knex({
    client: "sqlite3",
    connection: {
        filename:"./db/votes.db"
    }
});

module.exports = connectedKnex;
