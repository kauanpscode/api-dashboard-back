const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  channel: { type: String, required: true },
  shift: { type: String, required: true },
});

// Criar o modelo User baseado no schema
const User = mongoose.model("User", UserSchema);

module.exports = User;
