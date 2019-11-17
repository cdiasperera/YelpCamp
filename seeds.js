"use strict";
let mongoose    = require("mongoose");
let Campground  = require("./models/campground");
let Comment     = require("./models/comment");
let User        = require("./models/user");
// Data to reseed the "campground
let seeds = [
  {
    name: "campOne",
    price: 10,
    image: "https://images.unsplash.com/photo-1497900304864-273dfb3aae33?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1388&q=80",
    desc: "A hella sick camp." 
  },
  {
    name: "campTwo",
    price: 10,
    image: "https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80",
    desc: "A so, so camp." 
  }, 
  {
    name: "campThree",
    price: 10,
    image: "https://images.unsplash.com/photo-1515408320194-59643816c5b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80",
    desc: "The worst of the worst."
  },
];

let testComment = {
  text: "This is test comment. I really hope this isn't in production",
  author: "notARealUser"
}

async function seedDB() {
  try {
    await Comment.deleteMany({});
    await Campground.deleteMany({});
    await User.deleteMany({});

    seeds.forEach(async (seed) => {
      let camp    = await Campground.create(seed);
      let comment = await Comment.create(testComment);
      camp.comments.push(comment);
      campground.save();
    });
  } catch (err) {
  console.log(err);
  }
}

module.exports = seedDB;