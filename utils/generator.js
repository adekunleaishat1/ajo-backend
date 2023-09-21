const crypto = require("crypto");
const generateCode = () => {
    const OTP =  crypto.randomBytes(3);
    return OTP.toString('hex')
}

module.exports = {generateCode}