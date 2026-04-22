import express from "express";
import { extrairClubeId } from "../middlewares/auth.js";
import AcoesService from "../services/AcoesService.js";
import { generateRoutes } from "./base/baseRoute.js";

const router = express.Router();
const acoesService = new AcoesService();

router.use(extrairClubeId);

// GET customizado com filtros
router.get("/", async (req, res) => {
  try {
    const clubeIdDoUsuario = req.usuario.clubeId;
    const modalidadeIdParam = req.query.modalidade;
    const nomeParam = req.query.nome;

    console.log("📥 GET /api/acoes-jogo - Requisição de:", {
      nome: req.usuario.nome,
      userId: req.usuario._id.toString(),
      clubeId: clubeIdDoUsuario,
      tipo: req.usuario.tipo,
      queryParams: req.query,
    });

    const acoes = await acoesService.getFilteredAcoes(
      req.usuario.tipo,
      clubeIdDoUsuario,
      modalidadeIdParam,
      nomeParam
    );

    res.status(200).json(acoes);
  } catch (err) {
    console.error("❌ Erro no GET /acoes-jogo:", err);
    res
      .status(500)
      .json({ error: "Erro ao buscar ações de jogo", details: err.message });
  }
});

// POST customizado
router.post("/", async (req, res) => {
  try {
    const novo = await acoesService.create(req.body, req.usuario);
    res.status(201).json(novo);
  } catch (err) {
    console.error("❌ Erro ao criar ação de jogo:", err);
    res
      .status(500)
      .json({ error: "Erro ao criar ação de jogo", details: err.message });
  }
});

// PUT customizado para incrementar versão e registrar atualizadoPor
router.put("/:id", async (req, res) => {
  try {
    const atual = await acoesService.findById(req.params.id);

    if (!atual) {
      return res.status(404).json({ error: "Ação de jogo não encontrada" });
    }

    const payload = {
      ...req.body,
      versaoAtual: (atual.versaoAtual || 1),
    };

    const atualizado = await acoesService.updateById(
      req.params.id,
      payload,
      req.usuario
    );

    res.status(200).json(atualizado);
  } catch (err) {
    console.error("❌ Erro ao atualizar ação de jogo:", err);
    res
      .status(500)
      .json({ error: "Erro ao atualizar ação de jogo", details: err.message });
  }
});

// POST customizado para duplicar
router.post("/:id/duplicar", async (req, res) => {
  try {
    const duplicada = await acoesService.duplicar(req.params.id, req.usuario);
    res.status(201).json(duplicada);
  } catch (err) {
    console.error("❌ Erro ao duplicar ação de jogo:", err);
    res
      .status(500)
      .json({ error: "Erro ao duplicar ação de jogo", details: err.message });
  }
});

const generated = generateRoutes(acoesService, {
  skip: ["get", "post", "put"],
  populate: ["modalidade"],
});

router.use(generated);

export default router;