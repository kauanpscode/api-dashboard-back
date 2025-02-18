const User = require("../models/UserLoginModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const secret = "secretKey";

exports.register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.create({ username, password });
    res.status(201).json({ message: "Usuário criado", user });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Erro ao criar usuário", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(401).json({ message: "Credenciais inválidas" });

  const token = jwt.sign({ id: user.id }, secret, { expiresIn: "1h" });
  res.json({ token });
};
