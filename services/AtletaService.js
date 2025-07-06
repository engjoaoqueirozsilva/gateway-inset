// services/AtletaService.js
import { BaseService } from "../base/BaseService.js";
import { Atleta } from "../models/AtletaModel.js";

class AtletaService extends BaseService {
  constructor() {
    super(Atleta);
  }
}

export default new AtletaService();
