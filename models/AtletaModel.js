// models/AtletaModel.js
import mongoose from "mongoose";
import { baseFields, baseOptions } from "./base/BaseModel.js";

const AtletaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  posicaoPreferencial: { type: String, required: true },
  posicaoSecundaria: { type: String },
  modalidade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Modalidade",
    required: true
  },
  contatoEmergencia: {
    nome: { type: String, required: true },
    telefone: { type: String, required: true }
  },
  ...baseFields
}, baseOptions);

export const Atleta = mongoose.model("Atleta", AtletaSchema, "atletas");
