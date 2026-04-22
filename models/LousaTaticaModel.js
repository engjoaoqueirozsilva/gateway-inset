import mongoose from "mongoose";
import { baseFields, baseOptions } from "./base/BaseModel.js";

const ElementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        "athlete",
        "opponent",
        "ball",
        "arrow",
        "line",
        "text",
        "scribble",
        "cone",
        "zone",
      ],
    },

    atletaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Atleta",
    },

    nome: { type: String },
    label: { type: String },
    camisa: { type: String },

    x: { type: Number },
    y: { type: Number },

    points: [{ type: Number }],

    text: { type: String },

    color: { type: String, default: "#111827" },
    fill: { type: String },
    strokeWidth: { type: Number, default: 2 },
    fontSize: { type: Number, default: 16 },
    size: { type: Number, default: 20 },

    team: {
      type: String,
      enum: ["A", "B", "N"],
      default: "N",
    },

    rotation: { type: Number, default: 0 },
    draggable: { type: Boolean, default: true },

    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const LousaTaticaSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    descricao: { type: String, default: "" },

    modalidade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Modalidade",
      required: true,
    },

    categoria: { type: String, default: "" },
    tags: [{ type: String }],

    background: {
      tipo: { type: String, required: true, default: "futsal" },
      variante: { type: String, default: "completo" },
    },

    canvas: {
      width: { type: Number, default: 1200 },
      height: { type: Number, default: 800 },
      zoom: { type: Number, default: 1 },
    },

    elements: {
      type: [ElementSchema],
      default: [],
    },

    preview: { type: String, default: null },
    versaoAtual: { type: Number, default: 1 },
    ativo: { type: Boolean, default: true },

    ...baseFields,
  },
  baseOptions
);

export const LousaTatica = mongoose.model(
  "LousaTatica",
  LousaTaticaSchema,
  "lousasTaticas"
);