import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import clubsRouter from './routes/clubs.js';
import temporadaRouter from './routes/temporada.js';
import partidosRouter from './routes/partidos.js';
import transferenciasRouter from './routes/transferencias.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL, 'http://localhost:5173'] : true,
}));
app.use(express.json());

app.use('/api/clubs', clubsRouter);
app.use('/api/temporada', temporadaRouter);
app.use('/api/partidos', partidosRouter);
app.use('/api/transferencias', transferenciasRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`🏉 Rugby Manager API corriendo en http://localhost:${PORT}`);
});
