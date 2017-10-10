module.exports = function({
  massive,
  dbHost,
  dbPort,
  dbName,
  dbUser,
  dbPassword,
}) {
  const connectionInfo = {
    host: dbHost,
    port: dbPort,
    database: dbName,
    user: dbUser,
    passsword: dbPassword,
    poolSize: 10,
  };
  let db = null;

  const getInstance = () => new Promise(function(resolve, reject){
    if (!!db) {
      resolve(db);
    } else {
      resolve(massive(connectionInfo)
        .then(instance => { db = instance; return Promise.resolve(db); }));
    }
  });

  return {
    find(username) {
      return getInstance()
        .then(db => db.auth.findOne({ username }))
        .then(record => Promise.resolve(record.key));
    },
    save(username, data) {
      return getInstance()
        .then(db => db.auth.insert({ username, key: data }))
        .then(record => Promise.resolve(record.key));
    },
    update(username, data) {
      return getInstance()
        .then(db => db.auth.insert({ username, key: data }))
        .then(record => Promise.resolve(record.key));
    }
  }
};
