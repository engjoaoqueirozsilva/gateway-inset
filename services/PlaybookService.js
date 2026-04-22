import mongoose from "mongoose";
import { BaseService } from "./base/BaseService.js";
import { Playbook } from "../models/PlaybookModel.js";
import { Modalidade } from "../models/ModalidadeModel.js";

class PlaybookService extends BaseService {
  constructor() {
    super(Playbook);
  }

  async findAll(filter = {}, populateOptions = []) {
    return await this.model.find(filter).populate(populateOptions);
  }

  async getFilteredPlaybooks(userType, clubeId, modalidadeId, nome) {
    let filter = { ativo: true };
    const populateOptions = ["modalidade"];

    if (nome) {
      filter.nome = { $regex: nome, $options: "i" };
    }

    if (userType === "superAdmin") {
      if (modalidadeId) {
        filter.modalidade = new mongoose.Types.ObjectId(modalidadeId);
      }

      return await this.findAll(filter, populateOptions);
    }

    if (!clubeId) {
      console.error(
        "❌ Erro no serviço: clubeId do usuário não fornecido para tipo não superAdmin."
      );
      return [];
    }

    const clubeObjectId = new mongoose.Types.ObjectId(clubeId);

    const modalidadesDoClube = await Modalidade.find({
      clubeId: clubeObjectId,
    }).select("_id");

    const idsModalidadesDoClube = modalidadesDoClube.map((m) => m._id);

    if (idsModalidadesDoClube.length === 0) {
      return [];
    }

    filter.modalidade = { $in: idsModalidadesDoClube };

    if (modalidadeId) {
      const modalidadeObjectId = new mongoose.Types.ObjectId(modalidadeId);

      if (!idsModalidadesDoClube.some((id) => id.equals(modalidadeObjectId))) {
        console.warn(
          `Tentativa de acesso não autorizado: Modalidade ${modalidadeId} não pertence ao Clube ${clubeId}.`
        );
        return [];
      }

      filter.modalidade = modalidadeObjectId;
    }

    return await this.findAll(filter, populateOptions);
  }

  async create(data, usuario) {
    const payload = { ...data };

    if (usuario?.clubeId) {
      payload.clubeId = usuario.clubeId;
    }

    if (!payload.criadoPor) {
      payload.criadoPor = {
        userId: usuario?._id?.toString?.() || usuario?.id || "",
        nome: usuario?.nome || "",
      };
    }

    return await this.model.create(payload);
  }

  async updateById(id, data, usuario) {
    const payload = { ...data };

    if (usuario?.clubeId && !payload.clubeId) {
      payload.clubeId = usuario.clubeId;
    }

    if (!payload.atualizadoPor) {
      payload.atualizadoPor = {
        userId: usuario?._id?.toString?.() || usuario?.id || "",
        nome: usuario?.nome || "",
      };
    }

    if (typeof payload.versaoAtual === "number") {
      payload.versaoAtual += 1;
    }

    const atualizado = await this.model.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    return atualizado;
  }

  async duplicar(id, usuario) {
    const original = await this.model.findById(id);

    if (!original) {
      throw new Error("Playbook não encontrado.");
    }

    const clone = original.toObject();

    delete clone._id;
    delete clone.createdAt;
    delete clone.updatedAt;

    clone.nome = `${clone.nome} (cópia)`;
    clone.versaoAtual = 1;
    clone.ativo = true;

    if (usuario?.clubeId) {
      clone.clubeId = usuario.clubeId;
    }

    clone.criadoPor = {
      userId: usuario?._id?.toString?.() || usuario?.id || "",
      nome: usuario?.nome || "",
    };

    return await this.model.create(clone);
  }
}

export default PlaybookService;