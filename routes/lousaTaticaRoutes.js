import express from "express";
import { extrairClubeId } from "../middlewares/auth.js";
import LousaTaticaService from "../services/LousaTaticaService.js";
import { generateRoutes } from "./base/baseRoute.js";

const router = express.Router();
const lousaTaticaService = new LousaTaticaService();

router.use(extrairClubeId);

// GET customizado com filtros
router.get("/", async (req, res) => {
  try {
    const clubeIdDoUsuario = req.usuario.clubeId;
    const modalidadeIdParam = req.query.modalidade;
    const nomeParam = req.query.nome;

    console.log("📥 GET /api/lousas-taticas - Requisição de:", {
      nome: req.usuario.nome,
      userId: req.usuario._id.toString(),
      clubeId: clubeIdDoUsuario,
      tipo: req.usuario.tipo,
      queryParams: req.query,
    });

    const lousas = await lousaTaticaService.getFilteredLousas(
      req.usuario.tipo,
      clubeIdDoUsuario,
      modalidadeIdParam,
      nomeParam
    );

    res.status(200).json(lousas);
  } catch (err) {
    console.error("❌ Erro no GET /lousas-taticas:", err);
    res.status(500).json({
      error: "Erro ao buscar lousas táticas",
      details: err.message,
    });
  }
});

// POST customizado
router.post("/", async (req, res) => {
  try {
    const novo = await lousaTaticaService.create(req.body, req.usuario);
    res.status(201).json(novo);
  } catch (err) {
    console.error("❌ Erro ao criar lousa tática:", err);
    res.status(500).json({
      error: "Erro ao criar lousa tática",
      details: err.message,
    });
  }
});

// PUT customizado para incrementar versão e registrar atualizadoPor
router.put("/:id", async (req, res) => {
  try {
    const atual = await lousaTaticaService.findById(req.params.id);

    if (!atual) {
      return res.status(404).json({ error: "Lousa tática não encontrada" });
    }

    const payload = {
      ...req.body,
      versaoAtual: atual.versaoAtual || 1,
    };

    const atualizado = await lousaTaticaService.updateById(
      req.params.id,
      payload,
      req.usuario
    );

    res.status(200).json(atualizado);
  } catch (err) {
    console.error("❌ Erro ao atualizar lousa tática:", err);
    res.status(500).json({
      error: "Erro ao atualizar lousa tática",
      details: err.message,
    });
  }
});

// POST customizado para duplicar
router.post("/:id/duplicar", async (req, res) => {
  try {
    const duplicada = await lousaTaticaService.duplicar(
      req.params.id,
      req.usuario
    );
    res.status(201).json(duplicada);
  } catch (err) {
    console.error("❌ Erro ao duplicar lousa tática:", err);
    res.status(500).json({
      error: "Erro ao duplicar lousa tática",
      details: err.message,
    });
  }
});

const generated = generateRoutes(lousaTaticaService, {
  skip: ["get", "post", "put"],
  populate: ["modalidade"],
});

router.use(generated);

export default router;