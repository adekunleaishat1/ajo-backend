const jsonwebtoken = require("jsonwebtoken")
const secretKey = "yeesha " 

const generateToken = (email) =>{
    try {
        return jsonwebtoken.sign({email}, secretKey, {expiresIn: "1d" })
    } catch (error) {
       throw new Error({name: "Authentication error", message:"Error generating token"}) 
    }
}

const verifyToken = (token) =>{
    try {
      if (!token) {
          throw new Error({name:"Authentication error", message:"Invalid token"})
      }
      const decodedToken = jsonwebtoken.verify(token, secretKey)
      console.log(decodedToken);
      const email = decodedToken.email
      return email
    } catch (error) {
      console.log(error);
      if(error.name === "TokenExpiredError"){
         throw new Error("Session expired")
      }
      throw new Error("Error verifying token")
    }
  }
  
  module.exports = {generateToken, verifyToken}