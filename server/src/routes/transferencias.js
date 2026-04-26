import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/transferencias — jugadores libres (sin club)
router.get('/mercado', async (_req, res) => {
  try {
    const jugadores = await prisma.jugador.findMany({
      where: { clubId: null },
      orderBy: { valor: 'desc' },
    });
    res.json(jugadores);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/transferencias/:clubId
router.get('/:clubId', async (req, res) => {
  try {
    const transferencias = await prisma.transferencia.findMany({
      where: {
        OR: [
          { clubOrigenId: parseInt(req.params.clubId) },
          { clubDestinoId: parseInt(req.params.clubId) },
        ],
      },
      include: {
        jugador: true,
        clubOrigen: { select: { nombre: true } },
        clubDestino: { select: { nombre: true } },
      },
      orderBy: { fecha: 'desc' },
      take: 20,
    });
    res.json(transferencias);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/transferencias — iniciar oferta
router.post('/', async (req, res) => {
  try {
    const { jugadorId, clubDestinoId, monto } = req.body;

    const jugador = await prisma.jugador.findUniqueOrThrow({ where: { id: jugadorId } });

    const transferencia = await prisma.transferencia.create({
      data: {
        jugadorId,
        clubOrigenId: jugador.clubId,
        clubDestinoId,
        monto: parseFloat(monto),
        estado: 'pendiente',
      },
      include: { jugador: true, clubDestino: { select: { nombre: true } } },
    });

    // Transferencia directa: mover jugador al nuevo club
    await prisma.jugador.update({
      where: { id: jugadorId },
      data: { clubId: clubDestinoId },
    });
    await prisma.transferencia.update({
      where: { id: transferencia.id },
      data: { estado: 'aprobada' },
    });

    res.status(201).json({ ...transferencia, estado: 'aprobada' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
