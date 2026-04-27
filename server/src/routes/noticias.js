import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/noticias/:clubId
router.get('/:clubId', async (req, res) => {
  try {
    const noticias = await prisma.noticia.findMany({
      where: { clubId: parseInt(req.params.clubId) },
      orderBy: { fecha: 'desc' },
      take: 30,
    });
    res.json(noticias);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/noticias/:id/leer
router.put('/:id/leer', async (req, res) => {
  try {
    await prisma.noticia.update({ where: { id: parseInt(req.params.id) }, data: { leida: true } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/noticias/leer-todas/:clubId
router.put('/leer-todas/:clubId', async (req, res) => {
  try {
    await prisma.noticia.updateMany({
      where: { clubId: parseInt(req.params.clubId), leida: false },
      data: { leida: true },
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
