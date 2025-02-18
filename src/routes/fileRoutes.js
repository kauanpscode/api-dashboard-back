const express = require("express");
const multer = require("../config/multerConfig");
const FileController = require("../controllers/FileController");
const validateFile = require("../middlewares/validateFile");

const router = express.Router();

// Rota para upload de arquivos
router.post(
  "/upload",
  multer.single("file"),
  validateFile,
  FileController.uploadFile
);

// Rota para listar arquivos
router.get("/list", FileController.listFiles);
// Rota de exclusão
router.delete("/delete/:id", FileController.deleteFile);
// Rota de ler xlsx
router.get("/excel-data", FileController.getExcelData);
module.exports = router;
