'use strict'

const mongoose = require('mongoose')

const notifSchema = new mongoose.Schema({
  link: String,
  message: String,
  isRead: {
    type: Boolean,
    default: false
  },
  notifType: String,
  info: Object
})

const model = mongoose.model('Notification', notifSchema)

model.generateMessage = (notif) => {
  if (notif.notifType === 'changelog') {
    notif.message = 'There has been a new update since you last logged in!'
  } else if (notif.notifType === 'newFollower') {
    notif.message = 'You have a new follower!'
  } else if (notif.notifType === 'newCamp') {
    notif.message = `${notif.info.creator} has made a new camp!`
  }
}

module.exports = model
