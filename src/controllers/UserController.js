const User = require("../models/UserModel");

// Criar um novo usuário
const createUser = async (req, res) => {
  try {
    const { name, channel, shift } = req.body;

    if (!name || !channel || !shift) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    const newUser = new User({ name, channel, shift });
    await newUser.save(); // Salva no MongoDB

    res.status(201).json(newUser);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao criar o usuário", details: error.message });
  }
};

// Obter todos os usuários
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Busca no MongoDB
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao buscar usuários", details: error.message });
  }
};

// Obter um usuário pelo ID
const getUserById = async (req, res) => {
  console.log(req.params);
  try {
    const { _id } = req.params;
    const user = await User.findById(_id); // Busca no MongoDB pelo _id

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao buscar o usuário", details: error.message });
  }
};

// Atualizar um usuário pelo ID
const updateUserById = async (req, res) => {
  try {
    const { _id, name, channel, shift } = req.body;

    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Atualiza apenas os campos fornecidos
    if (name) user.name = name;
    if (channel) user.channel = channel;
    if (shift) user.shift = shift;

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao atualizar o usuário", details: error.message });
  }
};

// Deletar um usuário pelo ID
const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id); // Deleta diretamente pelo MongoDB

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.status(200).json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao deletar o usuário", details: error.message });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};
