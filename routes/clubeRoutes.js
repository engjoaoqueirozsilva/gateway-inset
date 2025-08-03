// routes/clubeRoutes.js
import express from "express";
import { generateRoutes } from "./base/baseRoute.js";
import  ClubeService  from '../services/ClubeService.js';

const router = express.Router();
const clubeService = new ClubeService();


router.get("/:id", async (req, res) => {
  try {
    // Busca o ID do parâmetro da URL
    const clube = await clubeService.findById(req.params.id);

    // Se o clube não for encontrado, retorna 404
    if (!clube) {
      return res.status(404).json({ error: "Clube não encontrado" });
    }

    // Se o clube for encontrado, retorna os dados com status 200
    res.status(200).json(clube);
  } catch (err) {
    // Retorna um erro 500 para qualquer problema inesperado
    console.error("Erro ao buscar clube por ID:", err);
    res.status(500).json({ error: "Erro ao buscar clube", details: err.message });
  }
});

const generated = generateRoutes(clubeService, {
  populate: [] 
});

router.use(generated);

export default router;