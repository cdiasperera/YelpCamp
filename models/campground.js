'use strict'
const mongoose = require('mongoose')

const campgroundSchema = new mongoose.Schema({
  name: String,
  image: String,
  desc: String,
  price: String,
  location: String,
  lat: Number,
  lng: Number,
  // Reerenced Comment
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],
  // Referencd User
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  averageRating: {
    type: Number,
    default: 0
  },
  numRatings: {
    type: Number,
    default: 0
  }
})

module.exports = mongoose.model('Campground', campgroundSchema)
