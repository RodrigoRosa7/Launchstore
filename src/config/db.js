const {Pool} = require("pg")

//não sei porque razão não pode ser minúsculo
module.exports = new Pool({
  user: "postgres",
  password: "postgres",
  host: "localhost",
  port: 5432,
  database: "launchstoredb"
})