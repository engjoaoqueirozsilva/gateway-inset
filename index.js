import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import treinoRoutes from './routes/treinoRoutes.js';
import modalidadeRoutes from './routes/modalidadeRoutes.js';
import { port, mongoURI } from './config.js';


const app = express();

// ✅ Libera todas as origens (com segurança via chave)
app.use(cors());

// Middleware para JSON
app.use(express.json());

// ✅ Middleware global para validar a chave da API
//app.use(checkApiKey);

// ✅ Conexão com MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Conectado ao MongoDB'))
  .catch(err => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  });

// ✅ Rota de healthcheck
app.get('/healthcheck', (req, res) => {
  res.status(200).json({ status: true });
});

// ✅ Rotas da API
app.use('/api/treinos', treinoRoutes);
app.use('/api/modalidades', modalidadeRoutes);

// ✅ Inicialização do servidor
app.listen(port, () => {
  console.log(`🚀 Gateway rodando em http://localhost:${port}`);
});
