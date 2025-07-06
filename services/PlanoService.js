import { BaseService } from "./base/BaseService.js";
import { Plano } from "../models/PlanoModel.js";

class PlanoService extends BaseService {
  constructor() {
    super(Plano);
  }
}

export default PlanoService;
