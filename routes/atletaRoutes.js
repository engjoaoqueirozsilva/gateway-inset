// routes/atletaRoutes.js
import express from "express";
import { extrairClubeId } from "../middlewares/auth.js";
import AtletaService from "../services/AtletaService.js";
import { generateRoutes } from "./base/baseRoute.js";

const router = express.Router();
const atletaService = new AtletaService();

// Aplica o middleware para injetar `req.usuario`
router.use(extrairClubeId);

// GET personalizado com filtro por clube
router.get("/", async (req, res) => {
  try {
    let atletas;

    if (req.usuario.tipo === "superAdmin") {
      atletas = await atletaService.findAll().populate("modalidade");
    } else {
      atletas = await atletaService.findAllFiltrandoPorClube(req.usuario.clubeId._id);
    }

    res.status(200).json(atletas);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar atletas", details: err.message });
  }
});


router.post("/", async (req, res) => {
  try {
    const novo = await atletaService.create(req.body, req.usuario);
    res.status(201).json(novo);
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar atleta", details: err.message });
  }
});

const generated = generateRoutes(atletaService, {
  skip: ["get", "post"],
  populate: ["modalidade"]
});

router.use(generated);

export default router;
