// Ponderación de atributos por grupo posicional
const PESOS_POSICION = {
  'Pilar Izq':      { scrum: 0.30, lineout: 0.10, tackle: 0.20, velocidad: 0.05, pase: 0.05, pie: 0.03, vision: 0.05, potencia: 0.25, motor: 0.15, liderazgo: 0.07, grupo: 'delantera' },
  'Hooker':         { scrum: 0.22, lineout: 0.28, tackle: 0.18, velocidad: 0.05, pase: 0.07, pie: 0.03, vision: 0.05, potencia: 0.20, motor: 0.18, liderazgo: 0.08, grupo: 'delantera' },
  'Pilar Der':      { scrum: 0.32, lineout: 0.10, tackle: 0.20, velocidad: 0.04, pase: 0.05, pie: 0.03, vision: 0.04, potencia: 0.28, motor: 0.14, liderazgo: 0.06, grupo: 'delantera' },
  'Segunda Línea':  { scrum: 0.15, lineout: 0.28, tackle: 0.18, velocidad: 0.06, pase: 0.05, pie: 0.04, vision: 0.06, potencia: 0.24, motor: 0.22, liderazgo: 0.08, grupo: 'delantera' },
  'Ala':            { scrum: 0.10, lineout: 0.12, tackle: 0.28, velocidad: 0.12, pase: 0.08, pie: 0.05, vision: 0.08, potencia: 0.20, motor: 0.28, liderazgo: 0.08, grupo: 'delantera' },
  'Octavo':         { scrum: 0.10, lineout: 0.10, tackle: 0.25, velocidad: 0.13, pase: 0.10, pie: 0.06, vision: 0.10, potencia: 0.22, motor: 0.26, liderazgo: 0.10, grupo: 'delantera' },
  'Medio Scrum':    { scrum: 0.05, lineout: 0.04, tackle: 0.10, velocidad: 0.18, pase: 0.30, pie: 0.12, vision: 0.28, potencia: 0.06, motor: 0.14, liderazgo: 0.12, grupo: 'trasera' },
  'Apertura':       { scrum: 0.04, lineout: 0.04, tackle: 0.08, velocidad: 0.13, pase: 0.28, pie: 0.28, vision: 0.28, potencia: 0.05, motor: 0.10, liderazgo: 0.18, grupo: 'trasera' },
  'Wing':           { scrum: 0.03, lineout: 0.03, tackle: 0.12, velocidad: 0.34, pase: 0.10, pie: 0.12, vision: 0.12, potencia: 0.08, motor: 0.10, liderazgo: 0.06, grupo: 'trasera' },
  'Centro':         { scrum: 0.04, lineout: 0.04, tackle: 0.22, velocidad: 0.22, pase: 0.18, pie: 0.08, vision: 0.16, potencia: 0.14, motor: 0.14, liderazgo: 0.08, grupo: 'trasera' },
  'Fullback':       { scrum: 0.03, lineout: 0.03, tackle: 0.14, velocidad: 0.24, pase: 0.12, pie: 0.26, vision: 0.24, potencia: 0.08, motor: 0.12, liderazgo: 0.08, grupo: 'trasera' },
};

function calcularPuntajeJugador(jugador) {
  const pesos = PESOS_POSICION[jugador.posicion];
  if (!pesos) return 60;
  const attrs = ['scrum','lineout','tackle','velocidad','pase','pie','vision','potencia','motor','liderazgo'];
  return attrs.reduce((sum, attr) => sum + jugador[attr] * pesos[attr], 0);
}

// Selecciona el mejor jugador disponible para cada número de camiseta
function seleccionarTitulares(jugadores) {
  const mapa = {
    1: 'Pilar Izq', 2: 'Hooker', 3: 'Pilar Der',
    4: 'Segunda Línea', 5: 'Segunda Línea',
    6: 'Ala', 7: 'Ala', 8: 'Octavo',
    9: 'Medio Scrum', 10: 'Apertura',
    11: 'Wing', 12: 'Centro', 13: 'Centro',
    14: 'Wing', 15: 'Fullback',
  };

  const usados = new Set();
  const titulares = [];

  for (const [num, pos] of Object.entries(mapa)) {
    const candidatos = jugadores
      .filter(j => j.posicion === pos && !usados.has(j.id))
      .sort((a, b) => calcularPuntajeJugador(b) - calcularPuntajeJugador(a));

    if (candidatos.length > 0) {
      usados.add(candidatos[0].id);
      titulares.push({ ...candidatos[0], numeroTitular: parseInt(num) });
    }
  }
  return titulares;
}

function calcularFuerzaEquipo(jugadores) {
  const titulares = seleccionarTitulares(jugadores);
  const moralProm = jugadores.reduce((s, j) => s + j.moral, 0) / jugadores.length;
  const bonusMoral = (moralProm - 75) * 0.005; // ±5% según moral

  let ataque = 0;
  let defensa = 0;

  for (const j of titulares) {
    const score = calcularPuntajeJugador(j);
    const grupo = PESOS_POSICION[j.posicion]?.grupo ?? 'trasera';
    if (grupo === 'delantera') {
      ataque += score * 0.40;
      defensa += score * 0.60;
    } else {
      ataque += score * 0.65;
      defensa += score * 0.35;
    }
  }

  const norm = titulares.length || 15;
  return {
    ataque: (ataque / norm) * (1 + bonusMoral),
    defensa: (defensa / norm) * (1 + bonusMoral),
    titulares,
  };
}

function simularPeriodo(ataqueA, defensaB) {
  const prob = (ataqueA / (ataqueA + defensaB)) * 0.28;
  if (Math.random() > prob) return null;

  const r = Math.random();
  if (r < 0.55) {
    // Try + posible conversión
    const conversion = Math.random() < 0.72;
    return { tipo: 'try', puntos: conversion ? 7 : 5, tries: 1 };
  } else if (r < 0.90) {
    return { tipo: 'penal', puntos: 3, tries: 0 };
  } else {
    return { tipo: 'drop', puntos: 3, tries: 0 };
  }
}

const TACTICAS = {
  ataque:  { ataqueMulti: 1.10, defensaMulti: 0.93 },
  neutro:  { ataqueMulti: 1.00, defensaMulti: 1.00 },
  defensa: { ataqueMulti: 0.93, defensaMulti: 1.10 },
};

function seleccionarTitularesConFormacion(jugadores, datosFormacion) {
  // datosFormacion: { "1": jugadorId, "9": jugadorId, ... }
  const mapa = {
    1: 'Pilar Izq', 2: 'Hooker', 3: 'Pilar Der',
    4: 'Segunda Línea', 5: 'Segunda Línea',
    6: 'Ala', 7: 'Ala', 8: 'Octavo',
    9: 'Medio Scrum', 10: 'Apertura',
    11: 'Wing', 12: 'Centro', 13: 'Centro',
    14: 'Wing', 15: 'Fullback',
  };

  const jugadoresMap = Object.fromEntries(jugadores.map(j => [j.id, j]));
  const usados = new Set();
  const titulares = [];

  for (const [num, pos] of Object.entries(mapa)) {
    const numInt = parseInt(num);
    const jugadorIdAsignado = datosFormacion?.[num] ?? datosFormacion?.[numInt];
    let elegido = null;

    if (jugadorIdAsignado && jugadoresMap[jugadorIdAsignado] && !usados.has(jugadorIdAsignado)) {
      elegido = jugadoresMap[jugadorIdAsignado];
    } else {
      const candidatos = jugadores
        .filter(j => j.posicion === pos && !usados.has(j.id))
        .sort((a, b) => calcularPuntajeJugador(b) - calcularPuntajeJugador(a));
      elegido = candidatos[0] ?? null;
    }

    if (elegido) {
      usados.add(elegido.id);
      titulares.push({ ...elegido, numeroTitular: numInt });
    }
  }
  return titulares;
}

function calcularFuerzaEquipoConFormacion(jugadores, datosFormacion, tactica = 'neutro') {
  const titulares = seleccionarTitularesConFormacion(jugadores, datosFormacion);
  const moralProm = jugadores.length ? jugadores.reduce((s, j) => s + j.moral, 0) / jugadores.length : 75;
  const bonusMoral = (moralProm - 75) * 0.005;
  const mult = TACTICAS[tactica] ?? TACTICAS.neutro;

  let ataque = 0;
  let defensa = 0;

  for (const j of titulares) {
    const score = calcularPuntajeJugador(j);
    const grupo = PESOS_POSICION[j.posicion]?.grupo ?? 'trasera';
    if (grupo === 'delantera') {
      ataque += score * 0.40;
      defensa += score * 0.60;
    } else {
      ataque += score * 0.65;
      defensa += score * 0.35;
    }
  }

  const norm = titulares.length || 15;
  return {
    ataque: (ataque / norm) * (1 + bonusMoral) * mult.ataqueMulti,
    defensa: (defensa / norm) * (1 + bonusMoral) * mult.defensaMulti,
    titulares,
  };
}

export function simularPartidoConFormacion(jugadoresLocal, jugadoresVisitante, formacionLocal = {}, formacionVisitante = {}) {
  const tacticaLocal = formacionLocal.tactica ?? 'neutro';
  const tacticaVisitante = formacionVisitante.tactica ?? 'neutro';
  const local = calcularFuerzaEquipoConFormacion(jugadoresLocal, formacionLocal.datos, tacticaLocal);
  const visitante = calcularFuerzaEquipoConFormacion(jugadoresVisitante, formacionVisitante.datos, tacticaVisitante);

  const VENTAJA_LOCAL = 1.06;
  const ataqueLocal = local.ataque * VENTAJA_LOCAL;
  const defensaLocal = local.defensa * VENTAJA_LOCAL;

  let puntosLocal = 0;
  let puntosVisitante = 0;
  let triesLocal = 0;
  let triesVisitante = 0;
  const eventos = [];

  for (let minuto = 5; minuto <= 80; minuto += 5) {
    const evLocal = simularPeriodo(ataqueLocal, visitante.defensa);
    if (evLocal) {
      puntosLocal += evLocal.puntos;
      triesLocal += evLocal.tries;
      eventos.push({ minuto, equipo: 'local', ...evLocal });
    }
    const evVisitante = simularPeriodo(visitante.ataque, defensaLocal);
    if (evVisitante) {
      puntosVisitante += evVisitante.puntos;
      triesVisitante += evVisitante.tries;
      eventos.push({ minuto, equipo: 'visitante', ...evVisitante });
    }
  }

  return { puntosLocal, puntosVisitante, triesLocal, triesVisitante, eventos, fuerzaLocal: Math.round(local.ataque), fuerzaVisitante: Math.round(visitante.ataque) };
}

export function simularPartido(jugadoresLocal, jugadoresVisitante) {
  const local = calcularFuerzaEquipo(jugadoresLocal);
  const visitante = calcularFuerzaEquipo(jugadoresVisitante);

  const VENTAJA_LOCAL = 1.06;
  const ataqueLocal = local.ataque * VENTAJA_LOCAL;
  const defensaLocal = local.defensa * VENTAJA_LOCAL;

  let puntosLocal = 0;
  let puntosVisitante = 0;
  let triesLocal = 0;
  let triesVisitante = 0;
  const eventos = [];

  // 16 intervalos de 5 minutos = 80 minutos
  for (let minuto = 5; minuto <= 80; minuto += 5) {
    const evLocal = simularPeriodo(ataqueLocal, visitante.defensa);
    if (evLocal) {
      puntosLocal += evLocal.puntos;
      triesLocal += evLocal.tries;
      eventos.push({ minuto, equipo: 'local', ...evLocal });
    }

    const evVisitante = simularPeriodo(visitante.ataque, defensaLocal);
    if (evVisitante) {
      puntosVisitante += evVisitante.puntos;
      triesVisitante += evVisitante.tries;
      eventos.push({ minuto, equipo: 'visitante', ...evVisitante });
    }
  }

  return {
    puntosLocal,
    puntosVisitante,
    triesLocal,
    triesVisitante,
    eventos,
    fuerzaLocal: Math.round(local.ataque),
    fuerzaVisitante: Math.round(visitante.ataque),
  };
}

// Calcula puntos de tabla (sistema URBA/World Rugby)
export function calcularPuntosTabla(partido) {
  const { puntosLocal, puntosVisitante, triesLocal, triesVisitante } = partido;
  let ptosLocal = 0;
  let ptosVisitante = 0;

  if (puntosLocal > puntosVisitante) {
    ptosLocal = 4;
  } else if (puntosLocal === puntosVisitante) {
    ptosLocal = 2;
    ptosVisitante = 2;
  } else {
    ptosVisitante = 4;
    // Losing bonus: perder por 7 o menos
    if (puntosVisitante - puntosLocal <= 7) ptosLocal += 1;
  }

  // Try bonus: 4 o más tries
  if (triesLocal >= 4) ptosLocal += 1;
  if (triesVisitante >= 4) ptosVisitante += 1;

  return { ptosLocal, ptosVisitante };
}
