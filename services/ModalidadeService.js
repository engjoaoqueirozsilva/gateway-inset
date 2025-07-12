// services/ModalidadeService.js
import { BaseService } from "./base/BaseService.js";
import { Modalidade } from "../models/ModalidadeModel.js";

class ModalidadeService extends BaseService {
  constructor() {
    super(Modalidade);
  }

  // já herda findAll com suporte a filtro
}

export default ModalidadeService;
