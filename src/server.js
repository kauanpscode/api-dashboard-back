const app = require('./App'); // Importa o app configurado
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose'); // Importando mongoose

// URL de conexão com o MongoDB
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('❌ ERRO: MONGO_URI não está definido no .env');
  process.exit(1); // Sai da aplicação com erro
}

// Conectar ao MongoDB
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log('🔥 Conectado ao MongoDB.');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🔥 Servidor rodando na porta ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Erro ao conectar ao MongoDB:', error);
  });
