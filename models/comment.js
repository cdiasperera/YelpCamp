'use strict'
const mongoose = require('mongoose')

const commentSchema = mongoose.Schema({
  text: String,
  // Referenced User
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
  rating: {
    type: Number,
    required: 'Your review needs a rating!'
  }
})

module.exports = mongoose.model('Comment', commentSchema)
