const User = require("../models/user");

module.exports.postAvatar = async (req, res, next) => {
  const { _id, avatarimage } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { avatarimage },
      { new: true }
    );

    if (!updatedUser) {
      return res.json({ status: false, msg: "User not found" });
    }

    return res.json({ status: true, avatarimage: avatarimage });
  } catch (error) {
    next(error); //  need an error-handling middleware
  }
};
