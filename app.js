// Setup the server
var express = require("express");
var app = express();

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

// Setup database
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser: true, useUnifiedTopology: true});

// Schemas
var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    desc: String
});
var Campground = mongoose.model("Campground", campgroundSchema);

// Read the body of a request
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }))

// Routing
app.get("/", (req, res) => {
    res.render("homepage");
});

app.get("/campgrounds", (req, res) => {
    Campground.find({}, (err, allCampgrounds) => {
        if (err) {
            console.log(err);
        } else {
        res.render("campgrounds", {campgrounds: allCampgrounds});
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
            res.redirect("/campgrounds");
        }
    });
});

app.get("/campgrounds/new", (req, res) => {
    res.render("new");
});

app.get("/campgrounds/:name", (req, res) => {
    var campName = req.params.name;
    Campground.findOne({name: campName}, (err, foundCampground) => {
       if (err) {
           console.log(err);
       } else {
           res.render("show", {campground: foundCampground});
       }
    });
});
// Start server
port = process.env.port || 3000;
app.listen(port, () => {
    console.log("YelpCamp server is running.")
});