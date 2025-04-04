const Message = require("../models/message")
const User = require("../models/user")

module.exports.postMessage = async (req, res, next) => {
  
  try {
    
    const newMessage = {
      users: req.body.users, 
      sender: req.body.currentUser,
      content:req.body.content,
      isBotMessage: req.body.isBotMessage || false,
    }

    const message = await Message.create(newMessage)  
    if(message){   
      return res.json({ message })
    }
    
    return res.json({msg: "Failed to add message to database"})
    

  } catch (error) {
    next(error)  
  }
}
