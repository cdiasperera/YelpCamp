'use strict'
const Campground = require('./models/campground')
const Comment = require('./models/comment')
const User = require('./models/user')
const Notification = require('./models/notif')

const moment = require('moment')

// Data to reseed the "campground
const seedCamps = [
  {
    name: 'camp',
    price: 10,
    image: 'https://images.unsplash.com/photo-1497900304864-273dfb3aae33?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1388&q=80',
    desc: 'A hella sick camp.'
  },
  {
    name: 'camp',
    price: 10,
    image: 'https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80',
    desc: 'A so, so camp.'
  },
  {
    name: 'camp',
    price: 10,
    image: 'https://images.unsplash.com/photo-1515408320194-59643816c5b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80',
    desc: 'The worst of the worst.'
  }
]

const seedComment = {
  text: "This is test comment. I really hope this isn't in production",
  author: 'notARealUser',
  rating: 3
}

const seedUser = {
  username: 'aa',
  password: 'a',
  firstName: 'Channa',
  lastName: 'Dias Perera',
  activated: true,
  lastLogin: moment('20111111', 'YYYYMMDD'),
  avatar: '/imgs/no-image.jpg'
}

const seedUser2 = {
  username: 'aaa',
  password: 'a',
  firstName: 'Channa',
  lastName: 'Bup',
  activated: true,
  lastLogin: moment('20111111', 'YYYYMMDD'),
  avatar: '/imgs/no-image.jpg'
}
async function seedDB () {
  console.log('Seeding...')
  try {
    // Clean up DB
    await Promise.all([
      Campground.deleteMany({}),
      Comment.deleteMany({}),
      Notification.deleteMany({}),
      User.deleteMany({})
    ])

    // Create user using passport.
    const [user1, user2] = await Promise.all([
      User.register(
        new User({
          username: seedUser.username,
          lastLogin: seedUser.lastLogin,
          email: seedUser.email,
          activated: seedUser.activated,
          avatar: seedUser.avatar
        }),
        seedUser.password
      ),
      User.register(
        new User({
          username: seedUser2.username,
          lastLogin: seedUser2.lastLogin,
          activated: seedUser2.activated,
          avatar: seedUser2.avatar
        }),
        seedUser2.password
      )
    ])

    user1.followers.push(user2._id)
    await user1.save()

    const NUM_REPS = 1

    for (let rep = 0; rep < NUM_REPS; rep++) {
      for (const [index, seedCamp] of seedCamps.entries()) {
        try {
          seedCamp.name = 'camp' + (rep * seedCamps.length + index + 1)
          const [camp, comment] = await Promise.all(
            [Campground.create(seedCamp),
              Comment.create(seedComment)]
          )

          user1.campsRated.push(camp._id)

          comment.author.id = user1._id
          comment.author.username = user1.username

          camp.author.id = user1._id
          camp.author.username = user1.username
          camp.comments.push(comment)

          camp.averageRating = 3
          camp.numRatings = 1

          await Promise.all([
            camp.save(),
            comment.save(),
            user1.save()
          ])
        } catch (err) {
          console.log(err)
        }
      }
    }
  } catch (err) {
    console.log(err)
  }
}

module.exports = seedDB
