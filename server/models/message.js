const mongoose = require("mongoose")

const MessageSchema = new mongoose.Schema({   
  sender: {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    avatarimage: {
      type: String,
      default:"",
    },
    _id:{
      type: String,
      required: true, 
    },
  },

  recipient: {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    avatarimage: {
      type: String,
      default:"",
    },
    _id:{
      type: String,
      required: true, 
    },
  },
  timestamp: { type: Date, default: Date.now },
  content: String,
})
  // sender: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  //   required: true,
  // },
  // recipient: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  //   required: true,
  // },

module.exports = mongoose.model("Message", MessageSchema)