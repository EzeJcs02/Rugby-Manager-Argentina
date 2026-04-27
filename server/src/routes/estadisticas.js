import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/estadisticas/goleadores
router.get('/goleadores', async (_req, res) => {
  try {
    const temporada = await prisma.temporada.findFirst({ where: { activa: true } });
    if (!temporada) return res.status(404).json({ error: 'No hay temporada activa' });

    const partidos = await prisma.partido.findMany({
      where: { temporadaId: temporada.id, jugado: true },
      include: {
        clubLocal: { select: { id: true, nombre: true, color1: true } },
        clubVisitante: { select: { id: true, nombre: true, color1: true } },
      },
    });

    // Aggregate scorers from eventos JSON
    const conteo = {};

    for (const partido of partidos) {
      const eventos = Array.isArray(partido.eventos) ? partido.eventos : [];
      for (const ev of eventos) {
        if (!ev.jugadorId) continue;
        const clubId = ev.equipo === 'local' ? partido.clubLocalId : partido.clubVisitanteId;
        const club = ev.equipo === 'local' ? partido.clubLocal : partido.clubVisitante;
        if (!conteo[ev.jugadorId]) {
          conteo[ev.jugadorId] = {
            jugadorId: ev.jugadorId,
            nombre: ev.jugadorNombre ?? 'Desconocido',
            clubId,
            clubNombre: club.nombre,
            clubColor: club.color1,
            tries: 0,
            penales: 0,
            drops: 0,
            puntos: 0,
          };
        }
        if (ev.tipo === 'try')   { conteo[ev.jugadorId].tries++;   conteo[ev.jugadorId].puntos += ev.puntos; }
        if (ev.tipo === 'penal') { conteo[ev.jugadorId].penales++; conteo[ev.jugadorId].puntos += ev.puntos; }
        if (ev.tipo === 'drop')  { conteo[ev.jugadorId].drops++;   conteo[ev.jugadorId].puntos += ev.puntos; }
      }
    }

    const lista = Object.values(conteo)
      .sort((a, b) => b.tries - a.tries || b.puntos - a.puntos)
      .slice(0, 20);

    res.json(lista);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/estadisticas/historial/:clubId
router.get('/historial/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId);
    const temporada = await prisma.temporada.findFirst({ where: { activa: true } });
    if (!temporada) return res.status(404).json({ error: 'No hay temporada activa' });

    const partidos = await prisma.partido.findMany({
      where: {
        temporadaId: temporada.id,
        jugado: true,
        OR: [{ clubLocalId: clubId }, { clubVisitanteId: clubId }],
      },
      include: {
        clubLocal: { select: { id: true, nombre: true, color1: true } },
        clubVisitante: { select: { id: true, nombre: true, color1: true } },
      },
      orderBy: { jornada: 'asc' },
    });

    const historial = partidos.map(p => {
      const esLocal = p.clubLocalId === clubId;
      const propios = esLocal ? p.puntosLocal : p.puntosVisitante;
      const contrarios = esLocal ? p.puntosVisitante : p.puntosLocal;
      const rival = esLocal ? p.clubVisitante : p.clubLocal;
      const resultado = propios > contrarios ? 'V' : propios === contrarios ? 'E' : 'D';
      return {
        id: p.id,
        jornada: p.jornada,
        rival,
        esLocal,
        propios,
        contrarios,
        resultado,
        triesPropios: esLocal ? p.triesLocal : p.triesVisitante,
        triesContrarios: esLocal ? p.triesVisitante : p.triesLocal,
      };
    });

    res.json(historial);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
