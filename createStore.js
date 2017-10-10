module.exports = function({
  fs,
  dbHost,
  dbPort,
  dbName,
  dbUser,
  dbPassword,
}) {

  const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
  const getCredentialsPath =
    username => `${TOKEN_DIR}sheets.googleapis.com-pfa-telgram-${username}.json`;
  function findFS(username) {
    return new Promise((resolve, reject) => {
      fs.readFile(getCredentialsPath(username), function(err, token) {
        if (err) {
          reject(err);
        } else {
          const credentials = JSON.parse(token);
          resolve(credentials);
        }
      });
    })
  }

  function saveFS(username, token) {
    return new Promise((resolve, reject) => {
      try {
        fs.mkdirSync(TOKEN_DIR);
      } catch (err) {
        if (err.code != 'EEXIST') {
          reject(err);
        }
      }
      fs.writeFile(getCredentialsPath(username), JSON.stringify(token), err => {
        if (err) reject(err);
        resolve(token);
      });
    });
  }

  return {
    find(username) {
      return findFS(username);
    },
    save(username, data) {
      return saveFS(username, data);
    },
  }
};
