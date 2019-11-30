'use strict'
const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = mongoose.Schema({
  username: String,
  password: String,
  resetToken: String,
  resetExpiry: Date,
  lastLogin: Date,
  avatar: String,
  firstName: String,
  lastName: String,
  email: String,
  notifs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
})

UserSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model('User', UserSchema)
