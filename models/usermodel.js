const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true, unique: true },
  email: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true, trim: true },
  bvn: { type: Number, required: true, trim: true },
  wallet: { type: Number, default: 0 },
}, {timestamps:true});


userSchema.pre("save", function(next){
    if (this.password !== undefined) {
        bcrypt.hash(this.password, 10).then((hash)=>{
            this.password = hash
            next()
        }).catch((err)=>{
            console.log(err)
            next(err)
        })
    }
})


const usermodel = mongoose.models.register_tbs || mongoose.model("register_tbs", userSchema)
module.exports = usermodel
