import { BaseService } from "./base/BaseService.js";
import { Treino } from "../models/TreinoModel.js";
import { Modalidade } from "../models/ModalidadeModel.js";
import mongoose from "mongoose";

class TreinoService extends BaseService {
  constructor() {
    super(Treino);
  }

  async getConsolidado(filtros, usuario) {
    const { modalidadeId, dataInicio, dataFim } = filtros;
    const { tipo: userType, clubeId } = usuario;

    // Array para armazenar IDs de modalidades permitidas
    let modalidadesPermitidas = [];

    // VALIDAÇÃO DE SEGURANÇA: Define quais modalidades o usuário pode acessar
    if (userType === "superAdmin") {
      // SuperAdmin pode ver todas as modalidades
      if (modalidadeId) {
        // Se especificou uma modalidade, valida apenas ela
        modalidadesPermitidas = [new mongoose.Types.ObjectId(modalidadeId)];
      } else {
        // Se não especificou, busca todas as modalidades
        const todasModalidades = await Modalidade.find().select("_id");
        modalidadesPermitidas = todasModalidades.map((m) => m._id);
      }
    } else {
      // Usuários normais: apenas modalidades do seu clube
      if (!clubeId || !clubeId._id) {
        throw new Error("Clube do usuário não identificado");
      }

      const clubeObjectId = new mongoose.Types.ObjectId(clubeId._id);

      // Busca todas as modalidades do clube do usuário
      const modalidadesDoClube = await Modalidade.find({
        clubeId: clubeObjectId,
      }).select("_id");

      const idsModalidadesDoClube = modalidadesDoClube.map((m) => m._id);

      // Se não houver modalidades para o clube, retorna vazio
      if (idsModalidadesDoClube.length === 0) {
        return {
          periodo: {
            inicio: dataInicio || new Date(),
            fim: dataFim || new Date(),
          },
          filtros: {
            modalidadeId: modalidadeId || "todas",
          },
          planos: [],
          mensagem: "Nenhuma modalidade encontrada para o clube",
        };
      }

      // Se especificou uma modalidade, valida se pertence ao clube
      if (modalidadeId) {
        const modalidadeObjectId = new mongoose.Types.ObjectId(modalidadeId);
        
        // Verifica se a modalidade solicitada pertence ao clube do usuário
        if (!idsModalidadesDoClube.some((id) => id.equals(modalidadeObjectId))) {
          console.warn(
            `⚠️ Tentativa de acesso não autorizado: Modalidade ${modalidadeId} não pertence ao Clube ${clubeId._id}`
          );
          throw new Error("Acesso negado: Modalidade não pertence ao seu clube");
        }
        
        modalidadesPermitidas = [modalidadeObjectId];
      } else {
        // Se não especificou, usa todas as modalidades do clube
        modalidadesPermitidas = idsModalidadesDoClube;
      }
    }

    // Se não há modalidades permitidas, retorna vazio
    if (modalidadesPermitidas.length === 0) {
      return {
        periodo: {
          inicio: dataInicio || new Date(),
          fim: dataFim || new Date(),
        },
        filtros: {
          modalidadeId: modalidadeId || "todas",
        },
        planos: [],
        mensagem: "Nenhuma modalidade acessível",
      };
    }

    // Construir filtro de data (padrão: mês atual)
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

    const filtroData = {
      $gte: dataInicio ? new Date(dataInicio) : inicioMes,
      $lte: dataFim ? new Date(dataFim) : fimMes,
    };

    console.log("🔍 Consolidando treinos:", {
      userType,
      clubeId: clubeId?._id,
      modalidadesPermitidas: modalidadesPermitidas.length,
      periodo: filtroData,
    });

    // Pipeline de agregação GERAL (sem quartis)
    const pipelineGeral = [
      // 1. Filtrar por modalidades permitidas, data e treinos finalizados
      {
        $match: {
          modalidade: { $in: modalidadesPermitidas },
          data: filtroData,
          finalizado: true,
        },
      },

      // 2. Fazer lookup do plano para pegar o nome
      {
        $lookup: {
          from: "planos",
          localField: "plano",
          foreignField: "_id",
          as: "planoInfo"
        }
      },

      // 3. Desestruturar o array do lookup
      {
        $unwind: {
          path: "$planoInfo",
          preserveNullAndEmptyArrays: true
        }
      },

      // 4. Desenrolar atletas
      {
        $unwind: "$atletas",
      },

      // 5. Desenrolar avaliações
      {
        $unwind: "$atletas.avaliacoes",
      },

      // 6. Desenrolar conceitos
      {
        $unwind: "$atletas.avaliacoes.conceitos",
      },
      {
        $match: {
          "atletas.avaliacoes.conceitos.nivel": { $nin: [null, "", undefined] }
        }
      },
      // 7. Agrupar por plano, atleta e fundamento
      {
        $group: {
          _id: {
            plano: "$plano",
            planoNome: "$planoInfo.nome",
            atleta: "$atletas.nome",
            fundamento: "$atletas.avaliacoes.fundamento",
          },
          totalTreinos: { $addToSet: "$_id" },
          conceitos: { 
            $push: {
              nivel: "$atletas.avaliacoes.conceitos.nivel",
              timestamp: "$atletas.avaliacoes.conceitos.timestamp"
            }
          },
          conceitoA: {
            $sum: { $cond: [{ $eq: ["$atletas.avaliacoes.conceitos.nivel", "A"] }, 1, 0] },
          },
          conceitoB: {
            $sum: { $cond: [{ $eq: ["$atletas.avaliacoes.conceitos.nivel", "B"] }, 1, 0] },
          },
          conceitoC: {
            $sum: { $cond: [{ $eq: ["$atletas.avaliacoes.conceitos.nivel", "C"] }, 1, 0] },
          },
          conceitoD: {
            $sum: { $cond: [{ $eq: ["$atletas.avaliacoes.conceitos.nivel", "D"] }, 1, 0] },
          },
          conceitoE: {
            $sum: { $cond: [{ $eq: ["$atletas.avaliacoes.conceitos.nivel", "E"] }, 1, 0] },
          },
          conceitoF: {
            $sum: { $cond: [{ $eq: ["$atletas.avaliacoes.conceitos.nivel", "F"] }, 1, 0] },
          },
        },
      },

      // 8. Calcular métricas
      {
        $project: {
          _id: 0,
          plano: "$_id.plano",
          planoNome: "$_id.planoNome",
          atleta: "$_id.atleta",
          fundamento: "$_id.fundamento",
          totalTreinos: { $size: "$totalTreinos" },
          totalAvaliacoes: { $size: "$conceitos" },
          distribuicao: {
            A: "$conceitoA",
            B: "$conceitoB",
            C: "$conceitoC",
            D: "$conceitoD",
            E: "$conceitoE",
            F: "$conceitoF",
          },
          conceitoPrevalente: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      { $gte: ["$conceitoA", "$conceitoB"] },
                      { $gte: ["$conceitoA", "$conceitoC"] },
                      { $gte: ["$conceitoA", "$conceitoD"] },
                      { $gte: ["$conceitoA", "$conceitoE"] },
                      { $gte: ["$conceitoA", "$conceitoF"] },
                    ],
                  },
                  then: "A",
                },
                {
                  case: {
                    $and: [
                      { $gte: ["$conceitoB", "$conceitoA"] },
                      { $gte: ["$conceitoB", "$conceitoC"] },
                      { $gte: ["$conceitoB", "$conceitoD"] },
                      { $gte: ["$conceitoB", "$conceitoE"] },
                      { $gte: ["$conceitoB", "$conceitoF"] },
                    ],
                  },
                  then: "B",
                },
                {
                  case: {
                    $and: [
                      { $gte: ["$conceitoC", "$conceitoA"] },
                      { $gte: ["$conceitoC", "$conceitoB"] },
                      { $gte: ["$conceitoC", "$conceitoD"] },
                      { $gte: ["$conceitoC", "$conceitoE"] },
                      { $gte: ["$conceitoC", "$conceitoF"] },
                    ],
                  },
                  then: "C",
                },
                {
                  case: {
                    $and: [
                      { $gte: ["$conceitoD", "$conceitoA"] },
                      { $gte: ["$conceitoD", "$conceitoB"] },
                      { $gte: ["$conceitoD", "$conceitoC"] },
                      { $gte: ["$conceitoD", "$conceitoE"] },
                      { $gte: ["$conceitoD", "$conceitoF"] },
                    ],
                  },
                  then: "D",
                },
                {
                  case: {
                    $and: [
                      { $gte: ["$conceitoE", "$conceitoA"] },
                      { $gte: ["$conceitoE", "$conceitoB"] },
                      { $gte: ["$conceitoE", "$conceitoC"] },
                      { $gte: ["$conceitoE", "$conceitoD"] },
                      { $gte: ["$conceitoE", "$conceitoF"] },
                    ],
                  },
                  then: "E",
                },
              ],
              default: "F",
            },
          },
          percentualPositivo: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      { $add: ["$conceitoA", "$conceitoB"] },
                      { $size: "$conceitos" },
                    ],
                  },
                  100,
                ],
              },
              2,
            ],
          },
          mediaNumerica: {
            $round: [
              {
                $divide: [
                  {
                    $add: [
                      { $multiply: ["$conceitoA", 5] },
                      { $multiply: ["$conceitoB", 4] },
                      { $multiply: ["$conceitoC", 3] },
                      { $multiply: ["$conceitoD", 2] },
                      { $multiply: ["$conceitoE", 1] },
                      { $multiply: ["$conceitoF", 0] },
                    ],
                  },
                  { $size: "$conceitos" },
                ],
              },
              2,
            ],
          },
        },
      },

      // 9. Agrupar por plano e atleta
      {
        $group: {
          _id: {
            plano: "$plano",
            planoNome: "$planoNome",
            atleta: "$atleta",
          },
          totalTreinos: { $first: "$totalTreinos" },
          fundamentos: {
            $push: {
              nome: "$fundamento",
              totalAvaliacoes: "$totalAvaliacoes",
              distribuicao: "$distribuicao",
              conceitoPrevalente: "$conceitoPrevalente",
              percentualPositivo: "$percentualPositivo",
              mediaNumerica: "$mediaNumerica",
            },
          },
        },
      },

      // 10. Agrupar por plano
      {
        $group: {
          _id: "$_id.plano",
          planoNome: { $first: "$_id.planoNome" },
          totalTreinos: { $first: "$totalTreinos" },
          atletas: {
            $push: {
              nome: "$_id.atleta",
              totalTreinos: "$totalTreinos",
              fundamentos: "$fundamentos",
            },
          },
        },
      },

      // 11. Formatar saída final
      {
        $project: {
          _id: 0,
          planoId: "$_id",
          planoNome: 1,
          totalTreinos: 1,
          atletas: 1,
        },
      },

      // 12. Ordenar por nome do plano
      {
        $sort: { planoNome: 1 },
      },
    ];

    // Pipeline de agregação POR QUARTIS
    const pipelineQuartis = [
      // 1. Filtrar treinos
      {
        $match: {
          modalidade: { $in: modalidadesPermitidas },
          data: filtroData,
          finalizado: true,
          duracaoTreino: { $exists: true, $gt: 0 }  // ✅ Só treinos com duração
        },
      },

      // 2. Lookup do plano
      {
        $lookup: {
          from: "planos",
          localField: "plano",
          foreignField: "_id",
          as: "planoInfo"
        }
      },

      // 3. Desestruturar plano
      {
        $unwind: {
          path: "$planoInfo",
          preserveNullAndEmptyArrays: true
        }
      },

      // 4. Desenrolar atletas
      {
        $unwind: "$atletas",
      },

      // 5. Desenrolar avaliações
      {
        $unwind: "$atletas.avaliacoes",
      },

      // 6. Desenrolar conceitos
      {
        $unwind: "$atletas.avaliacoes.conceitos",
      },

      // 7. Calcular quartil de cada conceito
      {
        $addFields: {
          quartil: {
            $switch: {
              branches: [
                {
                  case: {
                    $lte: [
                      "$atletas.avaliacoes.conceitos.timestamp",
                      { $multiply: ["$duracaoTreino", 0.25] }
                    ]
                  },
                  then: "Q1"
                },
                {
                  case: {
                    $lte: [
                      "$atletas.avaliacoes.conceitos.timestamp",
                      { $multiply: ["$duracaoTreino", 0.50] }
                    ]
                  },
                  then: "Q2"
                },
                {
                  case: {
                    $lte: [
                      "$atletas.avaliacoes.conceitos.timestamp",
                      { $multiply: ["$duracaoTreino", 0.75] }
                    ]
                  },
                  then: "Q3"
                }
              ],
              default: "Q4"
            }
          }
        }
      },

      // 8. Agrupar por plano, atleta, fundamento e quartil
      {
        $group: {
          _id: {
            plano: "$plano",
            planoNome: "$planoInfo.nome",
            atleta: "$atletas.nome",
            fundamento: "$atletas.avaliacoes.fundamento",
            quartil: "$quartil"
          },
          totalExecucoes: { $sum: 1 },
          conceitoA: {
            $sum: { $cond: [{ $eq: ["$atletas.avaliacoes.conceitos.nivel", "A"] }, 1, 0] },
          },
          conceitoB: {
            $sum: { $cond: [{ $eq: ["$atletas.avaliacoes.conceitos.nivel", "B"] }, 1, 0] },
          },
          conceitoC: {
            $sum: { $cond: [{ $eq: ["$atletas.avaliacoes.conceitos.nivel", "C"] }, 1, 0] },
          },
          conceitoD: {
            $sum: { $cond: [{ $eq: ["$atletas.avaliacoes.conceitos.nivel", "D"] }, 1, 0] },
          },
          conceitoE: {
            $sum: { $cond: [{ $eq: ["$atletas.avaliacoes.conceitos.nivel", "E"] }, 1, 0] },
          },
          conceitoF: {
            $sum: { $cond: [{ $eq: ["$atletas.avaliacoes.conceitos.nivel", "F"] }, 1, 0] },
          },
        },
      },

      // 9. Calcular métricas por quartil
      {
        $project: {
          _id: 0,
          plano: "$_id.plano",
          planoNome: "$_id.planoNome",
          atleta: "$_id.atleta",
          fundamento: "$_id.fundamento",
          quartil: "$_id.quartil",
          totalExecucoes: 1,
          distribuicao: {
            A: "$conceitoA",
            B: "$conceitoB",
            C: "$conceitoC",
            D: "$conceitoD",
            E: "$conceitoE",
            F: "$conceitoF",
          },
          percentualPositivo: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      { $add: ["$conceitoA", "$conceitoB"] },
                      "$totalExecucoes",
                    ],
                  },
                  100,
                ],
              },
              2,
            ],
          },
          mediaNumerica: {
            $round: [
              {
                $divide: [
                  {
                    $add: [
                      { $multiply: ["$conceitoA", 5] },
                      { $multiply: ["$conceitoB", 4] },
                      { $multiply: ["$conceitoC", 3] },
                      { $multiply: ["$conceitoD", 2] },
                      { $multiply: ["$conceitoE", 1] },
                      { $multiply: ["$conceitoF", 0] },
                    ],
                  },
                  "$totalExecucoes",
                ],
              },
              2,
            ],
          },
        },
      },

      // 10. Agrupar por plano, atleta e fundamento (com quartis dentro)
      {
        $group: {
          _id: {
            plano: "$plano",
            planoNome: "$planoNome",
            atleta: "$atleta",
            fundamento: "$fundamento"
          },
          quartis: {
            $push: {
              quartil: "$quartil",
              totalExecucoes: "$totalExecucoes",
              distribuicao: "$distribuicao",
              percentualPositivo: "$percentualPositivo",
              mediaNumerica: "$mediaNumerica"
            }
          }
        }
      },

      // 11. Agrupar por plano e atleta
      {
        $group: {
          _id: {
            plano: "$_id.plano",
            planoNome: "$_id.planoNome",
            atleta: "$_id.atleta"
          },
          fundamentos: {
            $push: {
              nome: "$_id.fundamento",
              quartis: "$quartis"
            }
          }
        }
      },

      // 12. Agrupar por plano
      {
        $group: {
          _id: "$_id.plano",
          planoNome: { $first: "$_id.planoNome" },
          atletas: {
            $push: {
              nome: "$_id.atleta",
              fundamentos: "$fundamentos"
            }
          }
        }
      },

      // 13. Formatar saída final
      {
        $project: {
          _id: 0,
          planoId: "$_id",
          planoNome: 1,
          atletas: 1,
        },
      },

      // 14. Ordenar por plano
      {
        $sort: { planoNome: 1 },
      },
    ];

    // Executar AMBAS as agregações em paralelo
    const [resultadoGeral, resultadoQuartis] = await Promise.all([
      this.model.aggregate(pipelineGeral),
      this.model.aggregate(pipelineQuartis)
    ]);

    console.log(`✅ Consolidação concluída: ${resultadoGeral.length} plano(s) encontrado(s)`);
    console.log(`✅ Análise por quartis concluída: ${resultadoQuartis.length} plano(s) com quartis`);

    // Retornar estrutura completa com AMBOS os resultados
    return {
      periodo: {
        inicio: filtroData.$gte,
        fim: filtroData.$lte,
      },
      filtros: {
        modalidadeId: modalidadeId || "todas",
        totalModalidadesAcessiveis: modalidadesPermitidas.length,
      },
      consolidadoGeral: resultadoGeral,      // ✅ Dados gerais (como já estava)
      analiseQuartis: resultadoQuartis,      // ✅ Dados por quartis (novo)
    };
  }

  async getPlanosComExecucao(usuario) {
    const { tipo: userType, clubeId } = usuario;

    let modalidadesPermitidas = [];

    if (userType === "superAdmin") {
      modalidadesPermitidas = null;
    } else {
      if (!clubeId || !clubeId._id) {
        throw new Error("Clube do usuário não identificado");
      }

      const Modalidade = mongoose.model("Modalidade");

      const modalidades = await Modalidade.find({
        clubeId: clubeId._id
      }).select("_id");

      modalidadesPermitidas = modalidades.map(m => m._id);
    }

    const matchStage = {
      finalizado: true
    };

    if (modalidadesPermitidas) {
      matchStage.modalidade = { $in: modalidadesPermitidas };
    }

    const pipeline = [
      { $match: matchStage },

      {
        $group: {
          _id: "$plano",
          totalTreinos: { $sum: 1 }
        }
      },

      {
        $lookup: {
          from: "planos",
          localField: "_id",
          foreignField: "_id",
          as: "planoInfo"
        }
      },

      { $unwind: "$planoInfo" },

      {
        $project: {
          _id: 0,
          planoId: "$_id",
          planoNome: "$planoInfo.nome",
          totalTreinos: 1
        }
      },

      { $sort: { planoNome: 1 } }
    ];

    return await this.model.aggregate(pipeline);
  }

async getResumoPorPlano(planoId, usuario) {

  if (!usuario?.clubeId) {
    throw new Error("Usuário sem clube associado");
  }

  const planoObjectId = new mongoose.Types.ObjectId(planoId);

  const resultado = await Treino.aggregate([

    {
      $match: {
        plano: planoObjectId,
        finalizado: true
      }
    },

    { $unwind: "$atletas" },
    { $unwind: "$atletas.avaliacoes" },
    { $unwind: "$atletas.avaliacoes.conceitos" },

    {
      $addFields: {
        fundamento: "$atletas.avaliacoes.fundamento",
        nivel: "$atletas.avaliacoes.conceitos.nivel",
        timestamp: "$atletas.avaliacoes.conceitos.timestamp",
        quartilSize: { $divide: ["$duracaoTreino", 4] }
      }
    },

    {
      $addFields: {
        quartil: {
          $switch: {
            branches: [
              { case: { $lte: ["$timestamp", "$quartilSize"] }, then: "Q1" },
              { case: { $lte: ["$timestamp", { $multiply: ["$quartilSize", 2] }] }, then: "Q2" },
              { case: { $lte: ["$timestamp", { $multiply: ["$quartilSize", 3] }] }, then: "Q3" }
            ],
            default: "Q4"
          }
        }
      }
    },

    {
      $group: {
        _id: {
          fundamento: "$fundamento",
          quartil: "$quartil",
          nivel: "$nivel"
        },
        totalNivel: { $sum: 1 }
      }
    },

    {
      $group: {
        _id: {
          fundamento: "$_id.fundamento",
          quartil: "$_id.quartil"
        },
        niveis: {
          $push: {
            nivel: "$_id.nivel",
            total: "$totalNivel"
          }
        },
        totalQuartil: { $sum: "$totalNivel" }
      }
    }

  ]);

  // 🔥 Agora montamos o objeto no Node (sem $arrayToObject)

  const resposta = {};

  resultado.forEach(item => {

    const fundamento = item._id.fundamento;
    const quartil = item._id.quartil;

    if (!resposta[fundamento]) {
      resposta[fundamento] = {};
    }

    if (!resposta[fundamento][quartil]) {
      resposta[fundamento][quartil] = {};
    }

    item.niveis.forEach(n => {

      const percentual = item.totalQuartil > 0
        ? Number(((n.total / item.totalQuartil) * 100).toFixed(2))
        : 0;

      resposta[fundamento][quartil][n.nivel] = {
        total: n.total,
        percentual
      };

    });

  });

  return resposta;
}


}

export default TreinoService;