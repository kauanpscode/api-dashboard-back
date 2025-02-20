const app = require("./App"); // Importa o app configurado
const PORT = 3000;
const mongoose = require("mongoose"); // Importando mongoose

// URL de conexão com o MongoDB
const mongoURI =
  "mongodb+srv://kauanps2271:daRD9FH2KqJLNNnJ@dashboard-corandini.sta2s.mongodb.net/?retryWrites=true&w=majority&appName=dashboard-corandini";

// Conectar ao MongoDB
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("🔥 Conectado ao MongoDB.");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🔥 Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar ao MongoDB:", error);
  });
