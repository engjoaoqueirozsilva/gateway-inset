import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import treinoRoutes from './routes/treinoRoutes.js';
import modalidadeRoutes from './routes/modalidadeRoutes.js'; // ✅ Você esqueceu de importar!
import { port, mongoURI } from './config.js';

const app = express();

// ✅ Configuração do CORS (liberando apenas o domínio do seu front)
const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions)); // Deve vir antes de app.use(express.json())
app.use(express.json());

// ✅ Conexão com o MongoDB
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
app.use('/api/modalidades', modalidadeRoutes); // Certifique-se que essa rota existe

// ✅ Inicialização do servidor
app.listen(port, () => {
  console.log(`🚀 Gateway rodando em http://localhost:${port}`);
});
