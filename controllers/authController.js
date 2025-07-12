// controllers/authController.js
import Usuario from "../models/UsuarioModel.js";

export const login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }

  try {
    const usuario = await Usuario.findOne({ email }).populate("clubeId");
    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const senhaValida = await usuario.validarSenha(senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    return res.status(200).json({
      mensagem: "Login efetuado com sucesso",
      userId: usuario._id,
      clubeId: usuario.clubeId._id,
      nome: usuario.nome,
      tipo: usuario.tipo,
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro interno", details: err.message });
  }
};
