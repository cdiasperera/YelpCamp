"use strict";
const express     = require("express");
const router      = express.Router({mergeParams: true});

const Campground  = require("../models/campground");
const Comment     = require("../models/comment");

const middleware  = require("../middleware");
const helper      = require("../helper");

/**
 * Route for the campgrounds index page
 */
router.get("/", (req, res) => {
  Campground.find({}, (err, allCampgrounds) => {
    if (err || !allCampgrounds) {
      helper.displayError(req, err, helper.customErrors.campsMiss);
      res.redirect("/");
    } else {
      res.render(
        "campgrounds/index",
        {campgrounds: allCampgrounds});
      }
  });
});

/**
 * Route to create a new camp.
 */
router.post("/", middleware.isLoggedIn, (req, res) => {
  // Manually add the user data to the campground
  var newCampground = req.body.campground;
  newCampground.author = {
    id: req.user._id,
    username: req.user.username
  }
  Campground.create(newCampground, (err, campground) => {
    if (err ||!campground) {
      helper.displayError(req, err, helper.customErrors.campCreate);
      res.redirect("/campgrounds");
    } else {
      req.flash("success", "Campground Created!");
      res.redirect("campgrounds/");
    }
  });
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
