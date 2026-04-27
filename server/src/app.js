import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import clubsRouter from './routes/clubs.js';
import temporadaRouter from './routes/temporada.js';
import partidosRouter from './routes/partidos.js';
import transferenciasRouter from './routes/transferencias.js';
import formacionRouter from './routes/formacion.js';
import entrenamientoRouter from './routes/entrenamiento.js';
import noticiasRouter from './routes/noticias.js';
import estadisticasRouter from './routes/estadisticas.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['https://rugby-manager-argentina.vercel.app', 'http://localhost:5173'],
}));
app.use(express.json());

app.use('/api/clubs', clubsRouter);
app.use('/api/temporada', temporadaRouter);
app.use('/api/partidos', partidosRouter);
app.use('/api/transferencias', transferenciasRouter);
app.use('/api/formacion', formacionRouter);
app.use('/api/entrenamiento', entrenamientoRouter);
app.use('/api/noticias', noticiasRouter);
app.use('/api/estadisticas', estadisticasRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`🏉 Rugby Manager API corriendo en http://localhost:${PORT}`);
});
