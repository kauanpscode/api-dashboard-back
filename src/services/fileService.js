const FileModel = require("../models/FileModel");

// Função para adicionar um arquivo ao banco de dados
const addFile = (file, channel_slug) => {
  return FileModel.create({
    originalName: file.originalname,
    filename: file.filename,
    channel_slug: channel_slug,
    path: file.path,
    uploadedAt: new Date(),
  });
};

// Função para listar todos os arquivos no banco de dados
const getFiles = async () => {
  return FileModel.findAll();
};

// Função para remover um arquivo do banco de dados
const deleteFile = async (id) => {
  return FileModel.destroy({
    where: { id },
  });
};

// Função para encontrar um arquivo específico pelo ID
const getFileById = async (id) => {
  return FileModel.findByPk(id);
};

module.exports = { addFile, getFiles, deleteFile, getFileById };
