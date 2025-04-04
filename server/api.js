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

// creating a proxy endpoint
const axios = require('axios');
console.log("--- api.js (or api/index.js) is being loaded ---");
const MULTIAVATAR_API_URL = "https://api.multiavatar.com";

router.get('/utils/getavatar/:seed', async (req, res, next) => {
console.log(`--- ENTERED /utils/getavatar/:seed route handler for seed: ${req.params.seed} ---`); // <--- ADD THIS
    try {
        const seed = req.params.seed;
        if (!seed) {
            return res.status(400).json({ message: 'Avatar seed is required' });
        }

        // Make request from YOUR server to multiavatar
        const avatarResponse = await axios.get(`${MULTIAVATAR_API_URL}/${seed}`, {
            // IMPORTANT: Request the response as an ArrayBuffer for binary data (like images)
            responseType: 'arraybuffer'
        });

        // Relay the necessary headers and the data back to your frontend
        // Set the correct content type for SVG
        res.setHeader('Content-Type', 'image/svg+xml');
        // Send the image data (which is in avatarResponse.data as an ArrayBuffer)
        res.send(avatarResponse.data);

    } catch (error) {
        console.error("Error fetching avatar from multiavatar:", error.message);
        // Send an appropriate error status back to your frontend
        const status = error.response ? error.response.status : 500;
        const message = error.response ? error.response.statusText : 'Internal Server Error';
        res.status(status).json({ message: `Failed to fetch avatar: ${message}` });
    }
});



router.post("/register", postRegister)
router.post("/login", postLogin)
router.post("/utils/setavatar/:id", postAvatar)  // need placeholder

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