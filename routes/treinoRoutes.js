import TreinoService from '../services/TreinoService.js';
import { generateRoutes } from "./base/baseRoute.js";
import express from 'express';
// REMOVA ESTA LINHA SE EXISTIR:
// import { BaseService } from './base/BaseService.js'; ❌

const treinoService = new TreinoService();
const router = express.Router();

// Rota customizada para consolidado
router.get('/consolidado', async (req, res) => {
  try {
    const { modalidadeId, dataInicio, dataFim, userId } = req.query;
    
    // TEMPORÁRIO: Buscar usuário manualmente para testes
    let usuario;
    if (userId) {
      const { default: Usuario } = await import('../models/UsuarioModel.js');
      usuario = await Usuario.findById(userId).populate('clubeId');
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
    } else {
      // Se não passou userId, simula um superAdmin
      usuario = {
        _id: 'test',
        nome: 'Teste',
        tipo: 'superAdmin',
        clubeId: null
      };
    }
    
    console.log('📊 Requisição de consolidado:', {
      usuario: usuario.nome,
      tipo: usuario.tipo,
      clubeId: usuario.clubeId?._id,
      modalidadeId,
      periodo: { dataInicio, dataFim }
    });
    
    const resultado = await treinoService.getConsolidado(
      {
        modalidadeId,
        dataInicio,
        dataFim
      },
      usuario
    );
    
    res.status(200).json(resultado);
  } catch (err) {
    console.error('❌ Erro ao consolidar treinos:', err);
    res.status(500).json({ 
      error: 'Erro ao consolidar treinos', 
      details: err.message 
    });
  }
});

// Rotas CRUD padrão
const baseRoutes = generateRoutes(treinoService);
router.use('/', baseRoutes);

export default router;