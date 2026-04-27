import axios from 'axios';

const api = axios.create({
  baseURL: 'https://rugby-manager-argentina.onrender.com/api',
  timeout: 30000,
});

export const getClubs          = () => api.get('/clubs').then(r => r.data);
export const getClub           = (id) => api.get(`/clubs/${id}`).then(r => r.data);
export const getJugadores      = (id) => api.get(`/clubs/${id}/jugadores`).then(r => r.data);
export const getTabla          = () => api.get('/temporada/tabla').then(r => r.data);
export const getJornadas       = () => api.get('/temporada/jornadas').then(r => r.data);
export const getJornada        = (n) => api.get(`/temporada/jornada/${n}`).then(r => r.data);
export const simularPartido    = (id) => api.post(`/partidos/${id}/simular`).then(r => r.data);
export const simularJornada    = (n) => api.post(`/partidos/jornada/${n}/simular`).then(r => r.data);
export const getClubs2         = () => api.get('/clubs').then(r => r.data);
export const getJugadoresClub  = (id) => api.get(`/clubs/${id}/jugadores`).then(r => r.data);
export const crearTransferencia = (data) => api.post('/transferencias', data).then(r => r.data);
