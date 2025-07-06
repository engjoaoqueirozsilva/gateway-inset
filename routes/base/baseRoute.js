// routes/BaseRoutes.js
import express from "express";

export function generateRoutes(service, options = {}) {
  const router = express.Router();

  // Criar novo item
  router.post("/", async (req, res) => {
    try {
      const novo = await service.create(req.body);
      res.status(201).json(novo);
    } catch (err) {
      res.status(500).json({ error: "Erro ao salvar", details: err });
    }
  });

  // Listar todos os itens
 router.get("/", async (_req, res) => {
  try {
    let query = service.findAll(); // não usar await aqui ainda

    // Verifica se foi passado populate (ex: ['modalidade'])
    if (options && Array.isArray(options.populate)) {
      options.populate.forEach((path) => {
        query = query.populate(path);
      });
    }

    const resultado = await query; // await só depois do populate
    res.status(200).json(resultado);
    
  } catch (err) {
    console.error("Erro ao buscar todos os itens:", err);
    res.status(500).json({ error: "Erro ao buscar dados", details: err.message });
  }
});


  return router;
}
