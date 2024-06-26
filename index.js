const express = require("express")
require("dotenv").config()
const mongoose =require("mongoose");
const jwt = require("jsonwebtoken")
const {verifyToken} = require("./services/sessionservices")
const chatmodel = require("./models/chatmodel")
const usermodel = require("./models/usermodel")
const socket = require("socket.io")
const userrouter = require("./routes/userrouter")
const cors = require('cors');
const bodyParser = require("body-parser")
const {errorhandler} = require("./middlewares/errorhandler")


const app = express();
app.use(express.json());
app.use(cors({origin:"https://ajo-frontend-teal.vercel.app/"}))
app.use(bodyParser.json({ limit: '100mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit:"100mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/user", userrouter)
 



const uri = process.env.MONGODB_URI
console.log(uri)
const connect = () => {
    mongoose.set("strictQuery", false)
    mongoose.connect(uri).then((res) => {
        console.log("connected to database")
    }).catch((err) => {
        console.log(err)
    })
}

connect()

app.use(errorhandler)

 const connection = app.listen("8888", ()=>{
  console.log("server started at 8888");
})
const io = socket(connection, {
    cors:{origin:"https://ajo-frontend-teal.vercel.app/"}
})

io.on("connection",(socket)=>{
    let useremail = ""
    console.log("A user connected succcessful");
    socket.on("authenticate", (token)=>{
        console.log(token);
         useremail = verifyToken(token)
        console.log(useremail)
    })
    socket.on("disconnect", ()=>{
        console.log(useremail + " has disconnected.");
        useremail = "";  
    })
    socket.on("joingroup", async(groupid)=>{
        socket.join(groupid);
        console.log(`User ${useremail} joined group ${groupid}`);
        try {
            const groupMessages = await chatmodel.find({ groupid: groupid }).populate('userid', 'email username')  // Populate user details if needed
            .sort({createdAt: 1});  // Sort by creation time // Ensure messages are sorted by creation time
            // console.log(groupMessages);
            socket.emit("historychat", groupMessages);
        } catch (error) {
            console.log('Error fetching group messages:', error);
        }
    })
    socket.on("newchat", async(chat)=>{
        console.log(chat);
        try {

        const user = await usermodel.findOne({email: useremail})
        if (!user) {
            console.log('User not found');
            return;  
        }

            const newchat = new chatmodel({
               message:chat.chatmessage,
               userid:user._id,
               groupid:chat.groupid
            })

         const savedchat = await newchat.save()
         console.log(savedchat);
         console.log("Chat saved to database");

        //  io.to(chat.groupid).emit("receivechat", chat);
         io.to(chat.groupid).emit("receivechat", {
            message: savedchat.message,
            userid: savedchat.userid,
            groupid: savedchat.groupid,
            createdAt: savedchat.createdAt  // Assuming you want to send this as well
        });
        } catch (error) {
            console.log(error);
        }
      
    })

    // socket.on("receivechat",)
   
})