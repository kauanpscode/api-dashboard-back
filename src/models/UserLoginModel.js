const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserLoginSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Middleware para hash de senha antes de salvar o usuário
UserLoginSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Se a senha não foi modificada, pula o hash

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Criar o modelo UserLogin baseado no schema
const UserLogin = mongoose.model("UserLogin", UserLoginSchema);

module.exports = UserLogin;
