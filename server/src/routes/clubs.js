import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/clubs
router.get('/', async (_req, res) => {
  try {
    const clubs = await prisma.club.findMany({
      include: { _count: { select: { jugadores: true } } },
      orderBy: { reputacion: 'desc' },
    });
    res.json(clubs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/clubs/:id
router.get('/:id', async (req, res) => {
  try {
    const club = await prisma.club.findUniqueOrThrow({
      where: { id: parseInt(req.params.id) },
      include: {
        jugadores: { orderBy: [{ posicion: 'asc' }, { numero: 'asc' }] },
        _count: { select: { jugadores: true } },
      },
    });
    res.json(club);
  } catch (e) {
    res.status(404).json({ error: 'Club no encontrado' });
  }
});

// GET /api/clubs/:id/jugadores
router.get('/:id/jugadores', async (req, res) => {
  try {
    const jugadores = await prisma.jugador.findMany({
      where: { clubId: parseInt(req.params.id) },
      orderBy: [{ numero: 'asc' }, { apellido: 'asc' }],
    });
    res.json(jugadores);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
