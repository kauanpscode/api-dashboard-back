const multer = require('multer');
const path = require('path');

// Configuração do multer para armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../uploads')); // Diretório de upload
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

// Filtro para aceitar apenas arquivos .xlsx
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Aceita o arquivo
  } else {
    cb(new Error('Apenas arquivos .xlsx são permitidos!'), false);
  }
};

// Configuração do multer com o filtro
module.exports = multer({ storage, fileFilter });
