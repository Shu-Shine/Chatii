const path = require("path")
const bodyParser = require("body-parser"); // allow node to automatically parse POST body requests as JSON
const express = require("express"); // backend framework for our node server.
const socket = require("socket.io")

// stay login at backend
const session = require("express-session")
const cors = require("cors")
require("dotenv").config({ path: path.join(__dirname, '../.env') })

// import services
const auth = require("./utils/auth");
const api = require("./api");
const { getChatbotResponse } = require('./utils/chatbotService');
const { findOrCreateAllChat } = require('./utils/allChat');


const mongoose = require("mongoose")
const mongoConnectionURL = process.env.MONGO_URL
const databaseName = "chati"
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// connect to mongodb
mongoose
  .connect(mongoConnectionURL, {
    dbName: databaseName,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(`Error connecting to MongoDB: ${err}`));


// create a new express server
const app = express()

// Middleware
app.use(express.static("public"));
// enable Cross-Origin Resource Sharing
app.use(cors())
// set up bodyParser, which allows us to process POST requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '5mb' })); // increase limit to 5mb

// set up a session, which will persist login data across requests
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Auth middleware: this checks if the user is logged in, and populates "req.user"
app.use(auth.populateCurrentUser);


// API routes: connect user-defined routes
app.use("/api", api);


// Chatbot User Setup
const User = require("./models/user"); 
const Message = require("./models/message");

let botUser;
const BOT_AVATAR_DEFAULT = ' '; 

async function findOrCreateBotUser() {
    const botUsername = 'ChatBot';
    try {
        botUser = await User.findOne({ username: botUsername });
        if (!botUser) {
            console.log('Creating Bot User...');
            botUser = new User({
                username: botUsername,
                email: process.env.REACT_APP_BOT_USER_EMAIL, // Use a non-real email
                password: Math.random().toString(36).slice(-8), // Random password, won't be used
                avatarimage: BOT_AVATAR_DEFAULT, 
            });

            // If using bcrypt:
            const bcrypt = require('bcrypt');
            const salt = await bcrypt.genSalt(10);
            botUser.password = await bcrypt.hash(botUser.password, salt);

            await botUser.save();
            console.log('Bot User Created:', botUser._id);
        } else {
            console.log('Bot User Found:', botUser._id);
  
        }
    } catch (error) {
        console.error("Error finding or creating bot user:", error);
        // Handle error appropriately, maybe exit server if bot is critical
    }
}
findOrCreateBotUser(); // Run on server start


// Error handling middleware (Keep at the end), any server errors cause this function to run
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


const port = process.env.PORT || 5000
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
  console.log(`Socket connected: ${socket.id}`);
  global.chatSocket = socket

  socket.on("addUser", (userId)=>{

    // global.onlineUsers.set(userId, socket.id)
    if (userId) {
      global.onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} added with socket ID ${socket.id}. Online users: ${global.onlineUsers.size}`);
      // Optional: Broadcast online users list update
       io.emit("getOnlineUsers", Array.from(global.onlineUsers.keys()));
    } else {
        console.warn(`addUser event received with undefined userId from socket ${socket.id}`);
    }
  })

  // socket.on("sendMessage", (data)=>{
  //   // console.log("sendMessage data received:", data);
    
  //   const socketId = global.onlineUsers.get(data.recipient._id)

  //   if(socketId){
  //     socket.to(socketId).emit("getMessage", data)
  //   }
  // })
// })

  socket.on("sendMessage", async (data) => {
    const { from, to, content } = data;
    // console.log("sendMessage data:", from, to, content ); // Log destructured data
    // console.log("botUser", botUser); // Log socket ID

    if (!from || !to || !content) {
         console.error("sendMessage error: Missing data fields.", from,to,content);
         socket.emit("messageError", { content: "Invalid message data." });
         return; // Stop processing if data is incomplete
    }

    // Ensure botUser is loaded 
    if (!botUser) {
      console.error("Bot user is not initialized yet. Trying again...");
      await findOrCreateBotUser(); // Try to ensure it's loaded
      if (!botUser) {
           console.error("Bot user failed to initialize. Cannot process bot messages.");
      }
  }


    try {
        // Save User's Message，包含全部信息
        const newMessage = new Message({
            content: content ,
            users: to, 
            sender: from,
            isBotMessage: false 
        });
        const savedUserMessage = await newMessage.save();
        console.log("User message saved:", savedUserMessage._id);
        
        const populatedUserMessage = await Message.findById(savedUserMessage._id)
          .populate("sender", "username avatarimage") 
          .populate("users", "username avatarimage");

        console.log("Sending populated message:");

         // Send back to sender with DB info (ID, timestamp)
         socket.emit("getMessage", populatedUserMessage);   // savedUserMessage

        // Send to Recipient (if online)
        const recipientSocketId = global.onlineUsers.get(to._id);  // ._id
        if (recipientSocketId && recipientSocketId !== socket.id) { 
            // console.log(`Sending message ${savedUserMessage._id} from ${from} to ${to} (socket ${recipientSocketId})`);
            io.to(recipientSocketId).emit("getMessage", savedUserMessage);
        } else if (recipientSocketId === socket.id) {
             console.log(`Recipient ${to._id} is the same as sender ${from}. Message already emitted.`);
        }
         else {
            console.log(`Recipient ${to} is offline.`);
        }

        // --- Chatbot Logic ---
        const botTrigger = "@chatbot ";
        if (botUser && content.toLowerCase().startsWith(botTrigger.toLowerCase())) {
            const userPrompt = content.substring(botTrigger.length).trim();

            if (userPrompt) {
                console.log(`Bot triggered by user ${from}. Prompt: "${userPrompt}"`);

                // --- Optional: Fetch chat history ---
                const historyLimit = 10; // Number of recent messages for context
                const recentMessages = await Message.find({
                  // Find messages between the user and the bot
                  $or: [
                      { sender: from._id, users: botUser._id },  // ._id
                      { sender: botUser._id, users: from._id }   // ._id
                  ]
                })
                .sort({ createdAt: -1 }) // Get latest first
                .limit(historyLimit)
                .populate('sender', '_id'); // Only need sender ID for role assignment

                // Format for Gemini API
                const geminiHistory = recentMessages.reverse() // Reverse to get chronological order
                    .map(msg => ({
                        role: msg.sender.equals(botUser._id) ? "model" : "user",
                        parts: [{ text: msg.content }]
                     }))
                    // Filter out potentially empty/problematic parts just in case
                    // .filter(turn => turn.parts && turn.parts[0] && turn.parts[0].text);
                    .filter(turn => turn.parts && turn.parts[0])

                //  console.log("Formatted Gemini History:", JSON.stringify(geminiHistory, null, 2)); // Log history being sent

                // Get Bot Response
                const botReplyText = await getChatbotResponse(userPrompt, geminiHistory); // Pass history

                // botMessage 包含部分信息 ???
                const botMessage = new Message({
                    // content: { text: botReplyText },
                    content: botReplyText,
                    users: from, 
                    sender: botUser._id,
                    isBotMessage: true 
                });
                const savedBotMessage = await botMessage.save();
                const populatedMessage = await Message.findById(savedBotMessage._id)
                                           .populate('sender', 'username avatarimage _id')
                                           .populate('users', 'username avatarimage _id'); // Populate bot msg too
                console.log("Bot response saved:", savedBotMessage._id);

                // Emit Bot's Response back to the *original sender*
                console.log(`Emitting bot message ${savedBotMessage._id} back to user ${from} (socket ${socket.id})`);
                socket.emit("getMessage", populatedMessage);  // savedBotMessage

                // bot's reply also go to the original 'to' recipient if mentioned in a DM between two users
                if (recipientSocketId && recipientSocketId !== socket.id) {
                    console.log(`Also emitting bot message ${savedBotMessage._id} to original recipient ${to._id} (socket ${recipientSocketId})`);
                    io.to(recipientSocketId).emit("getMessage", savedBotMessage);
                }

            } else {
                console.log(`Bot triggered by user ${from} but prompt was empty.`);
                // Optionally send back a default help message from the bot
                 const helpText = "How can I help you? Just type '@chatbot' followed by your question.";
                const helpMessage = new Message({ sender: botUser, content: helpText,});
                 await helpMessage.save();
                 socket.emit("getMessage", helpMessage);
            }
        }
        // --- End Chatbot Logic ---

    } catch (error) {
        console.error("Error processing sendMessage:", error);
        socket.emit('messageError', { message: "Failed to process your message on the server." });
    }
});

socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
    // Find which user disconnected and remove them from onlineUsers
    let disconnectedUserId = null;
    for (let [userId, id] of global.onlineUsers.entries()) {
        if (id === socket.id) {
            disconnectedUserId = userId;
            global.onlineUsers.delete(userId);
            break;
        }
    }
    if (disconnectedUserId) {
         console.log(`User ${disconnectedUserId} removed. Online users: ${global.onlineUsers.size}`);
         // Optional: Broadcast updated online users list
         io.emit("getOnlineUsers", Array.from(global.onlineUsers.keys()));
    }
});
});

console.log("Socket.IO server initialized");







