import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { simularPartidoConFormacion } from '../simulation/engine.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/formacion/:clubId
router.get('/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId);
    let formacion = await prisma.formacion.findUnique({ where: { clubId } });
    if (!formacion) {
      formacion = await prisma.formacion.create({ data: { clubId, datos: {}, tactica: 'neutro' } });
    }
    res.json(formacion);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/formacion/:clubId
router.put('/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId);
    const { datos, tactica } = req.body;
    const formacion = await prisma.formacion.upsert({
      where: { clubId },
      update: { datos, tactica },
      create: { clubId, datos, tactica },
    });
    res.json(formacion);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
