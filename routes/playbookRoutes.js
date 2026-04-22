import express from "express";
import { extrairClubeId } from "../middlewares/auth.js";
import PlaybookService from "../services/PlaybookService.js";
import { generateRoutes } from "./base/baseRoute.js";

const router = express.Router();
const playbookService = new PlaybookService();

router.use(extrairClubeId);

// GET customizado com filtros
router.get("/", async (req, res) => {
  try {
    const clubeIdDoUsuario = req.usuario.clubeId;
    const modalidadeIdParam = req.query.modalidade;
    const nomeParam = req.query.nome;

    console.log("📥 GET /api/playbooks - Requisição de:", {
      nome: req.usuario.nome,
      userId: req.usuario._id.toString(),
      clubeId: clubeIdDoUsuario,
      tipo: req.usuario.tipo,
      queryParams: req.query,
    });

    const playbooks = await playbookService.getFilteredPlaybooks(
      req.usuario.tipo,
      clubeIdDoUsuario,
      modalidadeIdParam,
      nomeParam
    );

    res.status(200).json(playbooks);
  } catch (err) {
    console.error("❌ Erro no GET /playbooks:", err);
    res.status(500).json({
      error: "Erro ao buscar playbooks",
      details: err.message,
    });
  }
});

// POST customizado
router.post("/", async (req, res) => {
  try {
    const novo = await playbookService.create(req.body, req.usuario);
    res.status(201).json(novo);
  } catch (err) {
    console.error("❌ Erro ao criar playbook:", err);
    res.status(500).json({
      error: "Erro ao criar playbook",
      details: err.message,
    });
  }
});

// PUT customizado para incrementar versão e registrar atualizadoPor
router.put("/:id", async (req, res) => {
  try {
    const atual = await playbookService.findById(req.params.id);

    if (!atual) {
      return res.status(404).json({ error: "Playbook não encontrado" });
    }

    const payload = {
      ...req.body,
      versaoAtual: atual.versaoAtual || 1,
    };

    const atualizado = await playbookService.updateById(
      req.params.id,
      payload,
      req.usuario
    );

    res.status(200).json(atualizado);
  } catch (err) {
    console.error("❌ Erro ao atualizar playbook:", err);
    res.status(500).json({
      error: "Erro ao atualizar playbook",
      details: err.message,
    });
  }
});

// POST customizado para duplicar
router.post("/:id/duplicar", async (req, res) => {
  try {
    const duplicado = await playbookService.duplicar(
      req.params.id,
      req.usuario
    );
    res.status(201).json(duplicado);
  } catch (err) {
    console.error("❌ Erro ao duplicar playbook:", err);
    res.status(500).json({
      error: "Erro ao duplicar playbook",
      details: err.message,
    });
  }
});

const generated = generateRoutes(playbookService, {
  skip: ["get", "post", "put"],
  populate: ["modalidade"],
});

router.use(generated);

export default router;