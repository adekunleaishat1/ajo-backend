const express = require("express")
require("dotenv").config()
const mongoose =require("mongoose");
const socket = require("socket.io")
const userrouter = require("./routes/userrouter")
const cors = require('cors');
const bodyParser = require("body-parser")
const {errorhandler} = require("./middlewares/errorhandler")


const app = express();
app.use(express.json());
// app.use(cors({origin:"https://ajo-frontend-teal.vercel.app"}))
app.use(cors({origin:"*"}))
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
    // cors:{origin:"https://ajo-frontend-teal.vercel.app"}
    cors:{origin:"*"}
})

module.exports = {io}

