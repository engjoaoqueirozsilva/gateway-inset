// routes/usuarioRoutes.js
import express from "express";
import Usuario from "../models/UsuarioModel.js";

const router = express.Router();

// Criar novo usuário
router.post("/", async (req, res) => {
  const { nome, email, senha, clubeId, tipo = "admin" } = req.body;

  if (!nome || !email || !senha || !clubeId) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });
  }

  try {
    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(409).json({ error: "Email já cadastrado" });
    }

    const novo = await Usuario.create({
      nome,
      email,
      senha,
      clubeId,
      tipo: tipo === "superAdmin" ? "superAdmin" : "admin", // Proteção adicional
    });

    res.status(201).json({
      _id: novo._id,
      nome: novo.nome,
      email: novo.email,
      clubeId: novo.clubeId,
      tipo: novo.tipo,
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar usuário", details: err.message });
  }
});

export default router;
