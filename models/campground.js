var mongoose = require('mongoose');
// Campground model
var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    desc: String,
    comments:[
      {
        type: mongoose.Schema.Types.ObjectID,
        ref: "Comment" 
      }
    ]
});
module.exports = mongoose.model("Campground", campgroundSchema);
