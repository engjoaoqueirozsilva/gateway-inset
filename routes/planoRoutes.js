import express from "express";
import PlanoService from "../services/PlanoService.js";
import { generateRoutes } from "./base/baseRoute.js";
import mongoose from "mongoose";

const router = express.Router();
const planoService = new PlanoService();

// Substitui apenas o GET com filtro por modalidade
router.get("/", async (req, res) => {
  try {
    const { modalidade } = req.query;

    const filtro = modalidade
      ? { modalidade: new mongoose.Types.ObjectId(modalidade) }
      : {};

    const planos = await planoService.findAll(filtro, ["modalidade"]);
    
    res.status(200).json(planos);

  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar planos", details: err });
  }
});

// Gera as demais rotas automaticamente
const generated = generateRoutes(planoService, {
  skip: ["get"],
  populate: ["modalidade"]
});
router.use(generated);

export default router;
