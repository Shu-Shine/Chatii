const User = require("../models/user")

module.exports.postLogout = async (req, res, next) => {
  
  try {
    
    // const userCheck = await User.findById(req.body._id)
    // clearing the user session
    req.session.user = null;
    return res.send({})

  } catch (error) {
    next(error)  
  }
}
