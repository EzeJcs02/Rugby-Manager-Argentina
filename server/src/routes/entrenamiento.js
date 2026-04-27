import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const FOCOS = {
  scrum:    ['scrum', 'potencia'],
  lineout:  ['lineout', 'potencia'],
  defensa:  ['tackle', 'motor'],
  backs:    ['pase', 'vision', 'velocidad'],
  fisico:   ['potencia', 'motor', 'velocidad'],
  pie:      ['pie', 'vision'],
};

const COSTO_BASE = 30000;

// POST /api/entrenamiento
// body: { clubId, foco, jugadorIds }
router.post('/', async (req, res) => {
  try {
    const { clubId, foco, jugadorIds } = req.body;
    if (!FOCOS[foco]) return res.status(400).json({ error: 'Foco de entrenamiento inválido' });

    const club = await prisma.club.findUniqueOrThrow({ where: { id: clubId } });
    const costo = COSTO_BASE * jugadorIds.length;

    if (club.presupuesto < costo) {
      return res.status(400).json({ error: `Presupuesto insuficiente. Necesitás $${costo.toLocaleString()}` });
    }

    const attrs = FOCOS[foco];
    const mejoras = [];

    for (const jugadorId of jugadorIds) {
      const jugador = await prisma.jugador.findUnique({ where: { id: jugadorId } });
      if (!jugador || jugador.clubId !== clubId) continue;

      const update = {};
      for (const attr of attrs) {
        const actual = jugador[attr];
        const maxPorEdad = jugador.edad <= 24 ? 99 : jugador.edad <= 29 ? 95 : 90;
        const mejora = actual >= maxPorEdad ? 0 : Math.floor(Math.random() * 3) + 1;
        update[attr] = Math.min(actual + mejora, maxPorEdad);
      }
      update.moral = Math.min(jugador.moral + 5, 99);

      await prisma.jugador.update({ where: { id: jugadorId }, data: update });
      mejoras.push({ jugadorId, nombre: `${jugador.nombre} ${jugador.apellido}`, mejoras: update });
    }

    await prisma.club.update({
      where: { id: clubId },
      data: { presupuesto: club.presupuesto - costo },
    });

    res.json({ costo, foco, mejoras });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
