import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
});

export const getClubs = () => api.get('/clubs').then(r => r.data);
export const getClub = (id) => api.get(`/clubs/${id}`).then(r => r.data);
export const getJugadores = (clubId) => api.get(`/clubs/${clubId}/jugadores`).then(r => r.data);

export const getTemporadaActiva = () => api.get('/temporada/activa').then(r => r.data);
export const getTabla = () => api.get('/temporada/tabla').then(r => r.data);
export const getJornada = (num) => api.get(`/temporada/jornada/${num}`).then(r => r.data);
export const getJornadas = () => api.get('/temporada/jornadas').then(r => r.data);

export const simularPartido = (id) => api.post(`/partidos/${id}/simular`).then(r => r.data);
export const simularJornada = (num) => api.post(`/partidos/jornada/${num}/simular`).then(r => r.data);

export const getMercado = () => api.get('/transferencias/mercado').then(r => r.data);
export const getTransferencias = (clubId) => api.get(`/transferencias/${clubId}`).then(r => r.data);
export const crearTransferencia = (data) => api.post('/transferencias', data).then(r => r.data);

export const getFormacion = (clubId) => api.get(`/formacion/${clubId}`).then(r => r.data);
export const guardarFormacion = (clubId, data) => api.put(`/formacion/${clubId}`, data).then(r => r.data);

export const entrenar = (data) => api.post('/entrenamiento', data).then(r => r.data);

export const finalizarTemporada = () => api.post('/temporada/finalizar').then(r => r.data);
