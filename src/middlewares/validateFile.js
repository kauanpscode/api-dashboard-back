const path = require('path');

module.exports = (req, res, next) => {
  console.log(req.file);
  const allowedExtensions = ['.xls', '.xlsx', '.csv'];
  const fileExtension = path.extname(req.file.originalname);

  if (!allowedExtensions.includes(fileExtension)) {
    return res.status(400).json({ error: 'Formato de arquivo não suportado.' });
  }

  next();
};
