import mongoose from 'mongoose';
import { baseFields, baseOptions } from "./base/BaseModel.js";

const AvaliacaoSchema = new mongoose.Schema({
  Saque: [String],
  Ataque: [String],
  Defesa: [String],
  Passe: [String],
  Levantamento: [String],
  Bloqueio: [String]
}, { _id: false });

const AtletaSchema = new mongoose.Schema({
  nome: String,
  avaliacoes: AvaliacaoSchema
}, { _id: false });

const TreinoSchema = new mongoose.Schema({
  treinoId: String,
  data: Date,
  modalidade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Modalidade",
    required: true
  },
  plano:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plano",
    required: true
  },
  responsavel: String,
  local: String,
  atletas: [AtletaSchema],
  observacoes: String,
  finalizado: Boolean,
  ...baseFields
}, baseOptions
);

export const Treino = mongoose.model('Treino', TreinoSchema);