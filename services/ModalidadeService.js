import { BaseService } from "./base/BaseService.js";
import { Modalidade } from "../models/ModalidadeModel.js";

class ModalidadeService extends BaseService {
  constructor() {
    super(Modalidade);
  }
}

export default ModalidadeService;
