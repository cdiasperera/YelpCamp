'use strict'
const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = mongoose.Schema({
  username: String,
  password: String,
  resetTokenHash: String,
  resetExpiry: Date,
  lastLogin: Date,
  avatar: String,
  firstName: String,
  lastName: String,
  email: String,
  activated: {
    type: Boolean,
    default: false
  },
  activateToken: String,
  notifs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  campsRated: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campground'
  }]
})

UserSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model('User', UserSchema)
