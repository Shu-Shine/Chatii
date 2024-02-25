const Message = require("../models/message")
const User = require("../models/user")

module.exports.postMessage = async (req, res, next) => {
  
  try {
    
    const newMessage = {
      recipient: req.body.recipient,
      sender: req.body.currentUser,
      content:req.body.content,
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
