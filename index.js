const express = require("express")
require("dotenv").config()
const mongoose =require("mongoose");
const userrouter = require("./routes/userrouter")
const cors = require('cors');
const bodyparser = require("body-parser")
const {errorhandler} = require("./middlewares/errorhandler")


const app = express();
app.use(express.json());
app.use(cors({origin:"*"}))
app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json({ limit: '100mb' }))
app.use(bodyparser.urlencoded({ extended: true, limit:"100mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }))
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

app.listen("8888", ()=>{
  console.log("server started at 8888");
})