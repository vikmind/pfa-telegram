require('dotenv-safe').load({
  allowEmptyValues: true,
});

const store = require('./createStore')({
  massive: require('massive'),
  dbHost: process.env.DB_HOST,
  dbPort: process.env.DB_PORT,
  dbName: process.env.DB_NAME,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbUrl: process.env.DATABASE_URL,
});

const gapi = require('./createGapi')({
  google: require('googleapis'),
  googleAuth: require('google-auth-library'),
  sheetId: process.env.SHEET_ID,
  secrets: JSON.parse(process.env.CLIENT_SECRET),
  adapter: require(`./adapters/${process.env.ADAPTER}`),
  store,
});

const main = require('./createApp')({
  Telegraf: require('telegraf'),
  webroot: process.env.WEBHOOK_ROOT,
  token: process.env.BOT_TOKEN,
  gapi,
});

console.log('start listening');
if (process.env.POLLING === 'true') {
  main.startPolling();
} else {
  main.start(process.env.PORT);
}
