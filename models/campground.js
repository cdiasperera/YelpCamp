var mongoose = require('mongoose');
// Campground model
var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    desc: String
});
module.exports = mongoose.model("Campground", campgroundSchema);
