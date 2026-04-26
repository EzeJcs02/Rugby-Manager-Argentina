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

export default router;
