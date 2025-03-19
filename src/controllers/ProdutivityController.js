const fileService = require('../services/fileService');

const calcularProdutividade = async (req, res) => {
  const { excelData, users } = req.body;

  if (!excelData || !users) {
    return res.status(400).json({ error: 'Dados insuficientes' });
  }

  const currentDate = new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Sao_Paulo',
  });

  const productivityData = contarUsuarios(excelData, [currentDate]);
  const TMA = await getTMA(excelData, [currentDate]);

  const usuariosTurnoTabela = users.reduce((acc, usuario) => {
    acc[usuario.name] = {
      shift: usuario.shift,
      channel: usuario.channel,
      entrada: usuario.shift.split('-')[1],
    };

    return acc;
  }, {});

  const usuariosInfo = Object.keys(productivityData).reduce((acc, usuario) => {
    const now = new Date();
    let currentHour = now.getUTCHours() - 3; // Ajusta para GMT-3
    if (currentHour < 0) currentHour += 24; // Correção para valores negativos
    const entrada = usuariosTurnoTabela[usuario]?.entrada || '08:00';
    const [horas] = entrada.split(':').map(Number);
    let horasTrabalhadas = currentHour - horas;

    if (horasTrabalhadas > 6) horasTrabalhadas = 6;

    const channel = usuariosTurnoTabela[usuario]?.channel || 'Desconhecido';

    let meta = 13.33;
    if (channel === 'Treinamento') {
      meta = 0;
    } else if (channel === 'Meli Mensageria') {
      meta = 16.66;
    } else if (['Meli Reclamação', 'Meli Mediação'].includes(channel)) {
      meta = 14.2;
    } else if (channel === 'Liderança') {
      meta = 14.2;
    }
    const metaTotal = Math.round(meta * horasTrabalhadas);
    const porcentagem =
      metaTotal > 0
        ? ((productivityData[usuario] / metaTotal) * 100).toFixed(0)
        : '-';

    acc[usuario] = {
      produtividade: productivityData[usuario] || 0,
      tma: TMA.tma[usuario]?.mediaTMA || 0,
      turno: usuariosTurnoTabela[usuario]?.shift || 'Desconhecido',
      channel: channel,
      meta: metaTotal,
      porcentagem: porcentagem,
    };

    return acc;
  }, {});

  // Ordenando os usuários por produtividade (maior para menor)
  const usuariosOrdenados = Object.entries(usuariosInfo)
    .sort(([, a], [, b]) => b.produtividade - a.produtividade)
    .reduce((obj, [chave, valor]) => {
      obj[chave] = valor;
      return obj;
    }, {});

  const metaTotalGeral = Object.values(usuariosInfo).reduce(
    (acc, usuario) => acc + usuario.meta,
    0
  );

  const usuariosOrdenadosPorTurno = Object.fromEntries(
    Object.entries(usuariosOrdenados).sort(([, a], [, b]) =>
      a.turno.localeCompare(b.turno)
    )
  );

  const response = {
    usuariosOrdenadosPorTurno,
    totalAtendimentosGeral: TMA.totalAtendimentosGeral,
    mediaTMAGeral: TMA.mediaTMAGeral,
    atendimentosPorCanal: TMA.atendimentosPorCanal,
    metaTotalGeral: metaTotalGeral,
    dataTratamentoVaziasPorCanal: TMA.dataTratamentoVaziasPorCanal,
  };

  return res.json(response);
};

// Funções auxiliares
const contarUsuarios = (arquivos, dataFiltro) => {
  const contador = {};
  for (const arquivo of arquivos) {
    for (const item of arquivo.data) {
      let dataTratamento = item['DATA DE TRATAMENTO']?.split(' ')[0];
      if (dataFiltro.includes(dataTratamento)) {
        const usuario = item['USUÁRIO QUE FEZ O TRATAMENTO'];
        contador[usuario] = (contador[usuario] || 0) + 1;
      }
    }
  }
  return contador;
};

const getTMA = async (arquivos, dataFiltro) => {
  const files = await fileService.getFiles();
  const filenameToChannel = new Map(
    files.map(item => [item.filename, item.channel_slug])
  );

  const tma = {};
  let totalTempoGeral = 0;
  let totalAtendimentosGeral = 0;
  let atendimentosPorCanal = {};
  let dataTratamentoVaziasPorCanal = {}; // Novo objeto para contar os vazios

  for (const arquivo of arquivos) {
    const channelSlug =
      filenameToChannel.get(arquivo.fileName) || 'desconhecido';

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
      let dataTratamento = item['DATA DE TRATAMENTO']?.split(' ')[0];

      // Contagem de "DATA DE TRATAMENTO" vazias por canal
      if (!dataTratamento) {
        dataTratamentoVaziasPorCanal[channelSlug]++;
        continue; // Pula este item, pois não tem data de tratamento
      }

      if (dataFiltro.includes(dataTratamento)) {
        const usuario = item['USUÁRIO QUE FEZ O TRATAMENTO'];
        const inicioStr = item['inicio_atendimento']?.replace(' ', 'T');
        const fimStr = item['fim_atendimento']?.replace(' ', 'T');

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
    dataTratamentoVaziasPorCanal,
  };
};

module.exports = {
  calcularProdutividade,
};
