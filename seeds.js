'use strict'
const Campground = require('./models/campground')
const Comment = require('./models/comment')
const User = require('./models/user')
const Notification = require('./models/notif')

const moment = require('moment')

// Data to reseed the "campground
const seedCamps = [
  {
    name: 'campOne',
    price: 10,
    image: 'https://images.unsplash.com/photo-1497900304864-273dfb3aae33?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1388&q=80',
    desc: 'A hella sick camp.'
  },
  {
    name: 'campTwo',
    price: 10,
    image: 'https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80',
    desc: 'A so, so camp.'
  },
  {
    name: 'campThree',
    price: 10,
    image: 'https://images.unsplash.com/photo-1515408320194-59643816c5b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80',
    desc: 'The worst of the worst.'
  }
]

const seedComment = {
  text: "This is test comment. I really hope this isn't in production",
  author: 'notARealUser'
}

const seedUser = {
  username: 'a',
  password: 'a',
  lastLogin: moment('20111111', 'YYYYMMDD')
}

async function seedDB () {
  try {
    // Clean up DB
    await Promise.all([
      Comment.deleteMany({}),
      Campground.deleteMany({}),
      User.deleteMany({}),
      Notification.deleteMany({})
    ])

    // Create user using passport.
    const [user, ...notifs] = await Promise.all([
      User.register(
        new User({
          username: seedUser.username,
          lastLogin: seedUser.lastLogin
        }),
        seedUser.password
      )
    ])

    for (const notif of notifs) {
      try {
        Notification.generateMessage(notif)
        await notif.save()

        await user.notifs.push(notif)
      } catch (err) {
        console.log(err)
      }
    }

    await user.save()

    seedCamps.forEach(async (seedCamp) => {
      try {
        const [camp, comment] = await Promise.all(
          [Campground.create(seedCamp),
            Comment.create(seedComment)]
        )

        comment.author.id = user._id
        comment.author.username = user.username
        comment.save()

        camp.author.id = user._id
        camp.author.username = user.username
        camp.comments.push(comment)
        camp.save()
      } catch (err) {
        console.log(err)
      }
    })
  } catch (err) {
    console.log(err)
  }
}

module.exports = seedDB
