const User = require("../models/user");

module.exports.postAvatar = async (req, res, next) => {
  
  console.log("--- Entered postAvatar Handler ---");

  const { _id, avatarimage } = req.body;

  console.log("Received User ID:", _id);
  // Avoid logging the entire Base64 string, just log the beginning to confirm it arrived
  console.log("Received Avatar Data URL (start):", avatarimage ? avatarimage.substring(0, 80) : "No avatar data received");
  // Log the length to check if it's suspiciously short or long
  console.log("Received Avatar Data URL (length):", avatarimage ? avatarimage.length : 0);

  // Basic validation
  if (!_id || !avatarimage) {
    console.error("!!! Missing _id or avatarimage in request body");
    return res.json({ status: false, msg: "Missing user ID or avatar data" });
  }
  if (!avatarimage.startsWith('data:image/')) {
     console.error("!!! Received avatarimage does not look like a valid data URL");
     return res.json({ status: false, msg: "Invalid avatar data format" });
  }


  try {
    // console.log(`Attempting User.findByIdAndUpdate for ID: ${_id}`);

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { avatarimage: avatarimage,},
      { new: true, } // {new: true} returns the updated document
    );

    if (!updatedUser) {
      // Log specifically if the user wasn't found
      console.log(`User not found for ID: ${_id}`);
      return res.json({ status: false, msg: "User not found" });
    }

    // console.log(`Successfully updated avatar for user: ${updatedUser._id}`);
    // console.log("Updated user avatar set status:", updatedUser.isAvatarImageSet); // Check the flag too
    // console.log("Sending success response to client.");

    return res.json({
        status: true,
        avatarimage: updatedUser.avatarimage // Send back the image stored in DB
    });

  } catch (error) {

    console.error("!!! Error during avatar update:", error);
    // console.error("Error Message:", error.message);
    // console.error("Error Stack:", error.stack);

    // res.status(500).json({ status: false, msg: "Server error updating avatar" });
    next(error);
  }
};


// module.exports.postAvatar = async (req, res, next) => {
//   const { _id, avatarimage } = req.body;

//   try {
//     const updatedUser = await User.findByIdAndUpdate(
//       _id,
//       { avatarimage },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res.json({ status: false, msg: "User not found" });
//     }

//     return res.json({ status: true, avatarimage: avatarimage });
//   } catch (error) {
//     next(error); //  need an error-handling middleware
//   }
// };
