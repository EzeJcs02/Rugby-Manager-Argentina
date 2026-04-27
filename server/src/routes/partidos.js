import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { simularPartido, simularPartidoConFormacion, calcularPuntosTabla } from '../simulation/engine.js';

const router = Router();
const prisma = new PrismaClient();

// POST /api/partidos/:id/simular
router.post('/:id/simular', async (req, res) => {
  try {
    const partido = await prisma.partido.findUniqueOrThrow({
      where: { id: parseInt(req.params.id) },
    });

    if (partido.jugado) {
      return res.status(400).json({ error: 'El partido ya fue jugado' });
    }

    const [jugadoresLocal, jugadoresVisitante, formLocal, formVisitante] = await Promise.all([
      prisma.jugador.findMany({ where: { clubId: partido.clubLocalId } }),
      prisma.jugador.findMany({ where: { clubId: partido.clubVisitanteId } }),
      prisma.formacion.findUnique({ where: { clubId: partido.clubLocalId } }),
      prisma.formacion.findUnique({ where: { clubId: partido.clubVisitanteId } }),
    ]);

    const resultado = simularPartidoConFormacion(jugadoresLocal, jugadoresVisitante, formLocal ?? {}, formVisitante ?? {});

    await prisma.partido.update({
      where: { id: partido.id },
      data: {
        jugado: true,
        puntosLocal: resultado.puntosLocal,
        puntosVisitante: resultado.puntosVisitante,
        triesLocal: resultado.triesLocal,
        triesVisitante: resultado.triesVisitante,
        eventos: resultado.eventos,
      },
    });

    const partidoActualizado = await prisma.partido.findUnique({
      where: { id: partido.id },
      include: {
        clubLocal: { select: { id: true, nombre: true, color1: true } },
        clubVisitante: { select: { id: true, nombre: true, color1: true } },
      },
    });

    res.json({ ...partidoActualizado, eventos: resultado.eventos });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/partidos/jornada/:num/simular  — simula toda la jornada
router.post('/jornada/:num/simular', async (req, res) => {
  try {
    const temporada = await prisma.temporada.findFirst({ where: { activa: true } });
    if (!temporada) return res.status(404).json({ error: 'No hay temporada activa' });

    const partidos = await prisma.partido.findMany({
      where: { temporadaId: temporada.id, jornada: parseInt(req.params.num), jugado: false },
    });

    if (partidos.length === 0) {
      return res.status(400).json({ error: 'Todos los partidos de esta jornada ya fueron jugados' });
    }

    const resultados = [];

    for (const partido of partidos) {
      const [jugadoresLocal, jugadoresVisitante, formLocal, formVisitante] = await Promise.all([
        prisma.jugador.findMany({ where: { clubId: partido.clubLocalId } }),
        prisma.jugador.findMany({ where: { clubId: partido.clubVisitanteId } }),
        prisma.formacion.findUnique({ where: { clubId: partido.clubLocalId } }),
        prisma.formacion.findUnique({ where: { clubId: partido.clubVisitanteId } }),
      ]);

      const resultado = simularPartidoConFormacion(jugadoresLocal, jugadoresVisitante, formLocal ?? {}, formVisitante ?? {});

      const actualizado = await prisma.partido.update({
        where: { id: partido.id },
        data: {
          jugado: true,
          puntosLocal: resultado.puntosLocal,
          puntosVisitante: resultado.puntosVisitante,
          triesLocal: resultado.triesLocal,
          triesVisitante: resultado.triesVisitante,
          eventos: resultado.eventos,
        },
        include: {
          clubLocal: { select: { id: true, nombre: true, color1: true } },
          clubVisitante: { select: { id: true, nombre: true, color1: true } },
        },
      });

      resultados.push({ ...actualizado, eventos: resultado.eventos });
    }

    res.json(resultados);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
