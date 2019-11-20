'use strict'
const Campground = require('./models/campground')
const Comment = require('./models/comment')
const User = require('./models/user')
const Notification = require('./models/notif')

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
  password: 'a'
}

async function seedDB () {
  try {
    // Clean up DB
    await Promise.all([
      Comment.deleteMany({}),
      Campground.deleteMany({}),
      User.deleteMany({})
    ])

    // Create user using passport.
    const [user, notif] = await Promise.all([
      User.register(
        new User({ username: seedUser.username }),
        seedUser.password
      ),
      Notification.create(
        { isRead: false, notifType: 'changelog' })
    ])

    Notification.generateMessage(notif)
    await notif.save()

    user.notifs.push(notif)
    user.save()

    console.log(user)
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
