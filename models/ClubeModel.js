import mongoose from "mongoose";
import { baseFields, baseOptions } from "./base/BaseModel.js";

const ClubeSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  cnpj: { type: String, required: true },
  cidade: { type: String },
  estado: { type: String },
  supervisao: { type: String,required: true },
  email: { type: String, required: true },
  telefone: { type: String, required: true },
  ...baseFields
}, baseOptions);

export default mongoose.model("Clube", ClubeSchema)