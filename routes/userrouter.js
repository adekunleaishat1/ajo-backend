const express = require("express")
const {validate} = require("../middlewares/validator")
const {signup, signin, contributor_signup, verifytokenLink, verifyuserToken, payment, getContribution, getallContribution, forgotPassword,resetPassword} = require("../controllers/usercontroller")
const {userValidationschema,contributionValidationschema} = require("../middlewares/userValidationschema")  

const userrouter = express.Router()

userrouter.post("/signup", validate(userValidationschema), signup)
userrouter.post("/contribution",validate(contributionValidationschema), contributor_signup)
userrouter.post("/login", signin)
userrouter.post("/pay", payment)
userrouter.get("/contribution/:id", getContribution)
userrouter.get("/contribution", getallContribution)
userrouter.get("/verify", verifyuserToken)
userrouter.get("/verifylink", verifytokenLink)
userrouter.post("/reset", forgotPassword)
userrouter.post("/change", resetPassword)

module.exports = userrouter