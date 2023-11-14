const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    receiverEmail:{
        type: String ,
         required: true,
          trim: true
         },
    message: {
        type: String,
        required: true,
        trim: true
      },
      isread:{
        type:Boolean,
        default: false
      }
},{timestamps:true})

const notificationmodel = mongoose.models.notification_tbs ? mongoose.model('notification_tbs') : mongoose.model("notification_tbs", notificationSchema)
module.exports = notificationmodel