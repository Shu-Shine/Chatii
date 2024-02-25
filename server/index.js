const path = require("path")
const bodyParser = require("body-parser"); // allow node to automatically parse POST body requests as JSON
const express = require("express"); // backend framework for our node server.
const socket = require("socket.io")


// stay login at backend
const session = require("express-session")
const auth = require("./auth");

const api = require("./api");
const cors = require("cors")

require("dotenv").config({ path: path.join(__dirname, '.env') })
const mongoose = require("mongoose")
const mongoConnectionURL = process.env.MONGO_URL
const databaseName = "chati"

// connect to mongodb
mongoose
  .connect(mongoConnectionURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: databaseName,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(`Error connecting to MongoDB: ${err}`));


// create a new express server
const app = express()

// enable Cross-Origin Resource Sharing
app.use(cors())
// set up bodyParser, which allows us to process POST requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// set up a session, which will persist login data across requests
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// this checks if the user is logged in, and populates "req.user"
app.use(auth.populateCurrentUser);


// connect user-defined routes
app.use("/api", api);




// any server errors cause this function to run
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) {
    // 500 means Internal Server Error
    console.log("The server errored when processing a request!");
    console.log(err);
  }

  res.status(status);
  res.send({
    status: status,
    message: err.message,
  });
});


const port = process.env.PORT 
const server = app.listen(port, ()=>{
  console.log(`Server running on port: ${port}`)
})


const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
})

global.onlineUsers = new Map()  //

io.on("connection", (socket)=>{
  global.chatSocket = socket
  socket.on("addUser", (userId)=>{

    global.onlineUsers.set(userId, socket.id)
  })

  socket.on("sendMessage", (data)=>{
    // console.log("data",data)
    
    const socketId = global.onlineUsers.get(data.recipient._id)

    if(socketId){
      socket.to(socketId).emit("getMessage", data)

    }
  })
})





