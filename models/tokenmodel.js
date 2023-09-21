const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  OTP: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 },
});
const tokenmodel = mongoose.models.token_tbs || mongoose.model("token_tbs", tokenSchema);

module.exports = tokenmodel;
