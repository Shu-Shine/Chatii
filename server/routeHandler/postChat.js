const Message = require("../models/message")

module.exports.postChat = async (req, res, next) => {
  const {recipientId, currentUserId} = req.body

  try {
    let query;
    if (recipientId === "ALL_CHAT") {
      query = { "recipient._id": recipientId };
    } else {
      query = {
        $or: [
          { "recipient._id": recipientId, "sender._id": currentUserId },
          { "recipient._id": currentUserId, "sender._id": recipientId }
        ]
      };
    }

    const messages = await Message.find(query);
    return res.json({ messages });

  } catch (error) {
    console.error('Error during password or email check when login:', error)
    next(error)  
  }
}
