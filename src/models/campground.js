var mongoose = require('mongoose');

var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    desc: String,
    price: String,
    // Reerenced Comment
    comments:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment" 
      }
    ],
    // Referencd User
    author: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      username: String
    }
});

module.exports = mongoose.model("Campground", campgroundSchema);
