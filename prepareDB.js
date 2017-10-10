require('dotenv-safe').load({
  allowEmptyValues: true,
});

const massive = require('massive');
const query = require('fs').readFileSync('./table.sql', { encoding: 'utf8' });

massive({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  passsword: process.env.DB_PASSWORD,
  poolSize: 10,
})
.then(db => db.run(query))
.then(result => process.exit());
