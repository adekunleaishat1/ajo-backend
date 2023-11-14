const mongoose = require('mongoose')

const transactionschema =  new mongoose.Schema({
    reference:{type:String, required: true, trim:true, unique:true},
    amount:{type:Number, required:true, trim:true},
    status:{type: String, required:true, trim:true},
    username:{type:String, required:true, trim:true},
    transactiontype:{type: String, required:true, trim:true},
}) 

const transactionmodel = mongoose.models.transaction_tbs || mongoose.model("transaction_tbs", transactionschema);
module.exports = transactionmodel