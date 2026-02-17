import mongoose from 'mongoose';
import { baseFields, baseOptions } from "./base/BaseModel.js";

// ✅ Schema ajustado para incluir timestamp em cada conceito
const ConceitoSchema = new mongoose.Schema({
  nivel: String,        // A, B, C, D, E, F
  timestamp: Number     // Segundos desde o início do treino
}, { _id: false });

const AvaliacaoSchema = new mongoose.Schema({
  fundamento: String,
  conceitos: [ConceitoSchema]  
}, { _id: false });

const AtletaSchema = new mongoose.Schema({
  nome: String,
  avaliacoes: [AvaliacaoSchema]
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
  duracaoTreino: Number,  // ✅ Duração total em segundos
  ...baseFields
}, baseOptions);

export const Treino = mongoose.model('Treino', TreinoSchema);