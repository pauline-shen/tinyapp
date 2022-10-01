// return value of user object if e exist in db, else return null
const getUserByEmail = function(e, db) {
  for (const user in db) {
    if (db[user].email === e) {
      return db[user];
    }
  }
  return null;
};

// generate random 5 char long alphanumeric string for userID and shortened URL.
const generateRandomString = function() {
  let res = '';
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
};

// return object contain urls that belongs to u in db
const urlsForUser = function(u, db) {
  const urls = {};
  for (const id in db) {
    if (db[id].userID === u) {
      urls[id] = db[id].longURL;
    }
  }
  return urls;
};

module.exports = {getUserByEmail, generateRandomString, urlsForUser};