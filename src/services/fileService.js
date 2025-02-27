const FileModel = require("../models/FileModel");

// Função para adicionar um arquivo ao banco de dados
const addFile = async (file, channel_slug) => {
  return await FileModel.create({
    originalName: file.originalname,
    filename: file.filename,
    channel_slug: channel_slug,
    path: file.path,
    uploadedAt: new Date(),
  });
};

// Função para listar todos os arquivos no banco de dados
const getFiles = async () => {
  return await FileModel.find(); // Em Mongoose, usamos `find()` no lugar de `findAll()`
};

// Função para remover um arquivo do banco de dados
const deleteFile = async (id) => {
  return await FileModel.findByIdAndDelete(id); // Substitui `destroy({ where: { id } })`
};

// Função para encontrar um arquivo específico pelo ID
const getFileById = async (id) => {
  return await FileModel.findById(id); // Substitui `findByPk(id)`
};

const getFileByName = async (filename) => {
  return await FileModel.findOne({ filename });
};

module.exports = { addFile, getFiles, deleteFile, getFileById, getFileByName };
