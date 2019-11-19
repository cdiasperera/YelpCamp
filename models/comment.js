"use strict";
const mongoose = require("mongoose");

let commentSchema = mongoose.Schema({
  text: String,
  // Referenced User
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Comment", commentSchema);