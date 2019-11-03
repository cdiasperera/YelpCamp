var express  = require("express");
var router   = express.Router();
var passport = require("passport");

var User = require("../models/user");

router.get("/", (req, res) => {
    res.render("homepage");
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", (req, res) => {
  User.register(
    new User({username: req.body.username}),
    req.body.password,
    (err, username) => {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, () => {
          req.flash("success", "Welcome Aboard!");
          res.redirect("/campgrounds");
        })
      }
    });
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post(
  "/login",
  passport.authenticate(
    "local",
    {
      failureRedirect: "/login",
      failureFlash: true
    }),
  (req, res) => {
    var returnTo = req.session.returnTo ? req.session.returnTo : "/campgrounds";
    delete req.session.returnTo;
    res.redirect(returnTo);
  }
);

router.get("/logout", (req, res) => {
  req.logout();

  req.flash("success", "Logged out!");
  res.redirect("/");
})

module.exports = router;
