import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/transferencias/mercado
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

// GET /api/transferencias/ofertas/:clubId — ofertas recibidas para ese club
router.get('/ofertas/:clubId', async (req, res) => {
  try {
    const ofertas = await prisma.transferencia.findMany({
      where: { clubOrigenId: parseInt(req.params.clubId), estado: 'oferta' },
      include: {
        jugador: true,
        clubDestino: { select: { id: true, nombre: true, color1: true } },
      },
      orderBy: { fecha: 'desc' },
    });
    res.json(ofertas);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/transferencias/:clubId — historial
router.get('/:clubId', async (req, res) => {
  try {
    const transferencias = await prisma.transferencia.findMany({
      where: {
        estado: { not: 'oferta' },
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
      take: 30,
    });
    res.json(transferencias);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/transferencias — compra directa (jugador libre o de otro club)
router.post('/', async (req, res) => {
  try {
    const { jugadorId, clubDestinoId, monto } = req.body;
    const jugador = await prisma.jugador.findUniqueOrThrow({ where: { id: jugadorId } });

    const destino = await prisma.club.findUniqueOrThrow({ where: { id: clubDestinoId } });
    if (destino.presupuesto < parseFloat(monto)) {
      return res.status(400).json({ error: 'Presupuesto insuficiente' });
    }

    const transferencia = await prisma.transferencia.create({
      data: {
        jugadorId,
        clubOrigenId: jugador.clubId,
        clubDestinoId,
        monto: parseFloat(monto),
        estado: 'aprobada',
      },
    });

    await prisma.jugador.update({ where: { id: jugadorId }, data: { clubId: clubDestinoId, enVenta: false } });
    await prisma.club.update({ where: { id: clubDestinoId }, data: { presupuesto: { decrement: parseFloat(monto) } } });
    if (jugador.clubId) {
      await prisma.club.update({ where: { id: jugador.clubId }, data: { presupuesto: { increment: parseFloat(monto) } } });
    }

    res.status(201).json({ ...transferencia, estado: 'aprobada' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/transferencias/venta/:jugadorId — toggle en venta
router.put('/venta/:jugadorId', async (req, res) => {
  try {
    const jugador = await prisma.jugador.findUniqueOrThrow({ where: { id: parseInt(req.params.jugadorId) } });
    const actualizado = await prisma.jugador.update({
      where: { id: jugador.id },
      data: { enVenta: !jugador.enVenta },
    });
    res.json(actualizado);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/transferencias/:id/responder — aceptar o rechazar oferta
router.put('/:id/responder', async (req, res) => {
  try {
    const { accion } = req.body; // 'aceptar' | 'rechazar'
    const transferencia = await prisma.transferencia.findUniqueOrThrow({
      where: { id: parseInt(req.params.id) },
      include: { jugador: true, clubDestino: true },
    });

    if (transferencia.estado !== 'oferta') {
      return res.status(400).json({ error: 'Esta oferta ya fue procesada' });
    }

    if (accion === 'aceptar') {
      if (transferencia.clubDestino.presupuesto < transferencia.monto) {
        return res.status(400).json({ error: 'El club comprador ya no tiene presupuesto suficiente' });
      }
      await prisma.jugador.update({
        where: { id: transferencia.jugadorId },
        data: { clubId: transferencia.clubDestinoId, enVenta: false },
      });
      await prisma.club.update({ where: { id: transferencia.clubDestinoId }, data: { presupuesto: { decrement: transferencia.monto } } });
      if (transferencia.clubOrigenId) {
        await prisma.club.update({ where: { id: transferencia.clubOrigenId }, data: { presupuesto: { increment: transferencia.monto } } });
      }
      await prisma.transferencia.update({ where: { id: transferencia.id }, data: { estado: 'aprobada' } });
      // Noticia
      await prisma.noticia.create({
        data: {
          clubId: transferencia.clubOrigenId,
          tipo: 'mercado',
          texto: `Vendiste a ${transferencia.jugador.nombre} ${transferencia.jugador.apellido} por $${transferencia.monto.toLocaleString('es-AR')}.`,
        },
      });
      res.json({ ok: true, accion: 'aprobada' });
    } else {
      await prisma.transferencia.update({ where: { id: transferencia.id }, data: { estado: 'rechazada' } });
      res.json({ ok: true, accion: 'rechazada' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
