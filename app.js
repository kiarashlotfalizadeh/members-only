const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const controller = require("./controllers/controller");
const pool = require("./pool");
const bcrypt = require("bcrypt");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());

app.get("/", controller.getIndex);
app.get("/sign-up", controller.getSignUp);
app.post("/sign-up", controller.postSignUp);
app.get("/log-in", controller.getLogIn);
app.get("/delete/:id", controller.getDeleteMessage);
app.get("/new-message", controller.getNewMessage);
app.post("/new-message", controller.postNewMessage);
app.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
  })
);
app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    const { rows } = await pool.query(
      "SELECT * FROM members WHERE username = $1",
      [username]
    );
    const user = rows[0];

    if (!user) {
      return done(null, false, { message: "Incorrect Username" });
    }

    const isMatch = bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: "Incorrect Password" });
    }
    return done(null, user);
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const { rows } = await pool.query("SELECT * FROM members WHERE id = $1", [
    id,
  ]);
  const user = rows[0];

  done(null, user);
});

app.listen(3000, () => console.log("App running"));
