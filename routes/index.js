"use strict";
const express           = require("express");
const router            = express.Router();
const passport          = require("passport");

const helperObj         = require("../helper");

const passwordSchema    = require("../models/password");

const User = require("../models/user");

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
  var password = req.body.password;

  // Check if the password is a valid password
  var passwordErrors = passwordSchema.validate(password, {list: true});
  if (passwordErrors.length > 0) {
    req.flash("error", passwordSchema.errorMessage(passwordErrors));
    return res.redirect("/register"); 
  }

  User.register(
    new User({username: req.body.username}),
    password,
    (err, username) => {
      if (err) {
        helperObj.displayError(req, err, helperObj.customErrors.userCreate);
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
  res.redirect("/campgrounds");
})

module.exports = router;
