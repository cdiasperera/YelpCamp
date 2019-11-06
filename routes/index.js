var express  = require("express");
var router   = express.Router();
var passport = require("passport");

var User = require("../models/user");

/**
 * Route to the landing page.
 */
router.get("/", (req, res) => {
    res.render("landing");
});

/**
 * Route to the register page.
 */
router.get("/register", (req, res) => {
  res.render("register");
});

/**
 * Route which created a user.
 */
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

/**
 * Route to the login page.
 */
router.get("/login", (req, res) => {
  res.render("login");
});

/**
 * Route to login.
 */
router.post(
  "/login",
  passport.authenticate(
    "local",
    {
      failureRedirect: "/login",
      failureFlash: true
    }),
  (req, res) => {
    // Return to the previous page, if previous page is know. Otherwise, go to the index.
    var returnTo = req.session.returnTo ? req.session.returnTo : "/campgrounds";
    delete req.session.returnTo;
    res.redirect(returnTo);
  }
);

/**
 * Route to log out.
 */
router.get("/logout", (req, res) => {
  req.logout();

  req.flash("success", "Logged out!");
  res.redirect("/");
})

module.exports = router;
