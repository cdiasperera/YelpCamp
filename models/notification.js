'use strict'

const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  link: String,
  message: String,
  isRead: Boolean,
  notifType: String,
  info: Object
})

notificationSchema.method('generateMessage', () => {
  if (this.notifType === 'changelog') {
    this.message = 'There has been a new update since you last logged in!'
  }
})

module.exports = mongoose.model('Notification', notificationSchema)
