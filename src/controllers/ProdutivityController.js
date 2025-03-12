const fileService = require("../services/fileService");

const calcularProdutividade = async (req, res) => {
  const { excelData, users } = req.body;

  if (!excelData || !users) {
    return res.status(400).json({ error: "Dados insuficientes" });
  }

  const currentDate = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });

  const productivityData = contarUsuarios(excelData, [currentDate]);
  const TMA = await getTMA(excelData, [currentDate]);

  const usuariosTurnoTabela = new Map(
    users.map((usuario) => [
      usuario.name,
      {
        shift: usuario.shift,
        channel: usuario.channel,
        entrada: usuario.shift.split("-")[1],
      },
    ])
  );

  const currentHour = new Date().toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour12: false,
    hour: "2-digit",
  });

  const usuariosInfo = Object.entries(productivityData).reduce(
    (acc, [usuario, produtividade]) => {
      const userShift = usuariosTurnoTabela.get(usuario) || {};
      const entrada = userShift.entrada || "08:00";
      const [horasEntrada] = entrada.split(":").map(Number);
      let horasTrabalhadas = Math.max(
        0,
        Math.min(6, currentHour - horasEntrada)
      );

      const metaMap = {
        Treinamento: 0,
        "Meli Mensageria": 16.66,
        "Meli Reclamação": 14.2,
        "Meli Mediação": 14.2,
        Liderança: 14.2,
      };

      const meta = metaMap[userShift.channel] || 13.33;
      const metaTotal = Math.round(meta * horasTrabalhadas);
      const porcentagem =
        metaTotal > 0 ? ((produtividade / metaTotal) * 100).toFixed(0) : "-";

      acc[usuario] = {
        produtividade,
        tma: TMA.tma[usuario]?.mediaTMA || 0,
        turno: userShift.shift || "Desconhecido",
        channel: userShift.channel || "Desconhecido",
        meta: metaTotal,
        porcentagem,
      };

      return acc;
    },
    {}
  );

  const usuariosOrdenadosPorTurno = Object.entries(usuariosInfo)
    .sort(([, a], [, b]) => a.turno.localeCompare(b.turno))
    .reduce((obj, [chave, valor]) => ((obj[chave] = valor), obj), {});

  return res.json({
    usuariosOrdenadosPorTurno,
    totalAtendimentosGeral: TMA.totalAtendimentosGeral,
    mediaTMAGeral: TMA.mediaTMAGeral,
    atendimentosPorCanal: TMA.atendimentosPorCanal,
    metaTotalGeral: Object.values(usuariosInfo).reduce(
      (acc, u) => acc + u.meta,
      0
    ),
    dataTratamentoVaziasPorCanal: TMA.dataTratamentoVaziasPorCanal,
  });
};

// Função para contar usuários
const contarUsuarios = (arquivos, dataFiltro) => {
  return arquivos.reduce((contador, arquivo) => {
    arquivo.data.forEach(
      ({
        "DATA DE TRATAMENTO": dataTratamento,
        "USUÁRIO QUE FEZ O TRATAMENTO": usuario,
      }) => {
        if (dataFiltro.includes(dataTratamento?.split(" ")[0])) {
          contador[usuario] = (contador[usuario] || 0) + 1;
        }
      }
    );
    return contador;
  }, {});
};

// Função para calcular TMA
const getTMA = async (arquivos, dataFiltro) => {
  const files = await fileService.getFiles();
  const filenameToChannel = new Map(
    files.map(({ filename, channel_slug }) => [filename, channel_slug])
  );

  let totalTempoGeral = 0,
    totalAtendimentosGeral = 0;
  const atendimentosPorCanal = {};
  const dataTratamentoVaziasPorCanal = {};

  const tma = arquivos.reduce((acc, arquivo) => {
    const channelSlug =
      filenameToChannel.get(arquivo.fileName) || "desconhecido";
    atendimentosPorCanal[channelSlug] ||= {
      totalTempo: 0,
      totalAtendimentos: 0,
      operadores: {},
    };
    dataTratamentoVaziasPorCanal[channelSlug] ||= 0;

    arquivo.data.forEach(
      ({
        "DATA DE TRATAMENTO": dataTratamento,
        "USUÁRIO QUE FEZ O TRATAMENTO": usuario,
        inicio_atendimento,
        fim_atendimento,
      }) => {
        if (!dataTratamento) {
          dataTratamentoVaziasPorCanal[channelSlug]++;
          return;
        }

        if (dataFiltro.includes(dataTratamento.split(" ")[0])) {
          const inicio = new Date(inicio_atendimento?.replace(" ", "T"));
          const fim = new Date(fim_atendimento?.replace(" ", "T"));

          if (isNaN(inicio) || isNaN(fim)) return;

          const tmaOperador = (fim - inicio) / 60000;

          acc[usuario] ||= { totalTempo: 0, totalAtendimentos: 0 };
          acc[usuario].totalTempo += tmaOperador;
          acc[usuario].totalAtendimentos += 1;

          totalTempoGeral += tmaOperador;
          totalAtendimentosGeral += 1;

          atendimentosPorCanal[channelSlug].operadores[usuario] ||= {
            totalTempo: 0,
            totalAtendimentos: 0,
          };
          atendimentosPorCanal[channelSlug].operadores[usuario].totalTempo +=
            tmaOperador;
          atendimentosPorCanal[channelSlug].operadores[
            usuario
          ].totalAtendimentos += 1;
          atendimentosPorCanal[channelSlug].totalTempo += tmaOperador;
          atendimentosPorCanal[channelSlug].totalAtendimentos += 1;
        }
      }
    );

    return acc;
  }, {});

  Object.values(tma).forEach(
    (user) =>
      (user.mediaTMA = user.totalAtendimentos
        ? user.totalTempo / user.totalAtendimentos
        : 0)
  );

  Object.values(atendimentosPorCanal).forEach(({ operadores }) =>
    Object.values(operadores).forEach(
      (user) =>
        (user.mediaTMA = user.totalAtendimentos
          ? user.totalTempo / user.totalAtendimentos
          : 0)
    )
  );

  return {
    tma,
    atendimentosPorCanal,
    mediaTMAGeral: totalAtendimentosGeral
      ? totalTempoGeral / totalAtendimentosGeral
      : 0,
    totalAtendimentosGeral,
    dataTratamentoVaziasPorCanal,
  };
};

module.exports = {
  calcularProdutividade,
};
