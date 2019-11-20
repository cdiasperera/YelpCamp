'use strict'

const mongoose = require('mongoose')

const notifSchema = new mongoose.Schema({
  link: String,
  message: String,
  isRead: Boolean,
  notifType: String,
  info: Object
})

notifSchema.method('generateMessage', () => {
  if (this.notifType === 'changelog') {
    this.message = 'There has been a new update since you last logged in!'
  }
})

module.exports = mongoose.model('Notification', notifSchema)
