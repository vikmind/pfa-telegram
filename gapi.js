const fs = require('fs');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const secrets = require('./client_secret.json');
const adapter = require(`./adapters/${process.env.ADAPTER}`);

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
const getCredentialsPath =
  username => `${TOKEN_DIR}sheets.googleapis.com-pfa-telgram-${username}.json`;

const store = {};

function getClient(credentials, clients, username) {
  return new Promise((resolve, reject) => {
    if (!!clients[username]) {
      resolve(clients[username])
    } else {
      const clientSecret = credentials.installed.client_secret;
      const clientId = credentials.installed.client_id;
      const redirectUrl = credentials.installed.redirect_uris[0];
      const auth = new googleAuth();
      const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
      clients[username] = oauth2Client;
      resolve(checkToken(username, oauth2Client));
    }
  });
}

function checkToken(username, oauth2Client) {
  return new Promise((resolve, reject) => {
    fs.readFile(getCredentialsPath(username), function(err, token) {
      if (err) {
        resolve(oauth2Client);
      } else {
        oauth2Client.credentials = JSON.parse(token);
        resolve(oauth2Client);
      }
    });
  })
}

function storeToken(token, username) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(getCredentialsPath(username), JSON.stringify(token));
}

module.exports = {
  getClient: getClient.bind(null, secrets, store),
  getLink: function(oauth2Client) {
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
  },
  authorize: function(oauth2Client, username, code) {
    return new Promise((resolve, reject)=> {
      if (Object.keys(oauth2Client.credentials).length !== 0) {
        resolve('already');
      } else {
        oauth2Client.getToken(code, function(err, token) {
          if (err) {
            console.log('Error while trying to retrieve access token', err);
            return reject(err);
          }
          oauth2Client.credentials = token;
          storeToken(token, username);
          resolve(token);
        });
      }
    });
  },
  append: function(auth, data) {
    return new Promise((resolve, reject) => {
      const sheets = google.sheets('v4');
      sheets.spreadsheets.values.append({
        auth: auth,
        spreadsheetId: process.env.SHEET_ID,
        range: adapter.insertRange(),
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [adapter.dataToRow(data)]
        }
      }, function(err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          return reject(err);
        }
        resolve('OK');
      })
    });
  },
  categories: function(auth) {
    return new Promise((resolve, reject) => {
      const sheets = google.sheets('v4');
      sheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: process.env.SHEET_ID,
        range: adapter.categoriesRange(),
      }, function(err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          return reject(err);
        }
        resolve(response.values);
      });
    });
  },
};
