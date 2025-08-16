// routes/atletaRoutes.js
import express from "express";
import mongoose from "mongoose"; // Necessário para converter IDs para ObjectId
import { extrairClubeId } from "../middlewares/auth.js";
import AtletaService from "../services/AtletaService.js";
import { generateRoutes } from "./base/baseRoute.js";

const router = express.Router();
const atletaService = new AtletaService();

// Aplica o middleware para injetar `req.usuario`
router.use(extrairClubeId);

// GET personalizado com filtro (por clube e/ou modalidade)
router.get("/", async (req, res) => {
 try {
  // O clubeId já vem como string do middleware `extrairClubeId`
  const clubeIdDoUsuario = req.usuario.clubeId;

  console.log("📥 GET /api/atletas - Requisição de:", {
 nome: req.usuario.nome,
 userId: req.usuario._id.toString(),
 clubeId: clubeIdDoUsuario, // O ID do clube do usuário logado
 tipo: req.usuario.tipo,
 queryParams: req.query // Loga todos os parâmetros de query recebidos
  });

  let filter = {}; // Objeto que construirá o filtro para o Mongoose
  const populateOptions = ["modalidade"]; // Queremos sempre popular a modalidade

  // Captura o ID da modalidade da query string, se estiver presente (ex: ?modalidade=ID)
  const modalidadeId = req.query.modalidade;

  if (req.usuario.tipo === "superAdmin") {
 // Para superAdmin, o filtro é opcional. Se modalidadeId for fornecido, filtramos por ela.
 if (modalidadeId) {
  filter.modalidade = new mongoose.Types.ObjectId(modalidadeId);
 }
  } else {
 // Para outros usuários, sempre filtramos pelo clubeId do usuário logado.
 if (!clubeIdDoUsuario) {
  console.error("❌ Erro: clubeId do usuário não encontrado na sessão.");
  return res.status(400).json({ error: "ID do clube do usuário não encontrado na sessão." });
 }
 filter.clubeId = new mongoose.Types.ObjectId(clubeIdDoUsuario); // Converte para ObjectId

 // Se um modalidadeId também for fornecido, adicione-o ao filtro
 if (modalidadeId) {
  filter.modalidade = new mongoose.Types.ObjectId(modalidadeId); // Converte para ObjectId
 }
  }

  // Log para depuração: mostra o filtro exato que será usado na consulta ao serviço
  console.log("➡️ Filtro final passado para AtletaService.findAll:", filter);

  // Chama o método findAll do serviço, que agora precisa aceitar o filtro e as opções de populate
  const atletas = await atletaService.findAll(filter, populateOptions);

  res.status(200).json(atletas);
 } catch (err) {
  console.error("❌ Erro no GET /atletas:", err);
  res.status(500).json({ error: "Erro ao buscar atletas", details: err.message });
 }
});

router.post("/", async (req, res) => {
 try {
  // Garante que o clubeId do usuário seja adicionado ao novo atleta
  // Se req.body já tiver um clubeId, ele será sobrescrito ou mesclado
  const dataToCreate = {
 ...req.body,
 clubeId: req.usuario.clubeId // Adiciona o clubeId do usuário logado
  };
  const novo = await atletaService.create(dataToCreate, req.usuario);
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
