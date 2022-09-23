const getUserByEmail = function(e, db) {
  for (const user in db) {
    if (db[user].email === e) {
      return db[user];
    }
  }
  return null;
};

module.exports = getUserByEmail;