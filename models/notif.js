'use strict'

const mongoose = require('mongoose')
const User = require('./user')

const notifSchema = new mongoose.Schema({
  link: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
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

/**
 * Creates a notification object to send to anyone, any number of times
 */
model.createNotification = async (template) => {
  const notif = await model.create(template)
  model.generateMessage(notif)

  await notif.save()

  return notif
}

model.sendNotifications = async (recipients, notif) => {
  /**
   * First, we find all the followers asynchronously.
   * That way, we can executing sending notifications in parrallel
   */
  const findRecipientQuries = []
  for (const follower of recipients) {
    findRecipientQuries.push(User.findById(follower._id))
  }

  /**
   * As we find each follower, we add the notification to their current notifs
   * We also save each notification asynch
   */
  let foundRecipients = 0
  const saveReceiverQueries = []
  const saveNotifQueries = []
  while (foundRecipients < findRecipientQuries.length) {
    const foundRecipient = await Promise.race(findRecipientQuries)
    notif.author.id = foundRecipient._id
    saveNotifQueries.push(notif.save())
    foundRecipient.notifs.push(notif)

    saveReceiverQueries.push(foundRecipient.save())
    foundRecipients++
  }

  await Promise.all(saveNotifQueries)
  await Promise.all(saveReceiverQueries)
}

module.exports = model
