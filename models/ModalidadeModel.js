// models/ModalidadeModel.js
import mongoose from "mongoose";
import { baseFields, baseOptions } from "./BaseModel.js";

const ModalidadeSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  responsavelTecnico: { type: String },
  auxiliarTecnico: { type: String },
  observacoes: { type: String },
  ...baseFields
}, baseOptions);

// Coleção: modalidades
export const Modalidade = mongoose.model("Modalidade", ModalidadeSchema, "modalidades");
