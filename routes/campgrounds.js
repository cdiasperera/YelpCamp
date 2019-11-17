"use strict";
const express     = require("express");
const router      = express.Router({mergeParams: true});
const Campground  = require("../models/campground");
const Comment     = require("../models/comment");
const lodash      = require("lodash");

const middleware  = require("../middleware");
const helper      = require("../helper");

let isEmpty       = lodash.isEmpty;

/**
 * Route for the campgrounds index page
 */
router.get("/", async (req, res) => {
  // Request could come from a campground search or directly.
  if (req.query.search) {
    let regexSearch = {$regex: req.query.search, $options: "i"};
    try {
      // Find matching campgrounds
      let foundCamps = await Campground.find({name: regexSearch});
      if (isEmpty(foundCamps)) { 
        throw helper.customErrors.campsMiss;
      }
      let locals = {campgrounds: foundCamps, search: req.query.search};
      res.render( "campgrounds/index", locals)
    } catch (err) {
        helper.displayError(req, err);
        res.redirect("/");
    } 
  } else {
    // Otherwise, show all campgrounds
    try {
      let allCamps = await Campground.find({});
      if (isEmpty(allCamps)) {
        throw helper.customErrors.campsMiss;
      }
      let locals = {campgrounds: allCamps, search: ""};
      res.render(
        "campgrounds/index", locals);
    } catch (err) {
      helper.displayError(req, err);
      res.redirect("/");
    }
  } 
});

/**
 * Route to create a new camp.
 */
router.post("/", middleware.isLoggedIn, async (req, res) => {
  // Manually add the user data to the campground
  let newCampground = req.body.campground;
  newCampground.author = {id: req.user._id, username: req.user.username};
  try {
    let campground = await Campground.create(newCampground);
    if (isEmpty(campground)) {
      throw helper.customErrors.campsCreate;
    }
    req.flash("success", "Campground Created!");
    req.redirect("/campgrounds");
  } catch (err) {
    helper.displayError(req, err);
    res.redirect("/campgrounds");
  }
  
});

/**
 * Route for the page to create a new camp.
 */
router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

/**
 * Route to show a specific camp.
 */
router.get("/:id", (req, res) => {
  Campground.findById(req.params.id).populate("comments").exec( 
  (err, foundCampground) => {
    if (err || !foundCampground) {
      helper.displayError(req, err, helper.customErrors.campId);
      res.redirect("/campgrounds");
    } else {
      res.render("campgrounds/show", {campground: foundCampground});
    }
  });
});

/**
 * Route to page to edit a specific camp.
 */
router.get("/:id/edit", middleware.checkCampStack, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err || !foundCampground) {
      // Handled in middleware.checkCampStack
    } else {
      res.render("campgrounds/edit", {campground: foundCampground});
    }
  });
});

/**
 * Route to update a camp with submitted information.
 */
router.put("/:id", middleware.checkCampStack, (req, res) => {
  Campground.findByIdAndUpdate(
    req.params.id, 
    req.body.campground, 
    (err, updatedCampground) => {
      if (err || !updatedCampground) {
        helper.displayError(req, err, helper.customErrors.campUpdate);
        res.redirect("/campgrounds");
      } else {
        req.flash("success", "Campground Updated!");
        res.redirect("/campgrounds/" + req.params.id);
      }
    }); 
});

/**
 * Route to delete a specific camp.
 */
router.delete("/:id", middleware.checkCampStack, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, (err, removedCamp) => {
    if (err || !removedCamp) {
      helper.displayError(req, err, helper.customErrors.campDelete);
      res.redirect("back");
    } else {
      Comment.deleteMany( {_id: { $in: removedCamp.comments } }, (err) => {
        if (err) {
          req.flash("error", err.message);
          res.redirect("back");
        }
        req.flash("success", "Campground Deleted!");
        res.redirect("/campgrounds"); 
      })
    }
  })
});

module.exports = router;
