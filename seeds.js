var mongoose = require("mongoose");
var Campground = require("./models/campground");

// Data to reseed the "campground
var data = [
  {
    name: "campOne",
    image: "https://images.unsplash.com/photo-1497900304864-273dfb3aae33?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1388&q=80",
    desc: "A hella sick camp." 
  },
  {
    name: "campTwo",
    image: "https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80",
    desc: "A so, so camp." 
  }, 
  {
    name: "campThree",
    image: "https://images.unsplash.com/photo-1515408320194-59643816c5b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80",
    desc: "The worst of the worst."
  },
];

function seedDB() {
  // Removed all "campgrounds
  Campground.deleteMany({}, (err) =>{
    if (err) {
      console.log(err);
    } else {
      console.log("removed campgounds");
    }
  });

  // Add "campgrounds
  data.forEach((campground) => {
    Campground.create(campground, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
      }
    });
  })
}

module.exports = seedDB;