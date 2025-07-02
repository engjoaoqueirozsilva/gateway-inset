import express from 'express';
import { Treino } from '../models/TreinoModel.js';
import { BaseService } from '../services/BaseService.js';

const router = express.Router();
const treinoService = new BaseService(Treino);

router.post('/', async (req, res) => {
  try {
    const novoTreino = await treinoService.create(req.body);
    res.status(201).json(novoTreino);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar treino', details: err });
  }
});

router.get('/', async (_req, res) => {
  try {
    const treinos = await treinoService.findAll();
    res.status(200).json(treinos);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar treinos', details: err });
  }
});

export default router;