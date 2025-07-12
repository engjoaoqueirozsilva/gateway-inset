import { BaseService } from "./base/BaseService.js";
import { Plano } from "../models/PlanoModel.js";

class PlanoService extends BaseService {
  constructor() {
    super(Plano);
  }

  // Busca com filtros + populate opcional
  async findAll(filtro = {}, populate = []) {
    let query = Plano.find(filtro);

    if (Array.isArray(populate)) {
      populate.forEach((campo) => {
        if (typeof campo === "string") {
          query = query.populate(campo);
        } else if (typeof campo === "object") {
          query = query.populate(campo);
        }
      });
    }

    return await query;
  }
}

export default PlanoService;
