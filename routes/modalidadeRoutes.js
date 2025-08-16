// routes/modalidadeRoutes.js
import express from "express";
import mongoose from "mongoose"; // Necessário para converter IDs para ObjectId
import { extrairClubeId } from "../middlewares/auth.js";
import ModalidadeService from "../services/ModalidadeService.js";
import { generateRoutes } from "./base/baseRoute.js";
// Não precisamos mais importar o modelo Modalidade diretamente aqui

const router = express.Router();
const modalidadeService = new ModalidadeService();

router.use(extrairClubeId);

// GET personalizado com filtro por clube
router.get("/", async (req, res) => {
  try {
    // O clubeId já vem como string do middleware, conforme seus logs
    const clubeIdDoUsuario = req.usuario.clubeId;

    console.log("📥 GET /api/modalidades - Requisição de:", {
      nome: req.usuario.nome,
      userId: req.usuario._id.toString(),
      clubeId: clubeIdDoUsuario,
      tipo: req.usuario.tipo,
    });

    let modalidades;
    let filter = {}; // Inicializa o objeto de filtro
    let populateOptions = ["clubeId"]; // Sempre popularemos o campo 'clubeId'

    if (req.usuario.tipo === "superAdmin") {
      // Para superAdmin, não há filtro específico, o 'filter' permanece vazio
      filter = {};
    } else {
      // Para outros usuários, aplicamos o filtro pelo clubeId
      if (!clubeIdDoUsuario) {
        console.error("❌ Erro: clubeId do usuário não encontrado na sessão.");
        return res.status(400).json({ error: "ID do clube do usuário não encontrado na sessão." });
      }
      // Converte o ID do clube do usuário para um ObjectId do Mongoose
      const clubeObjectId = new mongoose.Types.ObjectId(clubeIdDoUsuario);
      filter = { clubeId: clubeObjectId }; // Define o filtro para o clubeId específico
    }

    // Log para depuração: mostra o filtro exato que será usado na query
    console.log("➡️ Filtro final passado para ModalidadeService.findAll:", filter);

    // Chamamos o método findAll do serviço, que agora aceita o filtro e populate
    modalidades = await modalidadeService.findAll(filter, populateOptions);

    res.status(200).json(modalidades);
  } catch (err) {
    console.error("❌ Erro no GET /modalidades:", err);
    res.status(500).json({ error: "Erro ao buscar modalidades", details: err.message });
  }
});

// Demais rotas com generateRoutes
// Mantemos o 'populate' aqui para que as rotas geradas (POST, PUT, etc.)
// também populem o 'clubeId' se o seu BaseService (ou os métodos sobrescritos)
// usar essa opção.
const generated = generateRoutes(modalidadeService, {
  skip: ["get"], // Mantemos o 'get' pulado porque o tratamos customizadamente acima
  populate: ["clubeId"],
});
router.use(generated);

export default router;
