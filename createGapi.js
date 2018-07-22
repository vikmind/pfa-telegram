module.exports = function({
  google,
  googleAuth,
  sheetId,
  secrets,
  adapter,
  store,
}) {
  const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

  return {
    getClient: function getClient(username) {
      const auth = new googleAuth.GoogleAuth();
      const oauth2Client = new auth.OAuth2Client(
        secrets.installed.client_id,
        secrets.installed.client_secret,
        secrets.installed.redirect_uris[0],
      );
      return store.find(username)
        .then(credentials => {
          oauth2Client.credentials = credentials
          return Promise.resolve(oauth2Client);
        })
        .catch(e => Promise.resolve(oauth2Client));
    },
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
              return reject(err);
            }
            oauth2Client.credentials = token;
            resolve(store.save(username, token));
          });
        }
      });
    },
    append: function(oauth2Client, data) {
      return new Promise((resolve, reject) => {
        const sheets = google.sheets('v4');
        sheets.spreadsheets.values.append({
          auth: oauth2Client,
          spreadsheetId: sheetId,
          range: adapter.insertRange(),
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [adapter.dataToRow(data)]
          }
        }, function(err, response) {
          if (err) {
            return reject(err);
          }
          resolve('OK');
        })
      });
    },
    categories: function(oauth2Client) {
      return new Promise((resolve, reject) => {
        const sheets = google.sheets('v4');
        sheets.spreadsheets.values.get({
          auth: oauth2Client,
          spreadsheetId: sheetId,
          range: adapter.categoriesRange(),
        }, function(err, response) {
          if (err) {
            return reject(err);
          }
          resolve(response.values);
        });
      });
    },
  };
};
