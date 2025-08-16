// routes/atletaRoutes.js
import express from "express";
import { extrairClubeId } from "../middlewares/auth.js";
import AtletaService from "../services/AtletaService.js";
import { generateRoutes } from "./base/baseRoute.js";

const router = express.Router();
const atletaService = new AtletaService();

// Aplica o middleware para injetar `req.usuario`
router.use(extrairClubeId);

// GET personalizado para buscar atletas com filtros (lógica no serviço)
router.get("/", async (req, res) => {
 try {
  const clubeIdDoUsuario = req.usuario.clubeId; // Já vem como string do middleware
  const modalidadeIdParam = req.query.modalidade; // Captura o ID da modalidade da query string

  console.log("📥 GET /api/atletas - Requisição de:", {
   nome: req.usuario.nome,
   userId: req.usuario._id.toString(),
   clubeId: clubeIdDoUsuario,
   tipo: req.usuario.tipo,
   queryParams: req.query // Loga todos os parâmetros de query recebidos
  });

  // *** Delega toda a lógica de filtragem para o AtletaService ***
  const atletas = await atletaService.getFilteredAthletes(
   req.usuario.tipo,
   clubeIdDoUsuario,
   modalidadeIdParam
  );

  res.status(200).json(atletas);
 } catch (err) {
  console.error("❌ Erro no GET /atletas:", err);
  res.status(500).json({ error: "Erro ao buscar atletas", details: err.message });
 }
});

router.post("/", async (req, res) => {
 try {
  // A criação de um atleta não adiciona clubeId diretamente se não for no modelo.
  // O vínculo é via modalidade que vem no req.body.
  const novo = await atletaService.create(req.body, req.usuario);
  res.status(201).json(novo);
 } catch (err) {
  console.error("❌ Erro ao criar atleta:", err);
  res.status(500).json({ error: "Erro ao criar atleta", details: err.message });
 }
});

const generated = generateRoutes(atletaService, {
 skip: ["get", "post"], // Pulamos 'get' e 'post' porque os tratamos customizadamente acima
 populate: ["modalidade"] // Mantemos para as rotas geradas (ex: PUT, DELETE)
});

router.use(generated);

export default router;
