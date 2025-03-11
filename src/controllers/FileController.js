const fs = require("fs");
const xlsx = require("xlsx");
const path = require("path");
const uploadPath = path.join(__dirname, "../uploads");
const fileService = require("../services/fileService");

const readExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
};

exports.getExcelData = (req, res) => {
  fs.readdir(uploadPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao ler a pasta de uploads." });
    }

    const excelFiles = files.filter((file) => file.endsWith(".xlsx"));
    if (excelFiles.length === 0) {
      return res.json({ message: "Nenhum arquivo .xlsx encontrado." });
    }

    const fileData = excelFiles.map((file) => {
      const filePath = path.join(uploadPath, file);
      const data = readExcel(filePath);
      return { fileName: file, data };
    });

    res.json(fileData);
  });
};

// Alterado para usar async/await
exports.uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo foi enviado." });
  }

  const channel_slug = req.body.channel_slug || "default_channel";

  try {
    await fileService.addFile(req.file, channel_slug);
    res.status(200).json({
      message: "Arquivo enviado com sucesso!",
      filePath: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao salvar o arquivo no banco de dados." });
  }
};

// Alterado para usar async/await
exports.listFiles = async (req, res) => {
  try {
    const files = await fileService.getFiles();
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ error: "Erro ao recuperar arquivos." });
  }
};

// Alterado para buscar e excluir usando Mongoose
exports.deleteFile = async (req, res) => {
  const files = await fileService.getFiles();
  const { id } = req.params;

  try {
    const file = await fileService.getFileById(id);
    if (!file) {
      return res
        .status(404)
        .json({ error: "Arquivo não encontrado no banco de dados." });
    }

    const filePath = path.join(__dirname, "../uploads", file.filename);

    await fileService.deleteFile(id);

    fs.unlink(filePath, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Erro ao excluir o arquivo físico." });
      }

      res.status(200).json({ message: "Arquivo excluído com sucesso." });
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir o arquivo." });
  }
};

exports.fixFile = async (req, res) => {
  try {
    const file = await fileService.getFileById(req.params.id);
    if (!file)
      return res.status(404).json({ message: "Arquivo não encontrado" });

    file.fixed = !file.fixed; // Alterna o estado de fixação

    await file.save();

    res.json({ message: "Arquivo atualizado", fixed: file.fixed });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar o arquivo" });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const file = await fileService.getFileByName(filename);

    if (!file) {
      return res.status(404).json({ error: "Arquivo não encontrado." });
    }

    const filePath = path.join(__dirname, "../uploads", file.filename);
    const downloadName = `${file.channel_slug}_${file.originalName}`;

    res.download(filePath, downloadName, (err) => {
      if (err) {
        res.status(500).json({ error: "Erro ao baixar o arquivo." });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao processar o download." });
  }
};
