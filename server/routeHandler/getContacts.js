const Message = require("../models/message")

module.exports.getContacts = async (req, res, next) => {
  // get all the contacts of the user
  try {
    const query = {
      $or:[
        {"sender": req.user}, 
        {"users": req.user}]
      }

    const messages = await Message.find(query)
    .populate("sender", "avatarimage ")
    .populate("users", "avatarimage username")

    const recipient_ids = messages.map( message => message.users)  // ._id
    const sender_ids = messages.map( message => message.sender)  // ._id
    const contacts = [...new Set([...recipient_ids, ...sender_ids ])].filter(id => id !== req.user) 
    
    return res.json({ contacts })
    

  } catch (error) {
    console.error('Error during password or email check when login:', error)
    next(error)  //  need an error-handling middleware 
  }
}


