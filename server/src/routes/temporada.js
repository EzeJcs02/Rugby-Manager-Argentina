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
      where: { temporadaId: temporada.id, jugado: true },
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

    const partidos = await prisma.partido.findMany({ where: { temporadaId: temporada.id } });
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

// POST /api/temporada/finalizar
router.post('/finalizar', async (_req, res) => {
  try {
    const temporadaActual = await prisma.temporada.findFirst({ where: { activa: true } });
    if (!temporadaActual) return res.status(404).json({ error: 'No hay temporada activa' });

    const pendientes = await prisma.partido.count({
      where: { temporadaId: temporadaActual.id, jugado: false },
    });
    if (pendientes > 0) {
      return res.status(400).json({ error: `Quedan ${pendientes} partidos sin jugar` });
    }

    // Desactivar temporada actual
    await prisma.temporada.update({ where: { id: temporadaActual.id }, data: { activa: false } });

    // Envejecer jugadores y retirar mayores de 38
    const jugadores = await prisma.jugador.findMany();
    for (const j of jugadores) {
      if (j.edad >= 38) {
        await prisma.jugador.update({ where: { id: j.id }, data: { clubId: null } });
      } else {
        const decaimiento = j.edad >= 32 ? { motor: Math.max(j.motor - 1, 40), velocidad: Math.max(j.velocidad - 1, 40) } : {};
        await prisma.jugador.update({ where: { id: j.id }, data: { edad: j.edad + 1, moral: 75, lesionadoHasta: null, ...decaimiento } });
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

    // Nueva temporada con fixture
    const nuevaTemporada = await prisma.temporada.create({
      data: { nombre: `Torneo de la URBA ${temporadaActual.anio + 1}`, anio: temporadaActual.anio + 1, activa: true },
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
