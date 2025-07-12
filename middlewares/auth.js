export const extrairClubeId = async (req, res, next) => {
  const userId = req.headers["x-user-id"];
  if (!userId) return res.status(401).json({ error: "Usuário não autenticado" });

  try {
    const Usuario = (await import("../models/UsuarioModel.js")).default;
    const usuario = await Usuario.findById(userId).populate("clubeId");
    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });

    console.log("🔍 Usuário autenticado:", {
      userId: usuario._id.toString(),
      nome: usuario.nome,
      clubeId: usuario.clubeId?._id?.toString(),
      tipo: usuario.tipo
    });

    req.usuario = usuario;
    next();
  } catch (err) {
    res.status(500).json({ error: "Erro na autenticação", details: err.message });
  }
};