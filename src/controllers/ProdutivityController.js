const getTMA = async (arquivos, dataFiltro) => {
  const files = await fileService.getFiles();
  const filenameToChannel = new Map(
    files.map((item) => [item.filename, item.channel_slug])
  );

  const tma = {};
  let totalTempoGeral = 0;
  let totalAtendimentosGeral = 0;
  let atendimentosPorCanal = {};
  let dataTratamentoVaziasPorCanal = {}; // Novo objeto para contar os vazios

  for (const arquivo of arquivos) {
    const channelSlug =
      filenameToChannel.get(arquivo.fileName) || "desconhecido";

    if (!atendimentosPorCanal[channelSlug]) {
      atendimentosPorCanal[channelSlug] = {
        totalTempo: 0,
        totalAtendimentos: 0,
        operadores: {},
      };
    }

    if (!dataTratamentoVaziasPorCanal[channelSlug]) {
      dataTratamentoVaziasPorCanal[channelSlug] = 0;
    }

    for (const item of arquivo.data) {
      let dataTratamento = item["DATA DE TRATAMENTO"]?.split(" ")[0];

      // Contagem de "DATA DE TRATAMENTO" vazias por canal
      if (!dataTratamento) {
        dataTratamentoVaziasPorCanal[channelSlug]++;
        continue; // Pula este item, pois não tem data de tratamento
      }

      if (dataFiltro.includes(dataTratamento)) {
        const usuario = item["USUÁRIO QUE FEZ O TRATAMENTO"];
        const inicioStr = item["inicio_atendimento"]?.replace(" ", "T");
        const fimStr = item["fim_atendimento"]?.replace(" ", "T");

        if (!inicioStr || !fimStr) continue;

        const inicio = new Date(inicioStr);
        const fim = new Date(fimStr);

        if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) continue;

        const tmaOperador = (fim - inicio) / 1000 / 60;

        if (!tma[usuario]) {
          tma[usuario] = { totalTempo: 0, totalAtendimentos: 0 };
        }

        tma[usuario].totalTempo += tmaOperador;
        tma[usuario].totalAtendimentos += 1;

        totalTempoGeral += tmaOperador;
        totalAtendimentosGeral += 1;

        if (!atendimentosPorCanal[channelSlug].operadores[usuario]) {
          atendimentosPorCanal[channelSlug].operadores[usuario] = {
            totalTempo: 0,
            totalAtendimentos: 0,
          };
        }

        atendimentosPorCanal[channelSlug].operadores[usuario].totalTempo +=
          tmaOperador;
        atendimentosPorCanal[channelSlug].operadores[
          usuario
        ].totalAtendimentos += 1;

        atendimentosPorCanal[channelSlug].totalTempo += tmaOperador;
        atendimentosPorCanal[channelSlug].totalAtendimentos += 1;
      }
    }
  }

  for (const usuario in tma) {
    tma[usuario].mediaTMA =
      tma[usuario].totalAtendimentos > 0
        ? tma[usuario].totalTempo / tma[usuario].totalAtendimentos
        : 0;
  }

  for (const canal in atendimentosPorCanal) {
    for (const usuario in atendimentosPorCanal[canal].operadores) {
      const operador = atendimentosPorCanal[canal].operadores[usuario];
      operador.mediaTMA =
        operador.totalAtendimentos > 0
          ? operador.totalTempo / operador.totalAtendimentos
          : 0;
    }
  }

  return {
    tma,
    atendimentosPorCanal,
    mediaTMAGeral: totalTempoGeral / totalAtendimentosGeral,
    totalAtendimentosGeral,
    dataTratamentoVaziasPorCanal, // Adicionando o novo objeto ao retorno
  };
};
