import Usuario from "../models/UsuarioModel.js";
import { BaseService } from "./BaseService.js";

export default class UsuarioService extends BaseService {
  constructor() {
    super(Usuario);
  }

  async login(email, senha) {
    const usuario = await Usuario.findOne({ email }).populate("clubeId");
    if (!usuario) return null;

    const valido = await usuario.validarSenha(senha);
    if (!valido) return null;

    return {
      userId: usuario._id,
      nome: usuario.nome,
      clubeId: usuario.clubeId._id,
      tipo: usuario.tipo,
    };
  }
}