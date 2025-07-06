// models/AtletaModel.js
import mongoose from "mongoose";
import { baseFields, baseOptions } from "./base/BaseModel.js";

const AtletaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  posicaoPreferencial: { type: String, required: true },
  posicaoSecundaria: { type: String },
  camisa: {
    type: String,
    maxlength: 3,
    validate: {
      validator: function (v) {
        return /^\d{1,3}$/.test(v); // Apenas números com até 3 dígitos
      },
      message: "O número da camisa deve ter no máximo 3 dígitos numéricos."
    }
  },
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
