import { BaseService } from "./base/BaseService.js";
import { Treino } from "../models/TreinoModel.js";

class TreinoService extends BaseService {
  constructor() {
    super(Treino);
  }
}

export default TreinoService;
