const {io} = require('../index')
const chatmodel = require("../models/chatmodel")
const usermodel = require("../models/usermodel")
const {verifyToken} = require("../services/sessionservices")

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

module.exports = {io}