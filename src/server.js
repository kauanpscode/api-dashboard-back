const app = require("./App"); // Importa o app configurado
const PORT = 3000;
const sequelize = require("./config/database");

// Sincronizar banco de dados
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Banco de dados sincronizado.");
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao sincronizar o banco de dados:", error);
  });
