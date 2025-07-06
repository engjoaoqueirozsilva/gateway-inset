// models/BaseModel.js
import mongoose from "mongoose";

export const baseFields = {
  criadoEm: { type: Date, default: Date.now },
  atualizadoEm: { type: Date, default: Date.now }
};

export const baseOptions = {
  timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" }
};
