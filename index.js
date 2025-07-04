import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import treinoRoutes from './routes/treinoRoutes.js';
import { port, mongoURI } from './config.js';

const app = express();
app.use(cors());
app.use(express.json());


// ✅ Conexão com o MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Conectado ao MongoDB'))
  .catch(err => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    process.exit(1); // Encerra o processo se não conectar
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
