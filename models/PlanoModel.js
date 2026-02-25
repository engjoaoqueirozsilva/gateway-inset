import mongoose from 'mongoose';
import { baseFields, baseOptions } from "./base/BaseModel.js";

/*
|--------------------------------------------------------------------------
| Participantes
|--------------------------------------------------------------------------
*/

const ParticipanteSchema = new mongoose.Schema({
  id: String,
  nome: String,
  posicao: String,
  camisa: {
    type: String,
    maxlength: 3,
    validate: {
      validator: function (v) {
        if (!v) return true;
        return /^\d{1,3}$/.test(v);
      },
      message: "O número da camisa deve ter no máximo 3 dígitos numéricos."
    }
  }
});

/*
|--------------------------------------------------------------------------
| Faixas Percentuais (PADRÃO DO SISTEMA)
|--------------------------------------------------------------------------
*/

const FAIXAS_PERCENTUAIS = [
  "F1_0_25",
  "F2_26_50",
  "F3_51_75",
  "F4_75_89",
  "F5_90_100"
];

const FAIXA_PESO = {
  F1_0_25: 1,
  F2_26_50: 2,
  F3_51_75: 3,
  F4_75_89: 4,
  F5_90_100: 5
};

/*
|--------------------------------------------------------------------------
| Expectativa - Nível
|--------------------------------------------------------------------------
*/

const ExpectativaNivelSchema = new mongoose.Schema({
  tipoIntervalo: {
    type: String,
    enum: ["ate", "entre"],
    required: true
  },
  faixas: [{
    type: String,
    enum: FAIXAS_PERCENTUAIS,
    required: true
  }]
}, { _id: false });

/*
|--------------------------------------------------------------------------
| Expectativa de Aproveitamento
|--------------------------------------------------------------------------
*/

const ExpectativaAproveitamentoSchema = new mongoose.Schema({
  compliance: ExpectativaNivelSchema,
  performance: ExpectativaNivelSchema,
  overPerformance: ExpectativaNivelSchema
}, { _id: false });

/*
|--------------------------------------------------------------------------
| Helpers de Validação
|--------------------------------------------------------------------------
*/

function obterPesoMaximo(nivel) {
  if (!nivel || !nivel.faixas || nivel.faixas.length === 0) {
    return null;
  }

  return Math.max(
    ...nivel.faixas.map(f => FAIXA_PESO[f])
  );
}

function validarProgressao(expectativa, tipo) {
  if (!expectativa) return true;

  const c = obterPesoMaximo(expectativa.compliance);
  const p = obterPesoMaximo(expectativa.performance);
  const o = obterPesoMaximo(expectativa.overPerformance);

  // se algum não estiver definido ainda, não bloqueia salvamento
  if (c == null || p == null || o == null) return true;

  // Aproveitamento POSITIVO → cresce
  if (tipo === "positivo") {
    return c <= p && p <= o;
  }

  // Aproveitamento NEGATIVO → diminui
  if (tipo === "negativo") {
    return c >= p && p >= o;
  }

  return true;
}

/*
|--------------------------------------------------------------------------
| Plano
|--------------------------------------------------------------------------
*/

const PlanoSchema = new mongoose.Schema({
  nome: { type: String, required: true },

  modalidade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Modalidade",
    required: true
  },

  fundamentos: {
    type: [String],
    default: []
  },

  participantes: {
    type: [ParticipanteSchema],
    default: []
  },

  /*
  |--------------------------------------------------------------------------
  | Expectativas de Aproveitamento
  |--------------------------------------------------------------------------
  */

  expectativasAproveitamento: {
    positivo: ExpectativaAproveitamentoSchema,
    negativo: ExpectativaAproveitamentoSchema
  },

  ...baseFields

}, baseOptions);

/*
|--------------------------------------------------------------------------
| Validação Semântica das Expectativas
|--------------------------------------------------------------------------
*/

PlanoSchema.pre("validate", function (next) {

  const expectativas = this.expectativasAproveitamento;

  if (!expectativas) return next();

  const positivoOk = validarProgressao(
    expectativas.positivo,
    "positivo"
  );

  const negativoOk = validarProgressao(
    expectativas.negativo,
    "negativo"
  );

  if (!positivoOk) {
    return next(
      new Error(
        "Expectativa positiva inválida: níveis devem evoluir de Compliance → Performance → OverPerformance."
      )
    );
  }

  if (!negativoOk) {
    return next(
      new Error(
        "Expectativa negativa inválida: níveis devem reduzir de Compliance → Performance → OverPerformance."
      )
    );
  }

  next();
});

/*
|--------------------------------------------------------------------------
| Model Export
|--------------------------------------------------------------------------
*/

export const Plano = mongoose.model("Plano", PlanoSchema);