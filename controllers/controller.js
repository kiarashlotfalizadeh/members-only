const pool = require("../pool");
const bcrypt = require("bcrypt");

async function getSignUp(req, res) {
  res.render("sign-up-form");
}

async function postSignUp(req, res) {
  const data = req.body;
  let admin;

  if (data.password !== data.passwordConfirm) {
    console.log("Passwords Do Not Match");
    res.redirect("/sign-up");
    return;
  }
  if (data.admin) {
    admin = true;
  } else {
    admin = false;
  }
  const hashedPassword = await bcrypt.hash(data.password, 10);

  await pool.query(
    "INSERT INTO members (first_name, last_name, username, password, admin) VALUES ($1, $2, $3, $4, $5)",
    [data.firstname, data.lastname, data.username, hashedPassword, admin]
  );
  res.redirect("/");
}

async function getLogIn(req, res) {
  res.render("log-in-form");
}

async function getIndex(req, res) {
  const { rows } = await pool.query(
    "SELECT username, message, messages.id FROM members JOIN messages ON messages.author_id = members.id"
  );
  res.render("index", { user: req.user, messages: rows });
}

async function getDeleteMessage(req, res) {
  await pool.query("DELETE FROM messages WHERE id = $1", [req.params["id"]]);
  res.redirect("/");
}

async function getNewMessage(req, res) {
  res.render("newMessage");
}

async function postNewMessage(req, res) {
  await pool.query(
    "INSERT INTO messages (author_id, message) VALUES ($1, $2)",
    [req.user.id, req.body.message]
  );
  res.redirect("/");
}

module.exports = {
  getSignUp,
  postSignUp,
  getLogIn,
  getIndex,
  getDeleteMessage,
  getNewMessage,
  postNewMessage,
};
