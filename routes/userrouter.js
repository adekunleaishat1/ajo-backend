const express = require("express")
const {validate} = require("../middlewares/validator")
const {signup, signin, contributor_signup, verifytokenLink, verifyuserToken, payment, getContribution} = require("../controllers/usercontroller")
const {userValidationschema,contributionValidationschema} = require("../middlewares/userValidationschema")  

const userrouter = express.Router()

userrouter.post("/signup", validate(userValidationschema), signup)
userrouter.post("/contribution",validate(contributionValidationschema), contributor_signup)
userrouter.post("/login", signin)
userrouter.post("/pay", payment)
userrouter.post("/get", getContribution)
userrouter.get("/verify", verifyuserToken)
userrouter.get("/verifylink", verifytokenLink)

module.exports = userrouter