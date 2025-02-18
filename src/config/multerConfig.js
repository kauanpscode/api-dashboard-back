const multer = require("multer");
const path = require("path");

// Configuração do multer para armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "../uploads")); // Diretório de upload
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// Exportando a configuração
module.exports = multer({ storage });
