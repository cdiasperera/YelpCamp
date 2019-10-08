// Setup the server
var express = require("express");
var app = express();

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

// Read the body of a request
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }))

// Routing
app.get("/", (req, res) => {
    res.render("homepage");
});

var campgrounds = [
    {name: "Salmon Creek", image: "https://grist.files.wordpress.com/2017/05/tent-campsite-by-river.jpg?w=1024&h=576&crop=1"},
    {name: "Granite Hill", image: "https://www.camping.se/ImageVaultFiles/id_2034/cf_239/st_edited/8ZfOHyVM3gcxasp5N1En.jpg"},
    {name: "Mountain Goat\"s Rest", image:"https://s3.ap-south-1.amazonaws.com/campmonk.com/blogs/5879f8e0-5be4-11e8-a7bc-5f5bfad23fd4-1200-1200.jpeg"}
];

app.get("/campgrounds", (req, res) => {
    res.render("campgrounds", {campgrounds: campgrounds});
});

app.post("/campgrounds", (req, res) => {
    var newCampground = {name: req.body.name, image:req.body.source};
    campgrounds.push(newCampground);
    res.render("campgrounds", {campgrounds: campgrounds});
});

app.get("/campgrounds/new", (req, res) => {
    res.render("new");
});
// Start server
port = process.env.port || 3000;
app.listen(port, () => {
    console.log("YelpCamp server is running.")
});