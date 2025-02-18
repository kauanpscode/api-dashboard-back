const User = require("../models/UserModel");

// Criar um novo usuário
const createUser = async (req, res) => {
  console.log(req.body);
  try {
    const { name, channel, shift } = req.body;

    if (!name || !channel || !shift) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    const newUser = await User.create({ name, channel, shift });
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
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao buscar usuários", details: error.message });
  }
};

// Obter um usuário pelo ID
const getUserbyId = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

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
    const { id } = req.params;
    const { name, channel, shift } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Atualiza os campos se fornecidos no corpo da requisição
    user.name = name || user.name;
    user.channel = channel || user.channel;
    user.shift = shift || user.shift;

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

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    await user.destroy();
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
  getUserbyId,
  updateUserById,
  deleteUserById,
};
