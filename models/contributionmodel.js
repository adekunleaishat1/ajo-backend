const mongoose = require("mongoose")

const memberSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true },
    amount: { type: Number, default:0 },
  });
  
const contributionSchema = new mongoose.Schema({
    contributionname:{type:String, required:true, trim: true, unique:true},
    amount:{type:Number, required:true, trim: true, },
    plan:{type:String, required:true, trim: true, },
    interest:{type:Number, required:true, trim:true},
    nopeople:{type:Number,required:true, trim:true},
    peopleJoined: { type: Number, default: 0 }, 
    members: { type: [memberSchema], default: [] },
    admin: { type: String, trim: true },
    wallet: {type:Number, default:0.00},
    image: { type: String , required:true},
},{timestamps:true})

 
const contributionmodel = mongoose.models.contribution_tbs || mongoose.model
("contribution_tbs", contributionSchema)

module.exports = contributionmodel