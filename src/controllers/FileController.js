const fs = require("fs");
const xlsx = require("xlsx");
const path = require("path");
const uploadPath = path.join(__dirname, "../uploads");
const fileService = require("../services/fileService");

const readExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // Pegando a primeira aba
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]); // Convertendo para JSON
  return data;
};

// Função para buscar e processar os arquivos Excel na pasta uploads
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

// Função para fazer upload de um arquivo
exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo foi enviado." });
  }

  // Verifica se o channel_slug está presente na requisição
  const channel_slug = req.body.channel_slug || "default_channel"; // 'default_channel' é um valor padrão

  fileService
    .addFile(req.file, channel_slug)
    .then(() => {
      res.status(200).json({
        message: "Arquivo enviado com sucesso!",
        filePath: `/uploads/${req.file.filename}`,
      });
    })
    .catch((error) => {
      console.error("Erro ao salvar o arquivo no banco de dados:", error);
      res
        .status(500)
        .json({ error: "Erro ao salvar o arquivo no banco de dados." });
    });
};

exports.listFiles = (req, res) => {
  fileService
    .getFiles()
    .then((files) => {
      res.status(200).json(files);
    })
    .catch((error) => {
      res.status(500).json({ error: "Erro ao recuperar arquivos." });
    });
};

// Função para excluir um arquivo
exports.deleteFile = (req, res) => {
  const { id } = req.params;

  // Buscar o nome do arquivo no banco de dados, baseado no id fornecido
  fileService
    .getFileById(id) // Suponha que você tenha uma função que busque o arquivo pelo ID no banco de dados
    .then((file) => {
      if (!file) {
        return res
          .status(404)
          .json({ error: "Arquivo não encontrado no banco de dados." });
      }

      // Caminho do arquivo na pasta uploads
      const filePath = path.join(__dirname, "../uploads", file.filename);

      // Deletar o arquivo do banco de dados
      return fileService
        .deleteFile(id)
        .then((deletedRows) => {
          if (deletedRows === 0) {
            return res
              .status(404)
              .json({ error: "Arquivo não encontrado no banco de dados." });
          }

          // Deletar o arquivo fisicamente
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("Erro ao excluir o arquivo físico:", err);
              return res
                .status(500)
                .json({ error: "Erro ao excluir o arquivo físico." });
            }

            res.status(200).json({ message: "Arquivo excluído com sucesso." });
          });
        })
        .catch((error) => {
          res
            .status(500)
            .json({ error: "Erro ao excluir arquivo do banco de dados." });
        });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "Erro ao buscar o arquivo no banco de dados." });
    });
};
