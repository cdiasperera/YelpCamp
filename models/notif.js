'use strict'

const mongoose = require('mongoose')

const notifSchema = new mongoose.Schema({
  link: String,
  message: String,
  isRead: Boolean,
  notifType: String,
  info: Object
})

const model = mongoose.model('Notification', notifSchema)

model.generateMessage = (notif) => {
  if (notif.notifType === 'changelog') {
    notif.message = 'There has been a new update since you last logged in!'
  }
}

module.exports = model
