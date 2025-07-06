import { BaseService } from "./base/BaseService.js";
import { Atleta } from "../models/AtletaModel.js";

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
  
}

export default AtletaService;
