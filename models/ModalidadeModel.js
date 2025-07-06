// models/ModalidadeModel.js
import mongoose from "mongoose";

const ModalidadeSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  responsavelTecnico: { type: String },
  auxiliarTecnico: { type: String },
  observacoes: { type: String }
});

// Coleção: modalidades
export const Modalidade = mongoose.model("Modalidade", ModalidadeSchema, "modalidades");
