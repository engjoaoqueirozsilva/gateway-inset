import { BaseService } from "./base/BaseService.js";
import { Atleta } from "../models/AtletaModel.js";
import { Modalidade } from "../models/ModalidadeModel.js";

class AtletaService extends BaseService {
  constructor() {
    super(Atleta);
  }

  async findAll(filtro = {}, populate = []) {
    let query = Atleta.find(filtro);

    if (Array.isArray(populate)) {
      populate.forEach((campo) => {
        query = query.populate(campo);
      });
    }
    return await query;
  }

  // Retorna atletas apenas das modalidades do clube informado
  async findAllFiltrandoPorClube(clubeId) {
    // Encontra as modalidades relacionadas ao clube
    const modalidades = await Modalidade.find({ clubeId }).select("_id");
    const idsModalidades = modalidades.map((m) => m._id);

    // Retorna os atletas dessas modalidades, populando corretamente
    return await Atleta.find({ modalidade: { $in: idsModalidades } })
      .populate("modalidade");
  }


  async create(data, usuario) {
    // Injeta o clubeId no payload antes de salvar
    const modalidadeId = data.modalidade;

    if (!modalidadeId) {
      throw new Error("Modalidade obrigatória para criação de atleta");
    }

    return await this.model.create({
      ...data,
      // O clubeId será herdado da modalidade, que já está associada ao clube
      // Mas se quiser garantir agora, injetamos direto do usuário logado:
      clubeId: usuario.clubeId,
    });
  }
}



export default AtletaService;
