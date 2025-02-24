const calcularProdutividade = (req, res) => {
  const { excelData, users } = req.body;

  if (!excelData || !users) {
    return res.status(400).json({ error: "Dados insuficientes" });
  }

  const currentDate = new Date().toISOString().split("T")[0];
  const productivityData = contarUsuarios(excelData, [currentDate]);
  const TMA = getTMA(excelData, [currentDate]);

  const usuariosTurnoTabela = users.reduce((acc, usuario) => {
    acc[usuario.name] = {
      shift: usuario.shift,
      channel: usuario.channel,
      entrada: usuario.shift.split("-")[1],
    };
    return acc;
  }, {});

  const usuariosInfo = Object.keys(productivityData).reduce((acc, usuario) => {
    const now = new Date();
    const currentHour = now.getHours();
    console.log("HORA ATUAL - ", currentHour);

    const entrada = usuariosTurnoTabela[usuario]?.entrada || "08:00";
    const [horas] = entrada.split(":").map(Number);
    let horasTrabalhadas = currentHour - horas;

    if (horasTrabalhadas > 6) horasTrabalhadas = 6;

    const channel = usuariosTurnoTabela[usuario]?.channel || "Desconhecido";

    let meta = 11.66;

    if (channel === "Treinamento") {
      meta = 0;
    } else if (channel === "Meli Mensageria") {
      meta = 16.66;
    } else if (["Meli Reclamação", "Meli Mediação"].includes(channel)) {
      meta = 14.2;
    }

    const metaTotal = Math.floor(meta * horasTrabalhadas);
    const porcentagem =
      metaTotal > 0
        ? ((productivityData[usuario] / metaTotal) * 100).toFixed(0)
        : "-";

    acc[usuario] = {
      produtividade: productivityData[usuario] || 0,
      tma: TMA[usuario]?.mediaTMA || 0,
      turno: usuariosTurnoTabela[usuario]?.shift || "Desconhecido",
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

  // Ordenando os usuários por turno
  const usuariosOrdenadosPorTurno = Object.fromEntries(
    Object.entries(usuariosOrdenados).sort(([, a], [, b]) =>
      a.turno.localeCompare(b.turno)
    )
  );

  return res.json(usuariosOrdenadosPorTurno);
};

// Funções auxiliares
const contarUsuarios = (arquivos, dataFiltro) => {
  const contador = {};
  for (const arquivo of arquivos) {
    for (const item of arquivo.data) {
      let dataTratamento = item["DATA DE TRATAMENTO"]?.split(" ")[0];
      if (dataFiltro.includes(dataTratamento)) {
        const usuario = item["USUÁRIO QUE FEZ O TRATAMENTO"];
        contador[usuario] = (contador[usuario] || 0) + 1;
      }
    }
  }
  return contador;
};

const getTMA = (arquivos, dataFiltro) => {
  const tma = {};

  for (const arquivo of arquivos) {
    for (const item of arquivo.data) {
      let dataTratamento = item["DATA DE TRATAMENTO"]?.split(" ")[0];

      if (dataFiltro.includes(dataTratamento)) {
        const usuario = item["USUÁRIO QUE FEZ O TRATAMENTO"];
        const inicioStr = item["inicio_atendimento"]?.replace(" ", "T");
        const fimStr = item["fim_atendimento"]?.replace(" ", "T");

        if (!inicioStr || !fimStr) continue; // Pula registros inválidos

        const inicio = new Date(inicioStr);
        const fim = new Date(fimStr);

        if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) continue; // Evita valores inválidos

        const tmaOperador = (fim - inicio) / 1000 / 60; // Converte milissegundos para minutos

        if (!tma[usuario]) {
          tma[usuario] = { totalTempo: 0, totalAtendimentos: 0 };
        }

        tma[usuario].totalTempo += tmaOperador;
        tma[usuario].totalAtendimentos += 1;
      }
    }
  }

  for (const usuario in tma) {
    tma[usuario].mediaTMA =
      tma[usuario].totalAtendimentos > 0
        ? tma[usuario].totalTempo / tma[usuario].totalAtendimentos
        : 0; // Garante que não há divisão por zero
  }

  return tma;
};

module.exports = { calcularProdutividade };
