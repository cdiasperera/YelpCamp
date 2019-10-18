// Setup the server
var express = require("express");
var app = express();

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

// Read the body of a request
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }))

// Setup database
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser: true, useUnifiedTopology: true});

Campground  = require("./models/campground");
Comment     = require("./models/comment");
// Seed the Db
var seedDB = require("./seeds");
// seedDB();

// Routing
app.get("/", (req, res) => {
    res.render("homepage");
});

app.get("/campgrounds", (req, res) => {
    Campground.find({}, (err, allCampgrounds) => {
        if (err) {
            console.log(err);
        } else {
        res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
});

app.post("/campgrounds", (req, res) => {
    var newCampground = {   name: req.body.name, image:req.body.source,
                            desc: req.body.desc};
    Campground.create(newCampground, (err, campground) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect("campgrounds/index");
        }
    });
});

app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
});

app.get("/campgrounds/:id", (req, res) => {
    Campground.findById(req.params.id).populate("comments").exec( 
    (err, foundCampground) => {
      if (err) {
        console.log(err);
      } else {
        res.render("campgrounds/show", {campground: foundCampground});
      }
    });
});

// ROUTES FOR COMMENTS
app.get("/campgrounds/:id/comments/new", (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", {campground: foundCampground});
    }
  });
});

app.post("/campgrounds/:id/comments", (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    Comment.create(req.body.comment, (err, comment) => {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        campground.comments.push(comment);
        campground.save();
        res.redirect("/campgrounds/" + campground._id);
      }
    });
  });
});

// Start server[]
port = process.env.port || 3000;
app.listen(port, () => {
    console.log("YelpCamp server is running.")
});