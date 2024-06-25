const mongoose = require("mongoose")
   
const chatSchema = new mongoose.Schema({
    message:{type:String, required:true},
    userid:{type:mongoose.Schema.Types.ObjectId, ref:"register_tbs", required:true},
    groupid:{type:mongoose.Schema.Types.ObjectId, ref:"contribution_tbs", required:true},
    createdAt: {
        type: Date,
        default: Date.now,
      },
})

const chatmodel = mongoose.model("chat_tbs", chatSchema)

module.exports = chatmodel