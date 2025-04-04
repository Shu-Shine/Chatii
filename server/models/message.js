const mongoose = require("mongoose")

const MessageSchema = new mongoose.Schema({   
  // sender: {
  //   username: {
  //     type: String,
  //     required: true,
  //   },
  //   email: {
  //     type: String,
  //   },
  //   avatarimage: {
  //     type: String,
  //     default:"",
  //   },
  //   _id:{
  //     type: String,
  //     required: true, 
  //   },
  // },

  // recipient: {
  //   username: {
  //     type: String,
  //     required: true,
  //   },
  //   email: {
  //     type: String,
  //   },
  //   avatarimage: {
  //     type: String,
  //     default:"",
  //   },
  //   _id:{
  //     type: String,
  //     required: true, 
  //   },
  // },
  users: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference the 'User' model
    required: true,
  },
  isBotMessage: {
    type: Boolean,
    default: false,
  },
  // timestamp: { type: Date, default: Date.now },
  content: String,
},{ timestamps: true })
// },)

module.exports = mongoose.model("Message", MessageSchema)