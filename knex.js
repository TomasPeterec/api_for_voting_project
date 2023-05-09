const knex = require("knex");
const connectedKnex = knex({
    client: "sqlite3",
    connection: {
        filename:"votes02.db"
    }
});

module.exports = connectedKnex;