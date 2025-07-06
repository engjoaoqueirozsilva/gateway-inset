// routes/planoRoutes.js
import express from "express";
import PlanoService from "../services/PlanoService.js";
import { generateRoutes } from "./base/baseRoute.js";

const router = express.Router();
const planoService = new PlanoService();

// ✅ Rota GET com filtro por modalidade
router.get("/", async (req, res) => {
  try {
    const { modalidade } = req.query;
    const filtro = modalidade ? { modalidade } : {};
    const planos = await planoService.findAll(filtro, ["modalidade"]);
    res.status(200).json(planos);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar planos", details: err });
  }
});

// ✅ Demais rotas automáticas
const generated = generateRoutes(planoService, { skip: ["get"], populate: ["modalidade"] });
router.use(generated);

export default router;
