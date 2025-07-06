import express from 'express';
import { Modalidade } from '../models/ModalidadeModel.js';
import { BaseService } from '../services/BaseService.js';

const router = express.Router();
const modalidadeService = new BaseService(Modalidade);

// Rota para criar uma nova modalidade
router.post('/', async (req, res) => {
  try {
    const novaModalidade = await modalidadeService.create(req.body);
    res.status(201).json(novaModalidade);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar modalidade', details: err });
  }
});

// Rota para listar todas as modalidades
router.get('/', async (_req, res) => {
  try {
    const modalidades = await modalidadeService.findAll();
    res.status(200).json(modalidades);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar modalidades', details: err });
  }
});

export default router;
