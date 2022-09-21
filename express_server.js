const express = require('express');
const app = express();
const morgan = require('morgan');
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

const generateRandomString = function () {
  let res = '';
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
};

const getUserByEmail = function (e) {
  for (const user in users) {
    if (users[user].email === e) {
      return users[user];
    }
  }
  return null;
};

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  if (req.cookies['user_id']) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: null
    };
    res.render("registration", templateVars);
  }
});

app.get("/login", (req, res) => {
  if (req.cookies['user_id']) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: null
    };
    res.render("login", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    user: users[req.cookies['user_id']],
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let shrt = generateRandomString();
  urlDatabase[shrt] = req.body.longURL;
  const templateVars = {
    id: shrt,
    user: users[req.cookies['user_id']],
    longURL: urlDatabase[shrt]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  let url = req.params.id;
  delete urlDatabase[url];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  let url = req.params.id;
  urlDatabase[url] = req.body.newURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let user = getUserByEmail(req.body.email);
  if (user) {
    if (user.password !== req.body.password) {
      res.status(403).send("Incorrect Password.");
    } else {
      res.cookie("user_id", user.id);
      res.redirect("/urls");
    }
  } else {
    res.status(403).send("User Not Found.");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Email/Password should not be empty.");
  } else if (getUserByEmail(req.body.email)) {
    res.status(400).send("User Exists!");
  } else {
    let userID = generateRandomString();
    res.cookie("user_id", userID);
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password
    };
    console.log(users);
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
