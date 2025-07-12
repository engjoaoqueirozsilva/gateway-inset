import mongoose from 'mongoose';
import { baseFields, baseOptions } from "./base/BaseModel.js";

const ParticipanteSchema = new mongoose.Schema({
  id: String,
  nome: String,
  posicao: String,
  camisa: {
    type: String,
    maxlength: 3,
    validate: {
      validator: function (v) {
        return /^\d{1,3}$/.test(v); // Apenas números de até 3 dígitos
      },
      message: "O número da camisa deve ter no máximo 3 dígitos numéricos."
    }
  }
});

const PlanoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  modalidade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Modalidade",
    required: true
  },
  fundamentos: { type: [String], default: [] },
  participantes: { type: [ParticipanteSchema], default: [] },
  ...baseFields
}, baseOptions);

export const Plano = mongoose.model("Plano", PlanoSchema);
