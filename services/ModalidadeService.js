// services/ModalidadeService.js
import { BaseService } from "./base/BaseService.js";
import { Modalidade } from "../models/ModalidadeModel.js";

class ModalidadeService extends BaseService {
  constructor() {
    super(Modalidade);
  }

  /**
   * Sobrescreve o método findAll do BaseService para permitir
   * filtros e populate.
   * @param {object} filter - Objeto de filtro para a query do Mongoose.
   * @param {string|string[]|object} populateOptions - Opções para popular campos relacionados.
   * @returns {Promise<Array>} - Uma promessa que resolve para um array de documentos.
   */
  async findAll(filter = {}, populateOptions = []) {
    // Retorna a consulta com o filtro e as opções de populate aplicadas
    return await this.model.find(filter).populate(populateOptions);
  }
}

export default ModalidadeService;