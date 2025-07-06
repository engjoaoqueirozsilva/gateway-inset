import mongoose from 'mongoose';
import { baseFields, baseOptions } from "./base/BaseModel.js";

const ParticipanteSchema = new mongoose.Schema({
  id: String,
  nome: String
}, { _id: false });

const PlanoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  modalidade: { type: mongoose.Schema.Types.ObjectId, ref: "Modalidade", required: true },
  fundamentos: { type: [String], default: [] },
  participantes: { type: [ParticipanteSchema], default: [] },
  ...baseFields
}, baseOptions);

export const Plano = mongoose.model("Plano", PlanoSchema);
