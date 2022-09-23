const express = require('express');
const app = express();
const morgan = require('morgan');
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const getUserByEmail = require('./helpers');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(morgan('dev'));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const generateRandomString = function() {
  let res = '';
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
};

const urlsForUser = function(u) {
  const urls = {};
  for (const id in urlDatabase) {
    if (urlDatabase[id].userID === u) {
      urls[id] = urlDatabase[id].longURL;
    }
  }
  return urls;
};

app.get("/", (req, res) => {
  let id = req.session.user_id;
  if (id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  let id = req.session.user_id;
  if (id) {
    const templateVars = {
      user: users[id],
      urls: urlsForUser(id)
    };
    res.render("urls_index", templateVars);
  } else {
    res.send("Please login or register first.");
  }
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: null };
    res.render("registration", templateVars);
  }
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: null };
    res.render("login", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/u/:id", (req, res) => {
  let reqId = req.params.id;
  if (urlDatabase[reqId]) {
    const longURL = urlDatabase[reqId].longURL;
    res.redirect(longURL);
  } else {
    res.send("Shortened url does not exist.");
  }
});

app.get("/urls/:id", (req, res) => {
  let user = req.session.user_id;
  if (user) {
    if (urlDatabase[req.params.id].userID === user) {
      const templateVars = {
        id: req.params.id,
        user: users[req.session.user_id],
        longURL: urlDatabase[req.params.id].longURL
      };
      res.render("urls_show", templateVars);
    } else {
      res.send("You do not own the URL.");
    }
  } else {
    res.send("You are not logged in.");
  }

});

app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    let shrt = generateRandomString();
    urlDatabase[shrt] = { userID: req.session.user_id, longURL: req.body.longURL };
    const templateVars = {
      id: shrt,
      user: users[req.session.user_id],
      longURL: req.body.longURL
    };
    res.render("urls_show", templateVars);
  } else {
    res.send("Only registered and logged in users can create new tiny URLs.");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  let url = req.params.id;
  if (!urlDatabase[url]) {
    res.send("The shortened URL does not exist.");
  } else if (req.session.user_id) {
    if (urlDatabase[url].userID !== req.session.user_id) {
      res.send("You do not own the URL.");
    } else {
      delete urlDatabase[url];
      res.redirect("/urls");
    }
  } else {
    res.send("You are not logged in.");
  }
});

app.post("/urls/:id", (req, res) => {
  let url = req.params.id;
  if (!urlDatabase[url]) {
    res.send("The shortened URL does not exist.");
  } else if (req.session.user_id) {
    if (urlDatabase[url].userID !== req.session.user_id) {
      res.send("You do not own the URL.");
    } else {
      urlDatabase[url].longURL = req.body.newURL;
      res.redirect("/urls");
    }
  } else {
    res.send("You are not logged in.");
  }

});

app.post("/login", (req, res) => {
  let user = getUserByEmail(req.body.email, users);
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Email/Password should not be empty.");
  } else if (user) {
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      res.status(403).send("Incorrect Password.");
    } else {
      req.session.user_id = user.id;
      res.redirect("/urls");
    }
  } else {
    res.status(403).send("User Not Found.");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Email/Password should not be empty.");
  } else if (getUserByEmail(req.body.email, users)) {
    res.status(400).send("User Exists!");
  } else {
    let userID = generateRandomString();
    req.session.user_id = userID;
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
