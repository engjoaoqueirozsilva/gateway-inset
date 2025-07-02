import mongoose from 'mongoose';

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
  modalidade: String,
  responsavel: String,
  local: String,
  atletas: [AtletaSchema],
  observacoes: String,
  finalizado: Boolean
});

export const Treino = mongoose.model('Treino', TreinoSchema, 'in-set-pro');