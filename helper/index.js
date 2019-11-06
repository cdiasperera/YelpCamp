const helperObj = {};

helperObj.customErrors = {
  campsMiss:      "Uh oh! We could not find out campgrounds",
  campCreate:     "We could not create your camp! :((",
  campId:         "We could not find that campground matey!",
  campUpdate:     "Huh??? We could not update your camp for some reason",
  campDelete:     "Que??? We could not delete your camp",
  commenCreate:   "Whoops! We could not create your comment for some reason",
  commentId:      "Dios Mio! We could not find that comment",
  commentUpdate:  "Alas! We could not update your comment!!",
  commentDelete:  "Eggo! We could not delete your comment for some reason :("
};

/** 
 * Function to create flash messages for errors. It passes the custom errors
 * ONLY if there exists no pre-existing error. In this case, err is null.
 */
helperObj.displayError = (req, err, customErrorMessage) => {
  if (err) {
    req.flash("error", err.message);
  } else {
    req.flash("error", customErrorMessage);
  }
}

helperObj.makeMongoURI = () => {
  if (process.env.NODE_ENV === "production") {
    return "mongodb+srv://yelpcampadmin:" + process.env.DB_PASS + 
    "@cluster0-uqaxm.mongodb.net/test?retryWrites=true&w=majority"; 
  } else {
    return "mongodb://localhost:27017/yelp_camp";
  }
}
module.exports = helperObj;
