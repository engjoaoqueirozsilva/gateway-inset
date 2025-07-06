import { BaseService } from "./base/BaseService.js";
import { Plano } from "../models/PlanoModel.js";

class PlanoService extends BaseService {
  constructor() {
    super(Plano);
  }

  async findAll(filtro = {}, populate = []) {
    let query = Plano.find(filtro);

    if (Array.isArray(populate)) {
      populate.forEach((campo) => {
        query = query.populate(campo);
      });
    }

    return await query;
  }
}

export default PlanoService;
