// routes/planoRoutes.js
import express from "express";
import { extrairClubeId } from "../middlewares/auth.js";
import PlanoService from "../services/PlanoService.js";
import { generateRoutes } from "./base/baseRoute.js";
import { Modalidade } from "../models/ModalidadeModel.js";

const router = express.Router();
const planoService = new PlanoService();

router.use(extrairClubeId);


// ...

router.get("/", async (req, res) => {
  try {
    console.log("📥 GET /api/planos - Requisição de:", {
      nome: req.usuario.nome,
      userId: req.usuario._id.toString(),
      clubeId: req.usuario.clubeId?._id?.toString(),
      tipo: req.usuario.tipo,
    });

    let planos;

    if (req.usuario.tipo === "superAdmin") {
      planos = await planoService.findAll({}, [
        {
          path: "modalidade",
          populate: { path: "clubeId" },
        },
      ]);
    } else {
      // ✅ Filtro inteligente no banco
      const modalidadesDoClube = await Modalidade.find({
        clubeId: req.usuario.clubeId._id,
      }).select("_id");

      const ids = modalidadesDoClube.map((m) => m._id);

      planos = await planoService.findAll(
        { modalidade: { $in: ids } },
        [
          {
            path: "modalidade",
            populate: { path: "clubeId" },
          },
        ]
      );
    }

    res.status(200).json(planos);
  } catch (err) {
    console.error("❌ Erro no GET /planos:", err);
    res.status(500).json({ error: "Erro ao buscar planos", details: err.message });
  }
});


// Rotas CRUD automáticas (exceto GET customizado)
const generated = generateRoutes(planoService, {
  skip: ["get"],
  populate: ["modalidade"],
});
router.use(generated);

export default router;
