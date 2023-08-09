const errorhandler = (error, req, res, next)=> {
    if (error.name == "MongoError") {
        if (error.code == 11000) {
            return res.status(400).send({message:"Duplicate key error. A value is already in use in our database", staus:"false"})
        }
    }else if(error.name == "Authentication error"){
        return res.status(401).send({message: error.message || "Authentication error", staus:"false"})
    }else if(error.name == "Authorization error"){
        return res.status(403).send({message: error.message ||"Authorization error", staus:"false"})
    }else {
        return res.status(500).send({message:"internal server error", staus:"false"})
    }
}

module.exports = {errorhandler}