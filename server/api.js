const { postRegister } = require("./routeHandler/postRegister")
const { postLogin } = require("./routeHandler/postLogin")
const { postAvatar } = require("./routeHandler/postAvatar")
const { postChat } = require("./routeHandler/postChat")
const {getContacts} = require("./routeHandler/getContacts")
const { getAllUsers } = require("./routeHandler/getAllUsers")
const { postMessage } = require("./routeHandler/postMessage")
const { postLogout } = require("./routeHandler/postLogout")

const express = require("express")
const router = express.Router()


router.post("/register", postRegister)
router.post("/login", postLogin)
router.post("/setavatar/:id", postAvatar)  // need placeholder

router.post("/chat", postChat)
router.post("/contacts", getContacts)  //? not used yet
router.get("/allusers/:id", getAllUsers)
router.post("/message", postMessage)
router.post("/logout", postLogout)


router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
})

module.exports = router