import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/temporada/activa
router.get('/activa', async (_req, res) => {
  try {
    const temporada = await prisma.temporada.findFirst({
      where: { activa: true },
    });
    res.json(temporada);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/temporada/tabla
router.get('/tabla', async (_req, res) => {
  try {
    const temporada = await prisma.temporada.findFirst({ where: { activa: true } });
    if (!temporada) return res.status(404).json({ error: 'No hay temporada activa' });

    const clubs = await prisma.club.findMany();
    const partidos = await prisma.partido.findMany({
      where: { temporadaId: temporada.id, jugado: true, tipo: 'liga' },
    });

    const tabla = clubs.map(club => {
      const pj = partidos.filter(p => p.clubLocalId === club.id || p.clubVisitanteId === club.id);
      let pg = 0, pe = 0, pp = 0, pf = 0, pc = 0, puntos = 0, bonusTry = 0, bonusDerrota = 0;

      for (const p of pj) {
        const esLocal = p.clubLocalId === club.id;
        const propios = esLocal ? p.puntosLocal : p.puntosVisitante;
        const contrarios = esLocal ? p.puntosVisitante : p.puntosLocal;
        const triesPropios = esLocal ? p.triesLocal : p.triesVisitante;
        const triesContrarios = esLocal ? p.triesVisitante : p.triesLocal;

        pf += propios;
        pc += contrarios;

        if (propios > contrarios) {
          pg++; puntos += 4;
        } else if (propios === contrarios) {
          pe++; puntos += 2;
        } else {
          pp++;
          if (contrarios - propios <= 7) { bonusDerrota++; puntos += 1; }
        }
        if (triesPropios >= 4) { bonusTry++; puntos += 1; }
      }

      return {
        club: { id: club.id, nombre: club.nombre, color1: club.color1, color2: club.color2 },
        pj: pj.length, pg, pe, pp,
        pf, pc, dif: pf - pc,
        bonusTry, bonusDerrota,
        puntos,
      };
    });

    tabla.sort((a, b) => b.puntos - a.puntos || b.dif - a.dif || b.pf - a.pf);
    res.json({ temporada, tabla });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/temporada/jornada/:num
router.get('/jornada/:num', async (req, res) => {
  try {
    const temporada = await prisma.temporada.findFirst({ where: { activa: true } });
    if (!temporada) return res.status(404).json({ error: 'No hay temporada activa' });

    const partidos = await prisma.partido.findMany({
      where: { temporadaId: temporada.id, jornada: parseInt(req.params.num) },
      include: {
        clubLocal: { select: { id: true, nombre: true, color1: true, color2: true } },
        clubVisitante: { select: { id: true, nombre: true, color1: true, color2: true } },
      },
      orderBy: { id: 'asc' },
    });
    res.json(partidos);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/temporada/jornadas
router.get('/jornadas', async (_req, res) => {
  try {
    const temporada = await prisma.temporada.findFirst({ where: { activa: true } });
    if (!temporada) return res.status(404).json({ error: 'No hay temporada activa' });

    const partidos = await prisma.partido.findMany({ where: { temporadaId: temporada.id, tipo: 'liga' } });
    const jornadas = [...new Set(partidos.map(p => p.jornada))].sort((a, b) => a - b);
    const resumen = jornadas.map(j => ({
      numero: j,
      total: partidos.filter(p => p.jornada === j).length,
      jugados: partidos.filter(p => p.jornada === j && p.jugado).length,
    }));
    res.json(resumen);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── COPA URBA ────────────────────────────────────────────────────────────────

async function calcularTabla(temporadaId) {
  const clubs = await prisma.club.findMany();
  const partidos = await prisma.partido.findMany({ where: { temporadaId, jugado: true, tipo: 'liga' } });
  const tabla = clubs.map(club => {
    const pj = partidos.filter(p => p.clubLocalId === club.id || p.clubVisitanteId === club.id);
    let puntos = 0, pg = 0, pe = 0, pp = 0, pf = 0, pc = 0;
    for (const p of pj) {
      const esLocal = p.clubLocalId === club.id;
      const propios = esLocal ? p.puntosLocal : p.puntosVisitante;
      const contrarios = esLocal ? p.puntosVisitante : p.puntosLocal;
      const tries = esLocal ? p.triesLocal : p.triesVisitante;
      pf += propios; pc += contrarios;
      if (propios > contrarios) { pg++; puntos += 4; }
      else if (propios === contrarios) { pe++; puntos += 2; }
      else { pp++; if (contrarios - propios <= 7) puntos += 1; }
      if (tries >= 4) puntos += 1;
    }
    return { clubId: club.id, nombre: club.nombre, color1: club.color1, puntos, pj: pj.length, pg, pe, pp, pf, pc, dif: pf - pc };
  });
  return tabla.sort((a, b) => b.puntos - a.puntos || b.dif - a.dif || b.pf - a.pf);
}

// GET /api/temporada/copa
router.get('/copa', async (_req, res) => {
  try {
    const temporada = await prisma.temporada.findFirst({ where: { activa: true } });
    if (!temporada) return res.status(404).json({ error: 'No hay temporada activa' });

    const partidos = await prisma.partido.findMany({
      where: { temporadaId: temporada.id, tipo: { not: 'liga' } },
      include: {
        clubLocal: { select: { id: true, nombre: true, color1: true, color2: true } },
        clubVisitante: { select: { id: true, nombre: true, color1: true, color2: true } },
      },
      orderBy: { id: 'asc' },
    });
    res.json({ temporada, partidos });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/temporada/copa/iniciar
router.post('/copa/iniciar', async (_req, res) => {
  try {
    const temporada = await prisma.temporada.findFirst({ where: { activa: true } });
    if (!temporada) return res.status(404).json({ error: 'No hay temporada activa' });

    const ligaPendientes = await prisma.partido.count({ where: { temporadaId: temporada.id, jugado: false, tipo: 'liga' } });
    if (ligaPendientes > 0) return res.status(400).json({ error: `Quedan ${ligaPendientes} partidos de liga sin jugar` });

    const copaExistente = await prisma.partido.count({ where: { temporadaId: temporada.id, tipo: { not: 'liga' } } });
    if (copaExistente > 0) return res.status(400).json({ error: 'La copa ya fue iniciada' });

    const tabla = await calcularTabla(temporada.id);
    if (tabla.length < 4) return res.status(400).json({ error: 'Se necesitan al menos 4 clubs' });

    const [p1, p2, p3, p4] = tabla;
    const [sf1, sf2] = await Promise.all([
      prisma.partido.create({ data: { temporadaId: temporada.id, clubLocalId: p1.clubId, clubVisitanteId: p4.clubId, jornada: 100, tipo: 'semifinal' } }),
      prisma.partido.create({ data: { temporadaId: temporada.id, clubLocalId: p2.clubId, clubVisitanteId: p3.clubId, jornada: 100, tipo: 'semifinal' } }),
    ]);

    res.json({ mensaje: 'Playoffs iniciados', semifinales: [sf1, sf2], clasificados: [p1, p2, p3, p4] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/temporada/copa/crear-final
router.post('/copa/crear-final', async (_req, res) => {
  try {
    const temporada = await prisma.temporada.findFirst({ where: { activa: true } });
    if (!temporada) return res.status(404).json({ error: 'No hay temporada activa' });

    const semis = await prisma.partido.findMany({ where: { temporadaId: temporada.id, tipo: 'semifinal' } });
    if (semis.length < 2) return res.status(400).json({ error: 'No hay semifinales creadas' });
    if (semis.some(s => !s.jugado)) return res.status(400).json({ error: 'Hay semifinales sin jugar' });

    const finalExistente = await prisma.partido.findFirst({ where: { temporadaId: temporada.id, tipo: 'final' } });
    if (finalExistente) return res.status(400).json({ error: 'La final ya fue creada' });

    const ganadores = semis.map(s =>
      (s.puntosLocal ?? 0) >= (s.puntosVisitante ?? 0) ? s.clubLocalId : s.clubVisitanteId
    );

    const final = await prisma.partido.create({
      data: { temporadaId: temporada.id, clubLocalId: ganadores[0], clubVisitanteId: ganadores[1], jornada: 101, tipo: 'final' },
      include: {
        clubLocal: { select: { id: true, nombre: true, color1: true } },
        clubVisitante: { select: { id: true, nombre: true, color1: true } },
      },
    });

    res.json({ mensaje: '¡Final creada!', final });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── D: TRANSFERENCIAS IA EN PRETEMPORADA ─────────────────────────────────────
async function realizarTransferenciasIA(clubs) {
  const ATTRS = ['scrum','lineout','tackle','velocidad','pase','pie','vision','potencia','motor','liderazgo'];
  const calcOvr = j => Math.round(ATTRS.reduce((s, a) => s + j[a], 0) / ATTRS.length);

  // Cada club libera 2-3 de sus peores jugadores al mercado libre
  for (const club of clubs) {
    const jugadores = await prisma.jugador.findMany({
      where: { clubId: club.id },
      orderBy: { valor: 'asc' },
    });
    const cantLiberar = Math.floor(Math.random() * 2) + 2;
    for (const j of jugadores.slice(0, cantLiberar)) {
      await prisma.jugador.update({ where: { id: j.id }, data: { clubId: null, enVenta: false } });
    }
  }

  // Cada club intenta fichar 1-2 agentes libres
  const libres = await prisma.jugador.findMany({ where: { clubId: null } });
  const pool = [...libres].sort(() => Math.random() - 0.5);

  for (const club of clubs) {
    const clubData = await prisma.club.findUnique({ where: { id: club.id } });
    const cantFichar = Math.floor(Math.random() * 2) + 1;
    let fichados = 0;
    for (const j of pool) {
      if (fichados >= cantFichar) break;
      if (j.clubId !== null) continue;
      if (clubData.presupuesto < j.valor * 0.4) continue;
      await prisma.jugador.update({ where: { id: j.id }, data: { clubId: club.id } });
      await prisma.club.update({ where: { id: club.id }, data: { presupuesto: { decrement: Math.round(j.valor * 0.3) } } });
      j.clubId = club.id;
      fichados++;
    }
  }
}

// POST /api/temporada/finalizar
router.post('/finalizar', async (_req, res) => {
  try {
    const temporadaActual = await prisma.temporada.findFirst({ where: { activa: true } });
    if (!temporadaActual) return res.status(404).json({ error: 'No hay temporada activa' });

    const pendientes = await prisma.partido.count({ where: { temporadaId: temporadaActual.id, jugado: false } });
    if (pendientes > 0) return res.status(400).json({ error: `Quedan ${pendientes} partidos sin jugar (incluída la Copa)` });

    // Desactivar temporada actual
    await prisma.temporada.update({ where: { id: temporadaActual.id }, data: { activa: false } });

    // Envejecer jugadores y retirar mayores de 38
    const jugadores = await prisma.jugador.findMany();
    for (const j of jugadores) {
      if (j.edad >= 38) {
        await prisma.jugador.update({ where: { id: j.id }, data: { clubId: null } });
      } else {
        const decaimiento = j.edad >= 32 ? { motor: Math.max(j.motor - 1, 40), velocidad: Math.max(j.velocidad - 1, 40) } : {};
        await prisma.jugador.update({ where: { id: j.id }, data: { edad: j.edad + 1, moral: 75, lesionadoHasta: null, convocadoHasta: null, ...decaimiento } });
      }
    }

    // Generar juveniles para cada club
    const clubs = await prisma.club.findMany();
    const POSICIONES_JUVENILES = ['Pilar Izq','Hooker','Pilar Der','Segunda Línea','Ala','Medio Scrum','Apertura','Wing','Centro','Fullback'];
    for (const club of clubs) {
      const cantidad = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < cantidad; i++) {
        const pos = POSICIONES_JUVENILES[Math.floor(Math.random() * POSICIONES_JUVENILES.length)];
        const base = Math.floor(Math.random() * 15) + 55;
        await prisma.jugador.create({
          data: {
            nombre: ['Agustín','Tomás','Facundo','Santiago','Matías','Lucas','Ignacio','Nicolás'][Math.floor(Math.random()*8)],
            apellido: ['García','López','Rodríguez','Fernández','Martínez','González','Pérez','Díaz'][Math.floor(Math.random()*8)],
            edad: Math.floor(Math.random() * 3) + 18,
            posicion: pos,
            scrum: Math.min(base + Math.floor(Math.random()*10), 99),
            lineout: Math.min(base + Math.floor(Math.random()*10), 99),
            tackle: Math.min(base + Math.floor(Math.random()*10), 99),
            velocidad: Math.min(base + Math.floor(Math.random()*10), 99),
            pase: Math.min(base + Math.floor(Math.random()*10), 99),
            pie: Math.min(base + Math.floor(Math.random()*10), 99),
            vision: Math.min(base + Math.floor(Math.random()*10), 99),
            potencia: Math.min(base + Math.floor(Math.random()*10), 99),
            motor: Math.min(base + Math.floor(Math.random()*10), 99),
            liderazgo: Math.min(base + Math.floor(Math.random()*10), 99),
            valor: base * 5000,
            moral: 80,
            clubId: club.id,
          },
        });
      }
    }

    // D: Transferencias IA en pretemporada
    await realizarTransferenciasIA(clubs);

    // Nueva temporada con fixture
    const nuevaTemporada = await prisma.temporada.create({
      data: { nombre: `Super Rugby Americas ${temporadaActual.anio + 1}`, anio: temporadaActual.anio + 1, activa: true },
    });

    const ids = clubs.map(c => c.id);
    const n = ids.length;
    const fixed = ids[n - 1];
    const rotating = ids.slice(0, n - 1);
    for (let r = 0; r < n - 1; r++) {
      const current = [rotating[r % (n-1)], ...rotating.slice((r+1)%(n-1)).concat(rotating.slice(0,r%(n-1)))];
      const ronda = [[current[0], fixed], ...Array.from({length: n/2 - 1}, (_, i) => [current[i+1], current[n-1-i-1]])];
      for (const [localId, visitanteId] of ronda) {
        await prisma.partido.create({
          data: { temporadaId: nuevaTemporada.id, clubLocalId: localId, clubVisitanteId: visitanteId, jornada: r + 1 },
        });
      }
    }

    res.json({ mensaje: `Temporada ${nuevaTemporada.nombre} iniciada`, temporada: nuevaTemporada });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
