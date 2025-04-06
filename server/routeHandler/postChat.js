const Message = require("../models/message");
const { findOrCreateAllChat } = require("../utils/allChat");

// Function handles the chat messages between two users
module.exports.postChat = async (req, res, next) => {
  const { recipientId, currentUserId } = req.body;
  // console.log("req.body", req.body)

  try {
    let query;

    const allChat = await findOrCreateAllChat();
    if (!allChat) {
      return res
        .status(500)
        .json({ message: "Error creating or finding ALL_CHAT" });
    }
    console.log("All Chat ID:", allChat._id);

    if (recipientId.toString() === allChat._id.toString()) {
      // Can’t reliably compare ObjectIds directly using '==='
      query = { users: allChat._id };
    } else {
      query = {
        $or: [
          { users: recipientId, sender: currentUserId },
          { users: currentUserId, sender: recipientId },
        ],
      };
    }

    // populate the avatarimage and username
    const messages = await Message.find(query)
      .populate("sender", "avatarimage username")
      .populate("users", "avatarimage username");

    return res.json({ messages });
  } catch (error) {
    console.error("Error during password or email check when login:", error);
    next(error);
  }
};
