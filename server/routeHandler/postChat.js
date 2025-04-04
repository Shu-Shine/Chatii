const Message = require("../models/message")

module.exports.postChat = async (req, res, next) => {
  const {recipientId, currentUserId} = req.body

  try {
    let query;
    if (recipientId === "ALL_CHAT") {
      query = { "users": recipientId };
    } else {
      query = {
        $or: [
          { "users": recipientId, "sender": currentUserId },
          { "users": currentUserId, "sender": recipientId }
        ]
      };
    }

    // populate the avatarimage and username 
    const messages = await Message.find(query)
    .populate("sender", "avatarimage username")
    .populate("users", "avatarimage username")

    return res.json({ messages });

  } catch (error) {
    console.error('Error during password or email check when login:', error)
    next(error)  
  }
}
