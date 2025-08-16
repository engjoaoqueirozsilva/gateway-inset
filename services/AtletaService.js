// services/AtletaService.js
import { BaseService } from "./base/BaseService.js";
import { Atleta } from "../models/AtletaModel.js"; // Importa o modelo Atleta
import { Modalidade } from "../models/ModalidadeModel.js"; // *** Importação crucial: modelo Modalidade ***
import mongoose from "mongoose"; // Necessário para converter IDs para ObjectId

class AtletaService extends BaseService {
  constructor() {
    super(Atleta); // Passa o modelo Atleta para o BaseService
  }

  /**
   * Sobrescreve o método findAll do BaseService para permitir
   * filtros e populate genéricos.
   * @param {object} filter - Objeto de filtro para a query do Mongoose.
   * @param {string|string[]|object} populateOptions - Opções para popular campos relacionados.
   * @returns {Promise<Array>} - Uma promessa que resolve para um array de documentos.
   */
  async findAll(filter = {}, populateOptions = []) {
    return await this.model.find(filter).populate(populateOptions);
  }

  /**
   * Busca atletas aplicando filtros com base no tipo de usuário,
   * no ID do clube e no ID da modalidade. Contém a lógica de negócio
   * para garantir que atletas de clubes/modalidades indevidas não sejam retornados.
   *
   * @param {string} userType - O tipo do usuário logado (ex: "superAdmin", "admin").
   * @param {string} clubeId - O ID do clube do usuário logado (se aplicável).
   * @param {string} [modalidadeId] - O ID da modalidade pela qual filtrar (opcional).
   * @returns {Promise<Array>} Uma promessa que resolve para um array de atletas.
   */
  async getFilteredAthletes(userType, clubeId, modalidadeId) {
    let filter = {};
    const populateOptions = ["modalidade"]; // Queremos sempre popular a modalidade

    if (userType === "superAdmin") {
      // Para superAdmin, o filtro é opcional e apenas por modalidade, se fornecida.
      if (modalidadeId) {
        filter.modalidade = new mongoose.Types.ObjectId(modalidadeId);
      }
      // Chama o método findAll genérico que herdamos para aplicar o filtro
      return await this.findAll(filter, populateOptions);
    } else {
      // Para outros usuários (admin, etc.), a lógica é mais complexa devido
      // à estrutura Atleta -> Modalidade -> Clube.
      if (!clubeId) {
        console.error("❌ Erro no serviço: clubeId do usuário não fornecido para tipo não superAdmin.");
        return []; // Retorna vazio se o clubeId não estiver disponível
      }

      const clubeObjectId = new mongoose.Types.ObjectId(clubeId);

      // 1. Encontrar todas as modalidades que pertencem ao clube do usuário.
      // Isso é necessário porque o atleta é ligado à modalidade, não diretamente ao clube.
      const modalidadesDoClube = await Modalidade.find({
        clubeId: clubeObjectId,
      }).select("_id"); // Retorna apenas os IDs das modalidades

      const idsModalidadesDoClube = modalidadesDoClube.map((m) => m._id);

      // Se não houver modalidades para o clube, não há atletas para retornar
      if (idsModalidadesDoClube.length === 0) {
        return [];
      }

      // 2. Construir o filtro para atletas: devem pertencer a qualquer uma
      // das modalidades encontradas para o clube do usuário.
      filter.modalidade = { $in: idsModalidadesDoClube };

      // 3. Se um modalidadeId específico foi passado, refinar o filtro.
      // Isto também serve como VALIDAÇÃO: garante que a modalidade solicitada
      // realmente pertence ao clube do usuário.
      if (modalidadeId) {
        const modalidadeObjectId = new mongoose.Types.ObjectId(modalidadeId);
        // Verifica se o modalidadeId solicitado está entre os IDs de modalidade do clube.
        // Se não estiver, significa que o usuário está tentando acessar uma modalidade
        // que não pertence ao seu clube.
        if (!idsModalidadesDoClube.some(id => id.equals(modalidadeObjectId))) {
          console.warn(`Tentativa de acesso não autorizado: Modalidade ${modalidadeId} não pertence ao Clube ${clubeId}.`);
          return []; // Retorna vazio se a modalidade não for do clube
        }
        filter.modalidade = modalidadeObjectId; // Filtra especificamente por esta modalidade
      }

      // Finalmente, busca os atletas com o filtro construído
      return await this.findAll(filter, populateOptions);
    }
  }
}

export default AtletaService;