import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { baseFields, baseOptions } from "./base/BaseModel.js";

const UsuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  clubeId: { type: mongoose.Schema.Types.ObjectId, ref: "Clube", required: true },
  tipo: { type: String, default: "admin" },
  ...baseFields
}, baseOptions);

UsuarioSchema.pre("save", async function (next) {
  if (!this.isModified("senha")) return next();
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

UsuarioSchema.methods.validarSenha = async function (senhaDigitada) {
  return await bcrypt.compare(senhaDigitada, this.senha);
};

export default mongoose.model("Usuario", UsuarioSchema);