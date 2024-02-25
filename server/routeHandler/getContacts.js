const Message = require("../models/message")

module.exports.getContacts = async (req, res, next) => {

  try {
    const query = {
      $or:[
        {"sender._id": req.user._id}, 
        {"recipient._id": req.user._id}]
      }

    const messages = await Message.find(query)
    const recipient_ids = messages.map( message => message.recipient._id)  
    const sender_ids = messages.map( message => message.sender._id)  
    const contacts = [...new Set([...recipient_ids, ...sender_ids ])].filter(id => id !== req.user._id) 
    
    return res.json({ contacts })
    

  } catch (error) {
    console.error('Error during password or email check when login:', error)
    next(error)  //  need an error-handling middleware 
  }
}


