module.exports = function({
  fs
}) {
  const dir = './clientkeys';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const keyFile = (username) => `${dir}/${username}`;
  const isKeyExists = (username) => fs.existsSync(keyFile(username));

  return {
    find(username) {
      return new Promise((resolve, reject) => {
        if (!isKeyExists(username))
          reject(new Error('User credentials not found'));
        fs.readFile(keyFile(username), (err, data) => {
          if (err) reject(err);
          try {
            resolve(JSON.parse(data));
          }
          catch (e) {
            reject(e)
          }
        });
      });
    },
    save(username, data) {
      return new Promise((resolve, reject) => {
        fs.writeFile(keyFile(username), JSON.stringify(data), (err) => {
          if (err) reject(err);
          resolve('done');
        });
      });
    },
  }
};
