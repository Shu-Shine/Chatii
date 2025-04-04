const User = require("../models/user")

module.exports.getAllUsers = async (req, res, next) => {
  
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarimage",
      "_id",
    ])

    return res.json(users)

  } catch (ex) {
    console.log("error get all users ")
    next(ex);
  }
 
}
