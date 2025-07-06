import express from "express";
import  AtletaService  from "../services/AtletaService.js";
import { generateRoutes } from "./base/baseRoute.js";

const router = express.Router();
const atletaService = new AtletaService();

// ✅ Substituindo apenas a rota GET com filtro
router.get("/", async (req, res) => {
  try {
    const { modalidade } = req.query;
    const filtro = modalidade ? { modalidade } : {};
    const atletas = await atletaService.findAll(filtro, ["modalidade"]);
    res.status(200).json(atletas);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar atletas", details: err });
  }
});

// ✅ Mantendo as demais rotas geradas automaticamente
const generated = generateRoutes(atletaService, { skip: ["get"], populate: ["modalidade"] });
router.use(generated);

export default router;
