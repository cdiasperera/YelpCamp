'use strict'
const express = require('express')
const router = express.Router({ mergeParams: true })
const lodash = require('lodash')
const Nodegeocoder = require('node-geocoder')
const Campground = require('../models/campground')
const Comment = require('../models/comment')
const User = require('../models/user')
const Notification = require('../models/notif')

const middleware = require('../middleware')
const helper = require('../helper')

const isEmpty = lodash.isEmpty

const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.MAPS_SERVER_API_KEY,
  formatter: null
}

const geocoder = Nodegeocoder(options)

router.get('/', (req, res) => {
  // Redirect to page 1 of campgrounds
  let searchQuery = ''
  if (req.query.search) {
    searchQuery = '?search=' + req.query.search
  }
  res.redirect('/campgrounds/page/1' + searchQuery)
})

router.get('/page/', (req, res) => {
  res.redirect('/campgrounds/page/1')
})

router.post('/page/', (req, res) => {
  res.redirect('/campgrounds/page/' + req.body.page)
})

router.get('/page/:page', async (req, res) => {
  // Request could come from a campground search or directly.
  let search
  let dbSearchParams
  if (req.query.search) {
    // If the request came from a serach, form the search regex.
    const regexSearch = { $regex: req.query.search, $options: 'i' }
    dbSearchParams.name = regexSearch
    search = req.query.search
  } else {
    // Otherwise set the regex to find all the camps.
    dbSearchParams= {}
    search = ''
  }

  try {
    const PER_PAGE = 6
    const firstCampIndex = (req.params.page - 1) * PER_PAGE
    const foundCamps = await (
      Campground.find(dbSearchParams)
        .sort('-averageRating')
        .skip(firstCampIndex)
        .limit(PER_PAGE)
    )

    const pageInfo = {
      currentPage: parseInt(req.params.page),
      numPages: parseInt(
        Math.ceil((await Campground.countDocuments()) / PER_PAGE)
      )
    }

    const locals = { camps: foundCamps, search: search, pageInfo: pageInfo }
    res.render('campgrounds/index', locals)
  } catch (err) {
    helper.displayError(req, err)
    res.redirect('/')
  }
})

/**
 * Route to create a new camp.
 */
router.post('/', middleware.isLoggedIn, async (req, res) => {
  // Manually add the user data to the campground
  const newCamp = req.body.camp
  if (!/^http.*/.test(newCamp.image)) {
    // The image is trying to access an image outside the internet. Thus, it
    // will ping the server. We must set the image to be no-image.jpg
    newCamp.image = '/imgs/no-image.jpg'
  }
  newCamp.author = { id: req.user._id, username: req.user.username }
  try {
    const geoData = await geocoder.geocode(req.body.camp.location)
    console.log(geoData)
    const location = geoData[0]
    if (!isEmpty(location)) {
      newCamp.lat = location.latitude
      newCamp.lng = location.longitude

      newCamp.location = location.formattedAddress
    } else {
      throw helper.customErrors.locationInvalid
    }
    const promises = []
    // Step 1: Create Campground
    promises.push(Campground.create(newCamp))
    promises.push(User.findById(req.user._id))

    const [camp, user] = await Promise.all(promises)
    if (isEmpty(camp)) {
      throw helper.customErrors.campsCreate
    }
    req.flash('success', 'Campground Created!')

    console.log({ user })
    // Step 2: Notify Followers

    // First, create a notification
    const notifTemp = {
      link: `/campgrounds/${camp.id}`,
      notifType: 'newCamp',
      info: { creator: user.username }
    }
    const notif = await Notification.create(notifTemp)
    Notification.generateMessage(notif)
    notif.author.id = user._id
    await notif.save()

    console.log({ notif })
    // Make a promise to get each follower
    const findFollowers = []
    for (const follower of user.followers) {
      findFollowers.push(User.findById(follower))
    }

    // THe number of followers found
    let foundFollowers = 0

    // An array to hold the promises to save the notif of each follower
    while (foundFollowers < findFollowers.length) {
      const foundFollower = await Promise.race(findFollowers)

      foundFollower.notifs.push(notif)
      await foundFollower.save()
      foundFollowers++
    }

    res.redirect('/campgrounds')
  } catch (err) {
    helper.displayError(req, err)
    res.redirect('/campgrounds')
  }
})

/**
 * Route for the page to create a new camp.
 */
router.get('/new', middleware.isLoggedIn, (req, res) => {
  res.render('campgrounds/new')
})

/**
 * Route to show a specific camp.
 */
router.get('/:id', async (req, res) => {
  try {
    const foundCamp = await Campground.findById(req.params.id)
      .populate('comments')
    // An array of queries to get the avatars of associated comments
    const queries = []
    for (const comment of foundCamp.comments) {
      // Get promise to get the users for each comment
      queries.push(User.findById(comment.author.id))
    }

    // Wait for all the  for users to finish
    const users = await Promise.all(queries)
    foundCamp.comments.forEach((comment, index) => {
      comment.author.avatar = users[index].avatar
      comment.author.username = users[index].username
    })

    const locals = {
      camp: foundCamp,
      key: process.env.MAPS_WEBSITE_API_KEY,
      userComment: undefined
    }
    if (req.user && req.user.campsRated.includes(foundCamp._id)) {
      (() => {
        foundCamp.comments.forEach(comment => {
          if (comment.author.id.equals(req.user.id)) {
            locals.userComment = comment
            return locals.userComment
          }
        })
      })()
    }

    res.render('campgrounds/show', locals)
  } catch (err) {
    helper.displayError(req, err)
    res.redirect('/campgrounds')
  }
})

/**
 * Route to page to edit a specific camp.
 */
router.get('/:id/edit', middleware.checkCampStack, async (req, res) => {
  try {
    const foundCamp = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { camp: foundCamp })
  } catch (err) {
    // Handled in middleware.checkCampStack
  }
})

/**
 * Route to update a camp with submitted information.
 */
router.put('/:id', middleware.checkCampStack, async (req, res) => {
  try {
    const newCamp = req.body.camp
    if (!/^http.*/.test(newCamp.image)) {
      // The image is trying to access an image outside the internet. Thus, it
      // will ping the server. We must set the image to be no-image.jpg
      newCamp.image = '/imgs/no-image.jpg'
    }
    const geoData = await geocoder.geocode(req.body.camp.location)
    if (!isEmpty(geoData)) {
      newCamp.lat = geoData[0].latitude
      newCamp.lng = geoData[0].longitude

      newCamp.location = geoData[0].formattedAddress
    } else {
      throw helper.customErrors.locationInvalid
    }
    const updatedCamp = await Campground.findByIdAndUpdate(req.params.id,
      newCamp)
    if (isEmpty(updatedCamp)) {
      throw helper.customErrors.campUpdate
    }
    req.flash('success', 'Campground Updated!')
    res.redirect('/campgrounds/' + req.params.id)
  } catch (err) {
    helper.displayError(req, err)
    res.redirect('/campgrounds')
  }
})

/**
 * Route to delete a specific camp.
 */
router.delete('/:id', middleware.checkCampStack, async (req, res) => {
  try {
    const removedCamp = await Campground.findByIdAndRemove(req.params.id)
    await Comment.deleteMany(
      { _id: { $in: removedCamp.comments } }
    )

    req.flash('success', 'Campground Deleted!')
    res.redirect('/campgrounds')
  } catch (err) {
    console.log(err)
    helper.displayError(req, err)
    res.redirect('back')
  }
})

module.exports = router
