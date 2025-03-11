const fs = require("fs").promises;
const xlsx = require("xlsx");
const path = require("path");
const uploadPath = path.join(__dirname, "../uploads");
const fileService = require("../services/fileService");

const readExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
};

exports.getExcelData = async (req, res) => {
  try {
    const files = await fs.readdir(uploadPath);
    const excelFiles = files.filter((file) => file.endsWith(".xlsx"));

    if (excelFiles.length === 0) {
      return res.json({ message: "Nenhum arquivo .xlsx encontrado." });
    }

    const fileData = excelFiles.map((file) => ({
      fileName: file,
      data: readExcel(path.join(uploadPath, file)),
    }));

    res.json(fileData);
  } catch (err) {
    res.status(500).json({ error: "Erro ao ler a pasta de uploads." });
  }
};

exports.uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo foi enviado." });
  }

  const channel_slug = req.body.channel_slug || "default_channel";
  const fileName = `${req.file.filename}_${channel_slug}`;

  try {
    await fileService.addFile(req.file, channel_slug);
    res.status(200).json({
      message: "Arquivo enviado com sucesso!",
      filePath: `/uploads/${fileName}`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao salvar o arquivo no banco de dados." });
  }
};

exports.listFiles = async (req, res) => {
  try {
    const files = await fileService.getFiles();
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ error: "Erro ao recuperar arquivos." });
  }
};

exports.deleteFile = async (req, res) => {
  const { id } = req.params;

  try {
    const file = await fileService.getFileById(id);
    if (!file) {
      return res
        .status(404)
        .json({ error: "Arquivo não encontrado no banco de dados." });
    }

    const filePath = path.join(uploadPath, file.filename);
    await fileService.deleteFile(id);
    await fs.unlink(filePath);

    res.status(200).json({ message: "Arquivo excluído com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir o arquivo." });
  }
};

exports.fixFile = async (req, res) => {
  try {
    const file = await fileService.getFileById(req.params.id);
    if (!file)
      return res.status(404).json({ message: "Arquivo não encontrado" });

    const updatedFile = await fileService.updateFile(req.params.id, {
      fixed: !file.fixed,
    });

    res.json({ message: "Arquivo atualizado", fixed: updatedFile.fixed });
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

    const filePath = path.join(uploadPath, file.filename);
    const downloadName = `${file.originalName}_${file.channel_slug}.xlsx`; // Nome formatado

    res.download(filePath, downloadName);
  } catch (error) {
    res.status(500).json({ error: "Erro ao processar o download." });
  }
};
