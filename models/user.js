'use strict'
const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = mongoose.Schema({
  username: String,
  password: String,
  lastLogin: Date,
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }]
})

UserSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model('User', UserSchema)
