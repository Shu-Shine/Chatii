const Message = require("../models/message")
const { findOrCreateAllChat } = require('../utils/allChat');


module.exports.getAllHistory = async (req, res, next) => {
  try {
    const currentUserId = req.params.id;
    const query = {
      $or: [
        { "sender": currentUserId },
        { "users": currentUserId }
      ]
    };
    const allMessages = await Message.find(query)
      .sort({ createdAt: 1 }) // Sort chronologically 
      .populate("sender", "_id username avatarImage")
      .populate("users", "_id username avatarimage")
      .lean(); // better performance with large datasets
  
    if (!allMessages || allMessages.length === 0) {
      return res.json({}); 
    }

    

    return res.json({ allMessages });

  } catch (error) {
    console.error('Error during password or email check when login:', error)
    next(error)  
  }
}
