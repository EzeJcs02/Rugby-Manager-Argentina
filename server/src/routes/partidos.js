import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { simularPartido, simularPartidoConFormacion, generarLesiones } from '../simulation/engine.js';

const router = Router();
const prisma = new PrismaClient();

async function aplicarLesiones(lesionados, jornada) {
  for (const l of lesionados) {
    await prisma.jugador.update({
      where: { id: l.jugadorId },
      data: { lesionadoHasta: jornada + l.jornadasFuera },
    });
  }
}

const MENSAJES_SPONSOR = [
  'Un nuevo sponsor firmó un acuerdo con el club',
  'El municipio aportó fondos para la infraestructura',
  'La asociación donó recursos para la pretemporada',
  'Un inversor local apoyó al club económicamente',
];
const MENSAJES_MORAL_ALTA = [
  'El equipo viene en un gran momento. ¡La moral está por las nubes!',
  'El vestuario está unido y la energía es increíble',
  'Los hinchas están empujando fuerte. ¡El grupo lo siente!',
];
const MENSAJES_MORAL_BAJA = [
  'Hay tensión interna en el vestuario. La moral bajó.',
  'El grupo está pasando un momento difícil esta semana.',
  'Las críticas de la prensa afectaron el estado de ánimo.',
];

async function generarOfertaRival(clubId, todosLosClubs) {
  // Un club rival hace oferta por uno de los mejores jugadores de este club
  const jugadores = await prisma.jugador.findMany({ where: { clubId, enVenta: false }, take: 20 });
  if (jugadores.length === 0) return;
  const jugador = jugadores[Math.floor(Math.random() * Math.min(jugadores.length, 8))];
  const rivales = todosLosClubs.filter(c => c.id !== clubId && c.presupuesto > jugador.valor * 0.8);
  if (rivales.length === 0) return;
  const rival = rivales[Math.floor(Math.random() * rivales.length)];
  const monto = Math.round(jugador.valor * (1.0 + Math.random() * 0.4));

  await prisma.transferencia.create({
    data: { jugadorId: jugador.id, clubOrigenId: clubId, clubDestinoId: rival.id, monto, estado: 'oferta' },
  });
  await prisma.noticia.create({
    data: {
      clubId,
      tipo: 'oferta',
      texto: `${rival.nombre} ofrece $${monto.toLocaleString('es-AR')} por ${jugador.nombre} ${jugador.apellido}.`,
    },
  });
}

async function generarNoticiasAleatorias(clubIds, jornada) {
  const todosLosClubs = await prisma.club.findMany();
  for (const clubId of clubIds) {
    const r = Math.random();

    if (r < 0.15) {
      // Evento sponsor
      const monto = (Math.floor(Math.random() * 10) + 5) * 10000;
      const texto = MENSAJES_SPONSOR[Math.floor(Math.random() * MENSAJES_SPONSOR.length)];
      await prisma.club.update({ where: { id: clubId }, data: { presupuesto: { increment: monto } } });
      await prisma.noticia.create({ data: { clubId, tipo: 'sponsor', texto: `${texto}. +${monto.toLocaleString('es-AR')} pesos.` } });
    } else if (r < 0.25) {
      // Moral alta
      const texto = MENSAJES_MORAL_ALTA[Math.floor(Math.random() * MENSAJES_MORAL_ALTA.length)];
      await prisma.jugador.updateMany({ where: { clubId }, data: { moral: { increment: 5 } } });
      await prisma.jugador.updateMany({ where: { clubId, moral: { gt: 99 } }, data: { moral: 99 } });
      await prisma.noticia.create({ data: { clubId, tipo: 'moral', texto } });
    } else if (r < 0.32) {
      // Moral baja
      const texto = MENSAJES_MORAL_BAJA[Math.floor(Math.random() * MENSAJES_MORAL_BAJA.length)];
      await prisma.jugador.updateMany({ where: { clubId }, data: { moral: { decrement: 5 } } });
      await prisma.jugador.updateMany({ where: { clubId, moral: { lt: 40 } }, data: { moral: 40 } });
      await prisma.noticia.create({ data: { clubId, tipo: 'moral', texto } });
    } else if (r < 0.40) {
      // Oferta de un rival por un jugador
      await generarOfertaRival(clubId, todosLosClubs);
    }
  }
}

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
    const lesionados = generarLesiones(resultado.titularesLocal ?? [], resultado.titularesVisitante ?? []);

    await Promise.all([
      prisma.partido.update({
        where: { id: partido.id },
        data: {
          jugado: true,
          puntosLocal: resultado.puntosLocal,
          puntosVisitante: resultado.puntosVisitante,
          triesLocal: resultado.triesLocal,
          triesVisitante: resultado.triesVisitante,
          eventos: resultado.eventos,
        },
      }),
      aplicarLesiones(lesionados, partido.jornada),
    ]);

    // Noticias de lesiones
    for (const l of lesionados) {
      const clubId = l.equipo === 'local' ? partido.clubLocalId : partido.clubVisitanteId;
      await prisma.noticia.create({
        data: {
          clubId,
          tipo: 'lesion',
          texto: `${l.jugadorNombre} se lesionó y estará fuera ${l.jornadasFuera} jornada(s).`,
        },
      });
    }

    const partidoActualizado = await prisma.partido.findUnique({
      where: { id: partido.id },
      include: {
        clubLocal: { select: { id: true, nombre: true, color1: true } },
        clubVisitante: { select: { id: true, nombre: true, color1: true } },
      },
    });

    res.json({ ...partidoActualizado, eventos: resultado.eventos, lesionados });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/partidos/jornada/:num/simular
router.post('/jornada/:num/simular', async (req, res) => {
  try {
    const temporada = await prisma.temporada.findFirst({ where: { activa: true } });
    if (!temporada) return res.status(404).json({ error: 'No hay temporada activa' });

    const jornada = parseInt(req.params.num);
    const partidos = await prisma.partido.findMany({
      where: { temporadaId: temporada.id, jornada, jugado: false },
    });

    if (partidos.length === 0) {
      return res.status(400).json({ error: 'Todos los partidos de esta jornada ya fueron jugados' });
    }

    const resultados = [];
    const clubsAfectados = new Set();

    for (const partido of partidos) {
      const [jugadoresLocal, jugadoresVisitante, formLocal, formVisitante] = await Promise.all([
        prisma.jugador.findMany({ where: { clubId: partido.clubLocalId } }),
        prisma.jugador.findMany({ where: { clubId: partido.clubVisitanteId } }),
        prisma.formacion.findUnique({ where: { clubId: partido.clubLocalId } }),
        prisma.formacion.findUnique({ where: { clubId: partido.clubVisitanteId } }),
      ]);

      const resultado = simularPartidoConFormacion(jugadoresLocal, jugadoresVisitante, formLocal ?? {}, formVisitante ?? {});
      const lesionados = generarLesiones(resultado.titularesLocal ?? [], resultado.titularesVisitante ?? []);

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

      await aplicarLesiones(lesionados, jornada);

      for (const l of lesionados) {
        const clubId = l.equipo === 'local' ? partido.clubLocalId : partido.clubVisitanteId;
        await prisma.noticia.create({
          data: { clubId, tipo: 'lesion', texto: `${l.jugadorNombre} se lesionó y estará fuera ${l.jornadasFuera} jornada(s).` },
        });
      }

      clubsAfectados.add(partido.clubLocalId);
      clubsAfectados.add(partido.clubVisitanteId);
      resultados.push({ ...actualizado, eventos: resultado.eventos, lesionados });
    }

    await generarNoticiasAleatorias([...clubsAfectados], jornada);

    res.json(resultados);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
