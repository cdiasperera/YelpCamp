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
  let search, dbSearchParams;
  if (req.query.search) {
    // If the request came from a serach, form the search regex.
    let regexSearch = {$regex: req.query.search, $options: "i"};
    dbSearchParams = {name: regexSearch};
    search = req.query.search;
  } else {
    // Otherwise set the regex to find all the camps.
    dbSearchParams = {};
    search ="";
  }

  try {
    let foundCamps = await Campground.find(dbSearchParams);
    if (isEmpty(foundCamps)) { 
      throw helper.customErrors.campsMiss;
    }

    let locals = {camps: foundCamps, search: search};
    res.render( "campgrounds/index", locals)
  } catch (err) {
      helper.displayError(req, err);
      res.redirect("/");
  } 
});

/**
 * Route to create a new camp.
 */
router.post("/", middleware.isLoggedIn, async (req, res) => {
  // Manually add the user data to the campground
  let newCamp = req.body.camp;
  newCamp.author = {id: req.user._id, username: req.user.username};
  try {
    let camp = await Campground.create(newCamp);
    if (isEmpty(camp)) {
      throw helper.customErrors.campsCreate;
    }
    req.flash("success", "Campground Created!");
    res.redirect("/campgrounds");
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
router.get("/:id", async (req, res) => {
 
  try {
    let foundCamp    = await Campground .findById(req.params.id)
                                        .populate("comments");

    res.render("campgrounds/show", {camp: foundCamp});
  } catch (err) {
    helper.displayError(req, err);
    res.redirect("/campgrounds");
  }
});

/**
 * Route to page to edit a specific camp.
 */
router.get("/:id/edit", middleware.checkCampStack, async (req, res) => {
  try {
    let foundCamp = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", {camp: foundCamp});
  } catch (err) {
    // Handled in middleware.checkCampStack
  }
});

/**
 * Route to update a camp with submitted information.
 */
router.put("/:id", middleware.checkCampStack, async (req, res) => {
  try {
    let updatedCamp = await Campground.findByIdAndUpdate( req.params.id,
                                                          req.body.camp);
    if (isEmpty(updatedCamp)) {
      throw helper.customErrors.campUpdate;
    }
    req.flash("success", "Campground Updated!");
    red.redirect("/campgrounds/" + req.params.id);
  } catch (err) {
    helper.displayError(req, err);
    res.redirect("/campgrounds");
  }
});

/**
 * Route to delete a specific camp.
 */
router.delete("/:id", middleware.checkCampStack, async (req, res) => {
  try {
    let debug = 1;
    let removedCamp = await Campground.findByIdAndRemove(req.params.id); 
    await Comment.deleteMany(
      {_id: {$in: removedCamp.comments}}
    );

    req.flah("success", "Campground Deleted!");
    res.redirect("/campgrounds");
  } catch (err) {
    console.log(err);
    helper.displayError(req, err);
    res.redirect("back");
  } 
});

module.exports = router;
