import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import treinoRoutes from './routes/treinoRoutes.js';
import modalidadeRoutes from './routes/modalidadeRoutes.js';
import atletaRoutes from './routes/atletaRoutes.js';
import planoRoutes from "./routes/planoRoutes.js";
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
  .then(() => console.log('✅ Gipsy Danger com reatores ativos, pronto para o combate!'))
  .catch(err => {
    console.error('❌ Gipsy Danger localizou uma falha ao ativar reatores, risco de explosão nuclear', err.message);
    process.exit(1);
  });

// ✅ Rota de healthcheck
app.get('/healthcheck', (req, res) => {
  res.status(200).json({ status: true });
});

// ✅ Rotas da API
app.use('/api/treinos', treinoRoutes);
app.use('/api/modalidades', modalidadeRoutes);
app.use('/api/atletas', atletaRoutes);
app.use("/api/planos", planoRoutes);

// ✅ Inicialização do servidor
app.listen(port, () => {
  console.log(`🚀 Cherno Alpha pronto para combate`);
});
