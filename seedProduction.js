'use strict'

const Campground = require('./models/campground')
const Comment = require('./models/comment')
const Notification = require('./models/notif')
async function seedDB () {
  try {
    await Promise.all([
      Campground.deleteMany({}),
      Comment.deleteMany({}),
      Notification.deleteMany({})
    ])
  } catch (err) {
    console.log(err)
  }
}

module.exports = seedDB
