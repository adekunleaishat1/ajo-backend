const express = require("express")
const {validate} = require("../middlewares/validator")
const {signup, signin, contributor_signup, verifythriftLink, verifyuserToken, payment, getContribution, getallContribution, forgotPassword,resetPassword,viewnotification, updatenotification} = require("../controllers/usercontroller")
const {userValidationschema,contributionValidationschema} = require("../middlewares/userValidationschema")  

const userrouter = express.Router()

userrouter.post("/signup", validate(userValidationschema), signup)
userrouter.post("/contribution",validate(contributionValidationschema), contributor_signup)
userrouter.post("/login", signin)
userrouter.post("/pay", payment)
userrouter.get("/onecontribution/:id", getContribution)
userrouter.get("/contribution", getallContribution)
userrouter.get("/verify", verifyuserToken)
userrouter.get("/verifylink/:id", verifythriftLink)
userrouter.post("/reset", forgotPassword)
userrouter.post("/change", resetPassword)
userrouter.get("/notify", viewnotification)
userrouter.post("/update", updatenotification)

module.exports = userrouter