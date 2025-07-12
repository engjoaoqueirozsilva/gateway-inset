// routes/modalidadeRoutes.js
import express from "express";
import { extrairClubeId } from "../middlewares/auth.js";
import ModalidadeService from "../services/ModalidadeService.js";
import { generateRoutes } from "./base/baseRoute.js";

const router = express.Router();
const modalidadeService = new ModalidadeService();

router.use(extrairClubeId);

// GET personalizado com filtro por clube
router.get("/", async (req, res) => {
  try {
    const filtro = {};

    if (req.usuario.tipo !== "superAdmin") {
      filtro.clubeId = req.usuario.clubeId;
    }

    const modalidades = await modalidadeService.findAll(filtro);
    res.status(200).json(modalidades);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar modalidades", details: err.message });
  }
});

// Demais rotas com generateRoutes
const generated = generateRoutes(modalidadeService, {
  skip: ["get"],
});
router.use(generated);

export default router;
