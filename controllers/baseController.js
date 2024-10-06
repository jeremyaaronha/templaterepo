const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {title: "Home", nav})
}


exports.triggerError = (req, res, next) => {
    next(new Error("This is an intentional server error!"));
};


module.exports = baseController
